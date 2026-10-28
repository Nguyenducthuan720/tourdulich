const express = require('express');
const router = express.Router();
const sql = require('mssql');
const {
    getChatCollection,
    buildNewSession,
    normalizeBehavior,
} = require('../config/mongodb');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const aiKey = process.env.GEMINI_API_KEY || '';
const CHAT_MODEL_NAME = process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash';
const ANALYSIS_MODEL_NAME = process.env.GEMINI_ANALYSIS_MODEL || 'gemini-2.5-flash-lite';

let chatModel = null;
let analysisModel = null;

if (aiKey) {
    const ai = new GoogleGenerativeAI(aiKey);
    chatModel = ai.getGenerativeModel({ model: CHAT_MODEL_NAME });
    analysisModel = ai.getGenerativeModel({ model: ANALYSIS_MODEL_NAME });
    console.log(`Đã khởi tạo Gemini: chat=${CHAT_MODEL_NAME}, analysis=${ANALYSIS_MODEL_NAME}`);
} else {
    console.warn('Chưa có GEMINI_API_KEY trong .env. Vui lòng thêm key để sử dụng AI!');
}

const FALLBACK_REPLY =
    'Chào bạn, hệ thống AI đang được bảo trì trong giây lát. Vui lòng thử lại sau!';
const RATE_LIMIT_REPLY =
    'TravelAI đang nhận quá nhiều câu hỏi nên tạm nghỉ một chút. Bạn vui lòng thử lại sau ít phút nhé!';
const HISTORY_LIMIT = 10;

// Ngắt mạch khi hết quota: tạm dừng phân tích hành vi để tiết kiệm request
let analysisDisabledUntil = 0;
const ANALYSIS_COOLDOWN_MS = 10 * 60 * 1000;

/** Phân loại lỗi Gemini để trả thông báo đúng cho khách */
function classifyAiError(error) {
    const msg = String(error?.message || '');
    const status = error?.status;
    const isQuota =
        status === 429 ||
        msg.includes('429') ||
        /quota|rate.?limit|too many requests/i.test(msg);

    if (isQuota) {
        const retryMatch = msg.match(/retry in ([\d.]+)s/i);
        const delayMatch = msg.match(/"retryDelay":"(\d+)s"/);
        const retryAfter = retryMatch
            ? Math.ceil(Number(retryMatch[1]))
            : delayMatch
              ? Number(delayMatch[1])
              : 30;
        return { type: 'quota', retryAfter };
    }
    if (status === 400 && /api key not valid|invalid api key/i.test(msg)) {
        return { type: 'badKey' };
    }
    if (msg.includes('SAFETY') || msg.includes('blocked')) {
        return { type: 'blocked' };
    }
    return { type: 'unknown' };
}

// ===================== HELPERS =====================

const detectDevice = (userAgent = '') =>
    /Mobile|Android|iPhone/i.test(userAgent) ? 'Mobile' : 'Desktop';

const cleanIp = (ip = '') => String(ip).replace('::ffff:', '').replace('::1', '127.0.0.1') || '127.0.0.1';

/** Gemini yêu cầu history bắt đầu bằng 'user' và luân phiên user/model */
function toGeminiHistory(conversations = []) {
    const history = [];
    for (const c of conversations) {
        const role = c.sender === 'user' ? 'user' : 'model';
        const text = String(c.message || '').trim();
        if (!text) continue;

        if (history.length === 0) {
            if (role !== 'user') continue; // bỏ qua assistant mở đầu
            history.push({ role, parts: [{ text }] });
            continue;
        }

        const last = history[history.length - 1];
        if (last.role === role) {
            last.parts[0].text += `\n${text}`; // gộp 2 tin cùng vai
        } else {
            history.push({ role, parts: [{ text }] });
        }
    }
    // Gemini cần history kết thúc bằng model để gửi message mới
    if (history.length && history[history.length - 1].role === 'user') {
        history.push({ role: 'model', parts: [{ text: 'Vâng, tôi đang lắng nghe.' }] });
    }
    return history.slice(-HISTORY_LIMIT);
}

async function getSession(sessionId) {
    return getChatCollection().findOne({ session_id: sessionId });
}

