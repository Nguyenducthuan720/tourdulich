const sql = require("mssql");

const config = {
    server: process.env.DB_SERVER || "localhost",
    port: parseInt(process.env.DB_PORT || "1433", 10),
    user: process.env.DB_USER || "sa",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_DATABASE || "TravelBookingDB",
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const RETRY_MAX = parseInt(process.env.DB_RETRY_MAX || "10", 10);
const RETRY_DELAY_MS = parseInt(process.env.DB_RETRY_DELAY_MS || "3000", 10);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async () => {
    for (let attempt = 1; attempt <= RETRY_MAX; attempt++) {
        try {
            await sql.connect(config);
            console.log(`SQL Server Connected (attempt ${attempt})`);
            return;
        } catch (err) {
            console.error(
                `[DB] Kết nối SQL Server thất bại (lần ${attempt}/${RETRY_MAX}): ${err.message}`
            );
            if (attempt === RETRY_MAX) {
                console.error(
                    "[DB] Không thể kết nối SQL Server. Kiểm tra: dịch vụ SQL Server đang chạy? Port mở đúng? Sai user/password? Sau đó restart backend."
                );
                throw err;
            }
            await sleep(RETRY_DELAY_MS);
        }
    }
};

module.exports = { connectDB, sql };