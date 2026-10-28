const { MongoClient } = require('mongodb');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB_NAME || 'tour';
const CHAT_COLLECTION = 'UserChatSessions';

let db = null;
let client = null;

/**
 * Kết nối tới MongoDB (Compass chạy local) và đảm bảo schema/index đầy đủ.
 */
async function connectMongoDB() {
    try {
        client = new MongoClient(mongoUri);
        await client.connect();
        db = client.db(dbName);
        console.log('Kết nối cơ sở dữ liệu MongoDB Compass thành công!');

        await ensureChatSchema(db);
        return db;
    } catch (error) {
        console.error('Lỗi kết nối MongoDB:', error.message);
        throw error;
    }
}

/**
 * Lấy thực thể cơ sở dữ liệu MongoDB đã kết nối
 */
function getMongoDB() {
    if (!db) {
        throw new Error('Chưa khởi tạo kết nối MongoDB. Hãy gọi connectMongoDB() trước.');
    }
    return db;
}

/** Collection nhật ký chat */
function getChatCollection() {
    return getMongoDB().collection(CHAT_COLLECTION);
}

/**
 * Cấu trúc chuẩn của một phiên chat (theo đặc tả dự án)
 */
function buildNewSession({ sessionId, userId = null, ipAddress = '127.0.0.1', device = 'Desktop' }) {
    return {
        session_id: sessionId,
        user_id: userId === null || userId === undefined ? null : Number(userId),
        conversations: [],
        meta_data: {
            ip_address: ipAddress,
            device: device === 'Mobile' ? 'Mobile' : 'Desktop',
        },
        extracted_behavior: {
            preferred_destinations: [],
            max_budget_detected: null,
            duration_days_detected: null,
            inferred_tags: [],
        },
        last_updated: new Date(),
    };
}

/** Đảm bảo mọi field luôn tồn tại với giá trị mặc định */
function normalizeBehavior(behavior = {}) {
    const toInt = (v) => {
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
    };
    const toArray = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()).slice(0, 12) : []);

    return {
        preferred_destinations: toArray(behavior.preferred_destinations),
        max_budget_detected: toInt(behavior.max_budget_detected),
        duration_days_detected: toInt(behavior.duration_days_detected),
        inferred_tags: toArray(behavior.inferred_tags),
    };
}

/** Index + JSON schema validator cho collection chat */
async function ensureChatSchema(database) {
    const col = database.collection(CHAT_COLLECTION);

    // 1) JSON Schema validator (moderate: không chặn tài liệu cũ chưa chuẩn)
    try {
        const exists = await database.listCollections({ name: CHAT_COLLECTION }).hasNext();
        if (!exists) {
            await database.createCollection(CHAT_COLLECTION);
        }
        await database.command({
            collMod: CHAT_COLLECTION,
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['session_id', 'conversations', 'meta_data', 'extracted_behavior', 'last_updated'],
                    properties: {
                        session_id: { bsonType: 'string', description: 'Mã phiên chat' },
                        user_id: { bsonType: ['int', 'long', 'null'] },
                        conversations: {
                            bsonType: 'array',
                            items: {
                                bsonType: 'object',
                                required: ['sender', 'message', 'timestamp'],
                                properties: {
                                    sender: { enum: ['user', 'assistant'] },
                                    message: { bsonType: 'string' },
                                    timestamp: { bsonType: 'date' },
                                },
                            },
                        },
                        meta_data: {
                            bsonType: 'object',
                            required: ['ip_address', 'device'],
                            properties: {
                                ip_address: { bsonType: 'string' },
                                device: { enum: ['Desktop', 'Mobile'] },
                            },
                        },
                        extracted_behavior: {
                            bsonType: 'object',
                            required: ['preferred_destinations', 'max_budget_detected', 'duration_days_detected', 'inferred_tags'],
                            properties: {
                                preferred_destinations: { bsonType: 'array', items: { bsonType: 'string' } },
                                max_budget_detected: { bsonType: ['int', 'long', 'null'] },
                                duration_days_detected: { bsonType: ['int', 'long', 'null'] },
                                inferred_tags: { bsonType: 'array', items: { bsonType: 'string' } },
                            },
                        },
                        last_updated: { bsonType: 'date' },
                    },
                },
            },
            validationLevel: 'moderate',
            validationAction: 'error',
        });
    } catch (err) {
        console.warn('⚠ Không áp được schema validator cho UserChatSessions:', err.message);
    }

    // 2) Indexes
    const indexes = [
        { keys: { session_id: 1 }, options: { unique: true, name: 'uq_session_id' } },
        { keys: { user_id: 1 }, options: { name: 'ix_user_id', sparse: true } },
        { keys: { last_updated: -1 }, options: { name: 'ix_last_updated' } },
        { keys: { 'meta_data.device': 1 }, options: { name: 'ix_device' } },
        { keys: { 'extracted_behavior.preferred_destinations': 1 }, options: { name: 'ix_preferred_destinations' } },
        { keys: { 'extracted_behavior.inferred_tags': 1 }, options: { name: 'ix_inferred_tags' } },
    ];

    for (const { keys, options } of indexes) {
        try {
            await col.createIndex(keys, options);
        } catch (err) {
            if (err.code === 11000 || err.codeName === 'DuplicateKey') {
                console.warn(`⚠ Bỏ qua index ${options.name}: có session_id trùng trong dữ liệu cũ`);
            } else {
                console.warn(`⚠ Không tạo được index ${options.name}:`, err.message);
            }
        }
    }

    // 3) Backfill tài liệu cũ thiếu field / sai cấu trúc
    await backfillChatSessions(col);

    console.log('Đã khởi tạo schema + index cho UserChatSessions.');
}

/** Chuẩn hoá tài liệu cũ để khớp schema */
async function backfillChatSessions(col) {
    const cursor = col.find({
        $or: [
            { last_updated: { $exists: false } },
            { meta_data: { $exists: false } },
            { 'meta_data.ip_address': { $exists: false } },
            { 'meta_data.device': { $exists: false } },
            { extracted_behavior: { $exists: false } },
            { 'extracted_behavior.preferred_destinations': { $exists: false } },
            { 'extracted_behavior.inferred_tags': { $exists: false } },
        ],
    });

    let fixed = 0;
    for await (const doc of cursor) {
        const current = doc.extracted_behavior || {};
        await col.updateOne(
            { _id: doc._id },
            {
                $set: {
                    meta_data: {
                        ip_address: doc.meta_data?.ip_address || '127.0.0.1',
                        device: doc.meta_data?.device === 'Mobile' ? 'Mobile' : 'Desktop',
                    },
                    extracted_behavior: normalizeBehavior(current),
                    conversations: Array.isArray(doc.conversations) ? doc.conversations : [],
                    last_updated: doc.last_updated || doc.created_at || new Date(),
                },
            }
        );
        fixed += 1;
    }

    if (fixed > 0) console.log(`  → Đã chuẩn hoá ${fixed} phiên chat cũ.`);
}

async function closeMongoDB() {
    if (client) await client.close();
    db = null;
    client = null;
}

module.exports = {
    connectMongoDB,
    getMongoDB,
    getChatCollection,
    buildNewSession,
    normalizeBehavior,
    closeMongoDB,
    CHAT_COLLECTION,
};
