const { MongoClient } = require('mongodb');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB_NAME || 'tour';

let db = null;

/**
 * Hàm kết nối tới MongoDB Compass chạy local
 */
async function connectMongoDB() {
    try {
        const client = new MongoClient(mongoUri);
        await client.connect();
        db = client.db(dbName);
        console.log('Kết nối cơ sở dữ liệu MongoDB Compass thành công!');
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

module.exports = { connectMongoDB, getMongoDB };