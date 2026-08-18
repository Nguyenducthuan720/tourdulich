const express = require('express');
const router = express.Router();
const sql = require('mssql'); // Kết nối SQL Server của bạn
const { getMongoDB } = require('../config/mongodb'); // Lấy kết nối MongoDB Compass
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Khởi tạo Google Gemini AI chính xác theo chuẩn SDK mới nhất
const aiKey = process.env.GEMINI_API_KEY || '';
let aiModel = null;

if (aiKey) {
    const ai = new GoogleGenerativeAI(aiKey);
    // CHÚ Ý SỬA LỖI: Sử dụng 'gemini-2.5-flash' để sửa triệt để lỗi 404 API Not Found
    aiModel = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('Đã khởi tạo thành công Google Gemini AI Model (gemini-2.5-flash)!');
} else {
    console.warn('Chưa có GEMINI_API_KEY trong .env. Vui lòng thêm key để sử dụng AI!');
}

/**
 * @route   POST /api/ai/chat
 * @desc    Xử lý chat, tìm kiếm RAG từ SQL Server và lưu đúng cấu trúc yêu cầu vào MongoDB Compass
 */
router.post('/chat', async (req, res) => {
    const { session_id, user_id, message } = req.body;

    // Lấy thông tin IP và Thiết bị tự động từ Request gửi lên
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';
    const deviceType = /Mobile|Android|iPhone/i.test(userAgent) ? 'Mobile' : 'Desktop';

    if (!session_id || !message) {
        return res.status(400).json({ error: 'Vui lòng cung cấp session_id và message' });
    }

    try {
        let customerName = 'khách hàng';
        let contextTours = '';

        // --- BƯỚC 1: Lấy tên người dùng từ SQL Server để AI chào hỏi thân thiện ---
        if (user_id) {
            try {
                const userRequest = new sql.Request();
                userRequest.input('UserID', sql.Int, user_id);
                const userResult = await userRequest.query('SELECT FullName FROM Users WHERE UserID = @UserID');
                if (userResult.recordset.length > 0) {
                    customerName = userResult.recordset[0].FullName;
                }
            } catch (userErr) {
                console.error('⚠ Lỗi lấy tên khách từ SQL Server:', userErr.message);
                // Vẫn tiếp tục chạy nếu lỗi bảng Users
            }
        }

        // --- BƯỚC 2: RAG - Truy vấn thông tin Tour thật từ SQL Server ---
        let tours = [];
        try {
            const tourRequest = new sql.Request();
            const searchTerm = `%${message.trim()}%`;
            tourRequest.input('SearchTerm', sql.NVarChar, searchTerm);
            
            const tourResult = await tourRequest.query(`
                SELECT TOP 3 TourID, TourName, DepartureLocation, Destination, Duration, Price, Description 
                FROM Tours 
                WHERE Status = 1 AND (TourName LIKE @SearchTerm OR Destination LIKE @SearchTerm OR Description LIKE @SearchTerm)
            `);
            tours = tourResult.recordset;
        } catch (tourSqlErr) {
            console.error('⚠ Lỗi truy vấn bảng Tours từ SQL:', tourSqlErr.message);
        }

        if (tours && tours.length > 0) {
            contextTours = `Danh sách Tour khớp yêu cầu của khách trên hệ thống:\n`;
            for (let tour of tours) {
                contextTours += `\n- [Mã Tour: ${tour.TourID}] ${tour.TourName}\n`;
                contextTours += `  + Nơi khởi hành: ${tour.DepartureLocation} -> Đến: ${tour.Destination}\n`;
                contextTours += `  + Thời gian: ${tour.Duration} | Giá: ${tour.Price.toLocaleString('vi-VN')} VND\n`;
                contextTours += `  + Mô tả: ${tour.Description}\n`;

                // Lấy lịch trình chi tiết từng ngày
                try {
                    const scheduleRequest = new sql.Request();
                    scheduleRequest.input('TourID', sql.Int, tour.TourID);
                    const scheduleResult = await scheduleRequest.query(`
                        SELECT DayNumber, Activity FROM Schedules WHERE TourID = @TourID ORDER BY DayNumber ASC
                    `);
                    if (scheduleResult.recordset.length > 0) {
                        contextTours += `  + Lịch trình chi tiết:\n`;
                        scheduleResult.recordset.forEach(day => {
                            contextTours += `    * Ngày ${day.DayNumber}: ${day.Activity}\n`;
                        });
                    }
                } catch (schedErr) {
                    console.error(`⚠ Lỗi lấy Schedules của Tour ${tour.TourID}:`, schedErr.message);
                }
            }
        } else {
            // Đề xuất tour nổi bật nếu khách hàng chat chung chung hoặc không khớp từ khóa địa điểm
            try {
                const fallbackResult = await new sql.Request().query(`
                    SELECT TOP 2 TourName, Destination, Duration, Price FROM Tours WHERE Status = 1
                `);
                contextTours = "Không khớp tour cụ thể. Hãy gợi ý cho khách những tour hot nhất hiện có:\n";
                fallbackResult.recordset.forEach(tour => {
                    contextTours += `- ${tour.TourName} đi ${tour.Destination} (${tour.Duration}) - Giá: ${tour.Price.toLocaleString('vi-VN')} VND\n`;
                });
            } catch (fallbackSqlErr) {
                console.error('⚠ Lỗi truy vấn tour đề xuất:', fallbackSqlErr.message);
            }
        }

        // --- BƯỚC 3: Gửi ngữ cảnh đến Gemini AI để tạo câu trả lời tự nhiên ---
        let aiReply = "Chào bạn, hệ thống AI đang được bảo trì trong giây lát. Vui lòng thử lại sau!";
        if (aiModel) {
            const systemInstruction = (
                `Bạn là 'TravelAI' - Trợ lý tư vấn tour du lịch thông minh, thân thiện. Bạn đang trò chuyện trực tiếp với khách hàng: ${customerName}.\n` +
                `Nhiệm vụ: Dựa hoàn toàn vào [DỮ LIỆU TOUR TỪ HỆ THỐNG] bên dưới để tư vấn. Tuyệt đối không tự bịa thông tin tour, địa điểm hay giá cả nằm ngoài dữ liệu được cung cấp.\n\n`
            );

            const prompt = `${systemInstruction}\n[DỮ LIỆU TOUR TỪ HỆ THỐNG]:\n${contextTours}\n\n[CÂU HỎI KHÁCH HÀNG]: ${message}\n\nHãy trả lời một cách lịch thiệp, sinh động và rõ ý:`;
            const result = await aiModel.generateContent(prompt);
            aiReply = result.response.text();
        }

        // --- BƯỚC 4: Thực hiện thêm/cập nhật dữ liệu vào MongoDB Compass ---
        try {
            const mongoDb = getMongoDB();
            const chatCollection = mongoDb.collection('UserChatSessions');

            const newConversations = [
                { sender: 'user', message: message, timestamp: new Date() },
                { sender: 'assistant', message: aiReply, timestamp: new Date() }
            ];

            await chatCollection.updateOne(
                { session_id: session_id },
                {
                    $set: {
                        user_id: user_id ? parseInt(user_id) : null,
                        "meta_data.ip_address": ipAddress,
                        "meta_data.device": deviceType,
                        last_updated: new Date()
                    },
                    $push: {
                        conversations: { $each: newConversations }
                    }
                },
                { upsert: true }
            );
        } catch (mongoErr) {
            console.error('⚠ Lỗi cập nhật nhật ký chat trên MongoDB Compass:', mongoErr.message);
        }

        // --- BƯỚC 5: Chạy phân tích AI ngầm để cập nhật trường 'extracted_behavior' ---
        if (aiModel) {
            (async () => {
                try {
                    const analysisPrompt = (
                        `Dựa vào câu nói của khách: '${message}', hãy phân tích hành vi và mong muốn của họ rồi xuất ra định dạng JSON chuẩn sau đây (Không bọc ký tự markdown \`\`\`json):\n` +
                        `{\n` +
                        `  "preferred_destinations": ["địa_điểm_1", "địa_điểm_2"],\n` +
                        `  "max_budget_detected": 4000000,\n` +
                        `  "duration_days_detected": 4,\n` +
                        `  "inferred_tags": ["thể_loại_1", "thể_loại_2"]\n` +
                        `}\n` +
                        `Lưu ý:\n` +
                        `- Mức giá tối đa (max_budget_detected) và số ngày đi (duration_days_detected) phải là kiểu số nguyên (int), nếu không phân tích được hãy để null.\n` +
                        `- Các mảng danh sách phải là mảng chuỗi (array string), nếu trống hãy để mảng rỗng [].`
                    );

                    const result = await aiModel.generateContent(analysisPrompt);
                    const responseText = result.response.text();
                    
                    const jsonString = responseText.replace(/```json|```/g, '').trim();
                    const behaviorData = JSON.parse(jsonString);

                    const mongoDb = getMongoDB();
                    const chatCollection = mongoDb.collection('UserChatSessions');
                    await chatCollection.updateOne(
                        { session_id: session_id },
                        {
                            $set: {
                                "extracted_behavior.preferred_destinations": behaviorData.preferred_destinations || [],
                                "extracted_behavior.max_budget_detected": behaviorData.max_budget_detected || null,
                                "extracted_behavior.duration_days_detected": behaviorData.duration_days_detected || null,
                                "extracted_behavior.inferred_tags": behaviorData.inferred_tags || []
                            }
                        }
                    );
                } catch (err) {
                    console.error('✘ Lỗi phân tích hành vi AI ngầm:', err.message);
                }
            })();
        }

        // Trả kết quả mượt mà về cho Client
        return res.json({ reply: aiReply });

    } catch (error) {
        console.error('✘ Lỗi luồng xử lý API AI Chat:', error.message);
        return res.status(500).json({ error: 'Lỗi hệ thống khi xử lý dịch vụ AI.' });
    }
});

module.exports = router;