async function upsertSessionMeta({ sessionId, userId, ipAddress, device }) {
    const col = getChatCollection();
    const existing = await col.findOne({ session_id: sessionId });
    if (!existing) {
        const doc = buildNewSession({ sessionId, userId, ipAddress, device });
        doc.conversations = [];
        await col.insertOne(doc);
    }
}

async function saveMessages(sessionId, userMessage, assistantMessage, meta) {
    const col = getChatCollection();
    const now = new Date();
    await col.updateOne(
        { session_id: sessionId },
        {
            $set: {
                user_id: meta.userId ?? null,
                'meta_data.ip_address': meta.ipAddress,
                'meta_data.device': meta.device,
                last_updated: now,
            },
            $push: {
                conversations: {
                    $each: [
                        { sender: 'user', message: userMessage, timestamp: now },
                        { sender: 'assistant', message: assistantMessage, timestamp: now },
                    ],
                },
            },
        },
        { upsert: true }
    );
}

/** Lưu kết quả phân tích hành vi: CỘNG DỒN với dữ liệu đã có, không ghi đè */
async function saveBehavior(sessionId, incoming) {
    const col = getChatCollection();
    const session = await col.findOne(
        { session_id: sessionId },
        { projection: { extracted_behavior: 1 } }
    );

    const existing = normalizeBehavior(session?.extracted_behavior || {});
    const next = normalizeBehavior(incoming || {});

    const dedupe = (arr) => {
        const seen = new Set();
        return arr.filter((v) => {
            const key = String(v).trim().toLowerCase();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    };

    const merged = {
        preferred_destinations: dedupe([...existing.preferred_destinations, ...next.preferred_destinations]).slice(0, 12),
        inferred_tags: dedupe([...existing.inferred_tags, ...next.inferred_tags]).slice(0, 12),
        // giữ giá trị cũ nếu lần này không trích xuất được
        max_budget_detected: next.max_budget_detected ?? existing.max_budget_detected,
        duration_days_detected: next.duration_days_detected ?? existing.duration_days_detected,
    };

    const set = {};
    for (const [k, v] of Object.entries(merged)) {
        set[`extracted_behavior.${k}`] = v;
    }
    await col.updateOne({ session_id: sessionId }, { $set: set });
    return merged;
}

/** RAG: lấy tour khớp từ khoá (bỏ dấu để "Da Nang" khớp "Đà Nẵng") */
async function searchTours(keyword) {
    try {
        const request = new sql.Request();
        request.input('SearchTerm', sql.NVarChar, `%${String(keyword).trim()}%`);
        const result = await request.query(`
            SELECT TOP 3 TourID, TourName, DepartureLocation, Destination, Duration, Price, Description
            FROM Tours
            WHERE Status = 1 AND (
                TourName COLLATE SQL_Latin1_General_CP1_CI_AI LIKE @SearchTerm
                OR Destination COLLATE SQL_Latin1_General_CP1_CI_AI LIKE @SearchTerm
                OR Description COLLATE SQL_Latin1_General_CP1_CI_AI LIKE @SearchTerm
            )
        `);
        return result.recordset;
    } catch (err) {
        console.error('⚠ Lỗi truy vấn bảng Tours từ SQL:', err.message);
        return [];
    }
}

async function getHotTours(limit = 2) {
    try {
        const result = await new sql.Request().query(`
            SELECT TOP ${Math.max(1, Math.min(5, limit))} TourName, Destination, Duration, Price
            FROM Tours WHERE Status = 1 ORDER BY TourID
        `);
        return result.recordset;
    } catch (err) {
        console.error('⚠ Lỗi truy vấn tour đề xuất:', err.message);
        return [];
    }
}

async function getSchedules(tourId) {
    try {
        const request = new sql.Request();
        request.input('TourID', sql.Int, tourId);
        const result = await request.query(
            'SELECT DayNumber, Activity FROM Schedules WHERE TourID = @TourID ORDER BY DayNumber ASC'
        );
        return result.recordset;
    } catch (err) {
        console.error(`⚠ Lỗi lấy Schedules của Tour ${tourId}:`, err.message);
        return [];
    }
}

function formatToursBlock(tours, schedulesMap = {}) {
    let text = '';
    for (const tour of tours) {
        text += `\n- [Mã Tour: ${tour.TourID}] ${tour.TourName}\n`;
        text += `  + Khởi hành: ${tour.DepartureLocation} -> ${tour.Destination}\n`;
        text += `  + Thời gian: ${tour.Duration} | Giá: ${Number(tour.Price).toLocaleString('vi-VN')} VND\n`;
        text += `  + Mô tả: ${tour.Description}\n`;
        const days = schedulesMap[tour.TourID] || [];
        if (days.length) {
            text += `  + Lịch trình chi tiết:\n`;
            days.forEach((d) => {
                text += `    * Ngày ${d.DayNumber}: ${d.Activity}\n`;
            });
        }
    }
    return text;
}

/** Gợi ý tour dựa trên hành vi đã trích xuất (ưu tiên điểm đến > sở thích > ngân sách) */
async function recommendTours(behavior, limit = 6) {
    const { preferred_destinations = [], max_budget_detected, inferred_tags = [] } = behavior || {};
    try {
        const request = new sql.Request();
        const anyConditions = [];
        const scoreParts = [];

        // Bỏ dấu để "Da Nang" vẫn khớp "Đà Nẵng"
        const AI = 'COLLATE SQL_Latin1_General_CP1_CI_AI';

        preferred_destinations.forEach((d, i) => {
            request.input(`d${i}`, sql.NVarChar, `%${d}%`);
            anyConditions.push(`Destination ${AI} LIKE @d${i}`, `TourName ${AI} LIKE @d${i}`);
            scoreParts.push(`CASE WHEN Destination ${AI} LIKE @d${i} THEN 100 ELSE 0 END`);
        });

        inferred_tags.forEach((t, i) => {
            request.input(`t${i}`, sql.NVarChar, `%${t}%`);
            anyConditions.push(`TourName ${AI} LIKE @t${i}`, `Description ${AI} LIKE @t${i}`);
            scoreParts.push(`CASE WHEN (TourName ${AI} LIKE @t${i} OR Description ${AI} LIKE @t${i}) THEN 20 ELSE 0 END`);
        });

        if (max_budget_detected) {
            request.input('budget', sql.Decimal(15, 2), max_budget_detected);
            anyConditions.push('Price <= @budget');
            scoreParts.push('CASE WHEN Price <= @budget THEN 10 ELSE 0 END');
        }

        request.input('limit', sql.Int, Math.max(1, Math.min(12, limit)));

        const scoreExpr = scoreParts.length ? scoreParts.join(' + ') : '0';
        const whereExpr = anyConditions.length ? `AND (${anyConditions.join(' OR ')})` : '';

        const result = await request.query(`
            SELECT TOP (@limit)
                TourID, TourName, Destination, Duration, Price, ImageURL,
                (${scoreExpr}) AS MatchScore
            FROM Tours
            WHERE Status = 1 ${whereExpr}
            ORDER BY MatchScore DESC, Price ASC
        `);
        return result.recordset;
    } catch (err) {
        console.error('⚠ Lỗi gợi ý tour cá nhân hoá:', err.message);
        return [];
    }
}

// ===================== ROUTES =====================

/**
 * POST /api/ai/chat — chat + RAG + lưu MongoDB
 */
router.post('/chat', async (req, res) => {
    const { session_id, user_id, message } = req.body;

    const ipAddress = cleanIp(
        (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip
    );
    const device = detectDevice(req.headers['user-agent']);

    if (!session_id || !message) {
        return res.status(400).json({ error: 'Vui lòng cung cấp session_id và message' });
    }

    try {
        let customerName = 'khách hàng';

        // --- Lấy tên khách + hành vi đã lưu của phiên ---
        if (user_id) {
            try {
                const userRequest = new sql.Request();
                userRequest.input('UserID', sql.Int, user_id);
                const userResult = await userRequest.query(
                    'SELECT FullName FROM Users WHERE UserID = @UserID'
                );
                if (userResult.recordset.length) customerName = userResult.recordset[0].FullName;
            } catch (userErr) {
                console.error('⚠ Lỗi lấy tên khách từ SQL Server:', userErr.message);
            }
        }

        let session = null;
        try {
            session = await getSession(session_id);
        } catch (mongoErr) {
            console.error('⚠ Không đọc được phiên chat từ MongoDB:', mongoErr.message);
        }

        const savedBehavior = session?.extracted_behavior || null;
        const previousConversations = session?.conversations || [];

        // --- RAG: tìm tour theo câu hỏi ---
        let contextTours = '';
        const tours = await searchTours(message);

        if (tours.length) {
            const schedulesMap = {};
            for (const tour of tours) {
                schedulesMap[tour.TourID] = await getSchedules(tour.TourID);
            }
            contextTours =
                'Danh sách Tour khớp yêu cầu của khách trên hệ thống:\n' +
                formatToursBlock(tours, schedulesMap);
        } else {
            const hot = await getHotTours(2);
            contextTours = 'Không khớp tour cụ thể. Hãy gợi ý cho khách những tour hot nhất hiện có:\n';
            hot.forEach((t) => {
                contextTours += `- ${t.TourName} đi ${t.Destination} (${t.Duration}) - Giá: ${Number(t.Price).toLocaleString('vi-VN')} VND\n`;
            });
        }

        // --- Bổ sung sở thích đã ghi nhớ để tư vấn sát hơn ---
        let behaviorBlock = '';
        if (savedBehavior) {
            const parts = [];
            if (savedBehavior.preferred_destinations?.length)
                parts.push(`điểm đến quan tâm: ${savedBehavior.preferred_destinations.join(', ')}`);
            if (savedBehavior.max_budget_detected)
                parts.push(`ngân sách khoảng ${Number(savedBehavior.max_budget_detected).toLocaleString('vi-VN')} VND`);
            if (savedBehavior.duration_days_detected)
                parts.push(`thời lượng khoảng ${savedBehavior.duration_days_detected} ngày`);
            if (savedBehavior.inferred_tags?.length)
                parts.push(`sở thích: ${savedBehavior.inferred_tags.join(', ')}`);
            if (parts.length) behaviorBlock = `\n[SỞ THÍCH ĐÃ GHI NHẬN CỦA KHÁCH]: ${parts.join('; ')}.\n`;
        }

        // --- Gọi Gemini (có context hội thoại nhiều lượt) ---
        let aiReply = FALLBACK_REPLY;
        let aiErrorType = null;

        if (chatModel) {
            const systemInstruction =
                `Bạn là 'TravelAI' - Trợ lý tư vấn tour du lịch thông minh, thân thiện. Bạn đang trò chuyện trực tiếp với khách hàng: ${customerName}.\n` +
                `Nhiệm vụ: Dựa hoàn toàn vào [DỮ LIỆU TOUR TỪ HỆ THỐNG] bên dưới để tư vấn. Tuyệt đối không tự bịa thông tin tour, địa điểm hay giá cả nằm ngoài dữ liệu được cung cấp.\n` +
                `Nếu không có tour nào phù hợp, hãy nói thật là chưa có và gợi ý khách điều chỉnh tiêu chí.\n`;

            const prompt =
                `${systemInstruction}${behaviorBlock}\n[DỮ LIỆU TOUR TỪ HỆ THỐNG]:\n${contextTours}\n\n` +
                `[CÂU HỎI KHÁCH HÀNG]: ${message}\n\nHãy trả lời lịch thiệp, sinh động và rõ ý:`;

            try {
                const chat = chatModel.startChat({ history: toGeminiHistory(previousConversations) });
                const result = await chat.sendMessage(prompt);
                const text = result.response.text();
                if (text && text.trim()) aiReply = text.trim();
            } catch (aiErr) {
                const info = classifyAiError(aiErr);
                aiErrorType = info.type;
                console.error(`✘ Lỗi gọi Gemini [${info.type}]:`, aiErr.message?.slice(0, 220));

                if (info.type === 'quota') {
                    aiReply = RATE_LIMIT_REPLY;
                    // Hết quota → tạm dừng phân tích hành vi để tiết kiệm request
                    analysisDisabledUntil = Date.now() + ANALYSIS_COOLDOWN_MS;
                } else if (info.type === 'blocked') {
                    aiReply =
                        'Xin lỗi, tôi chưa thể trả lời câu hỏi này. Bạn thử diễn đạt lại hoặc hỏi về tour du lịch nhé!';
                }
            }
        }

        // --- Lưu phiên chat (đủ cấu trúc chuẩn) ---
        try {
            await upsertSessionMeta({ sessionId: session_id, userId: user_id ?? null, ipAddress, device });
            await saveMessages(session_id, message, aiReply, {
                userId: user_id ? Number(user_id) : null,
                ipAddress,
                device,
            });
        } catch (mongoErr) {
            console.error('⚠ Lỗi ghi nhật ký chat vào MongoDB:', mongoErr.message);
        }

        // --- Phân tích hành vi ngầm (dùng model riêng + ngắt mạch khi hết quota) ---
        if (analysisModel && Date.now() > analysisDisabledUntil) {
            (async () => {
                try {
                    const analysisPrompt =
                        `Dựa vào câu nói của khách: '${message}', hãy phân tích hành vi và mong muốn rồi xuất JSON chuẩn (không bọc markdown):\n` +
                        `{\n  "preferred_destinations": ["địa_điểm_1"],\n  "max_budget_detected": 4000000,\n  "duration_days_detected": 4,\n  "inferred_tags": ["thể_loại_1"]\n}\n` +
                        `Lưu ý: max_budget_detected và duration_days_detected là số nguyên, không phân tích được thì null. Các mảng là mảng chuỗi, trống thì [].`;
                    const result = await analysisModel.generateContent(analysisPrompt);
                    const raw = result.response.text().replace(/```json|```/g, '').trim();
                    await saveBehavior(session_id, JSON.parse(raw));
                } catch (err) {
                    const info = classifyAiError(err);
                    if (info.type === 'quota') {
                        analysisDisabledUntil = Date.now() + ANALYSIS_COOLDOWN_MS;
                        console.warn(
                            `⚠ Phân tích hành vi tạm dừng ${ANALYSIS_COOLDOWN_MS / 60000} phút do hết quota AI.`
                        );
                    } else {
                        console.error('✘ Lỗi phân tích hành vi AI ngầm:', err.message?.slice(0, 200));
                    }
                }
            })();
        }

        return res.json({ reply: aiReply, session_id });
    } catch (error) {
        console.error('✘ Lỗi luồng xử lý API AI Chat:', error.message);
        return res.status(500).json({ error: 'Lỗi hệ thống khi xử lý dịch vụ AI.' });
    }
});

/**
 * GET /api/ai/history/:sessionId — khôi phục lịch sử hội thoại
 */
router.get('/history/:sessionId', async (req, res) => {
    try {
        const session = await getSession(req.params.sessionId);
        if (!session) {
            return res.json({ session_id: req.params.sessionId, conversations: [], extracted_behavior: null });
        }
        res.json({
            session_id: session.session_id,
            user_id: session.user_id,
            conversations: session.conversations || [],
            meta_data: session.meta_data,
            extracted_behavior: session.extracted_behavior,
            last_updated: session.last_updated,
        });
    } catch (error) {
        console.error('✘ Lỗi lấy lịch sử chat:', error.message);
        res.status(500).json({ error: 'Không lấy được lịch sử hội thoại' });
    }
});

/**
 * GET /api/ai/recommend/:sessionId — gợi ý tour theo hành vi đã ghi nhận
 */
router.get('/recommend/:sessionId', async (req, res) => {
    try {
        const session = await getSession(req.params.sessionId);
        const behavior = session?.extracted_behavior || null;
        const tours = await recommendTours(behavior, Number(req.query.limit) || 6);
        res.json({ session_id: req.params.sessionId, based_on: behavior, items: tours });
    } catch (error) {
        console.error('✘ Lỗi gợi ý tour:', error.message);
        res.status(500).json({ error: 'Không lấy được gợi ý tour' });
    }
});

/**
 * DELETE /api/ai/session/:sessionId — xoá một phiên chat
 */
router.delete('/session/:sessionId', async (req, res) => {
    try {
        const result = await getChatCollection().deleteOne({ session_id: req.params.sessionId });
        if (!result.deletedCount) {
            return res.status(404).json({ error: 'Không tìm thấy phiên chat' });
        }
        res.json({ success: true, message: 'Đã xoá phiên chat' });
    } catch (error) {
        console.error('✘ Lỗi xoá phiên chat:', error.message);
        res.status(500).json({ error: 'Không xoá được phiên chat' });
    }
});

module.exports = router;
