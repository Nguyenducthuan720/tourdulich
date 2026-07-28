const sql = require("mssql");

const config = {
    server: "localhost",
    port: 1433,
    user: "sa",
    password: "123456",
    database: "TravelBookingDB",
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const connectDB = async () => {
    try {
        await sql.connect(config);
        console.log("SQL Server Connected");
    } catch (err) {
        console.log(err);
    }
};

module.exports = { connectDB, sql };
