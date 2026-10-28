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

async function ensureDestinations(pool) {
    const createTable = `
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Destinations')
      BEGIN
        CREATE TABLE Destinations (
          DestinationID INT IDENTITY(1,1) PRIMARY KEY,
          DestinationName NVARCHAR(200) NOT NULL,
          ImageURL VARCHAR(500) NULL,
          Description NVARCHAR(MAX) NULL
        );
      END
      
      -- Seed sample data if empty
      IF NOT EXISTS (SELECT 1 FROM Destinations)
      BEGIN
        INSERT INTO Destinations (DestinationName, ImageURL, Description) VALUES
        (N'Vịnh Hạ Long', '/images/destinations/ha-long.jpg', N'Di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi'),
        (N'Phú Quốc', '/images/destinations/phu-quoc.jpg', N'Đảo ngọc biển Đông, bãi biển cát trắng trong vắt'),
        (N'Đà Nẵng', '/images/destinations/da-nang.jpg', N'Thành phố đáng sống nhất Việt Nam, cầu Rồng, biển Mỹ Khê'),
        (N'Đà Lạt', '/images/destinations/da-lat.jpg', N'Thành phố ngàn hoa, khí hậu mát mẻ quanh năm'),
        (N'Sapa', '/images/destinations/sapa.jpg', N'Ruộng bậc thang trùng điệp, văn hóa dân tộc thiểu số'),
        (N'Hội An', '/images/destinations/hoi-an.jpg', N'Phố cổ đèn lồng, di sản văn hóa thế giới'),
        (N'Nha Trang', '/images/destinations/nha-trang.jpg', N'Thành phố biển với bãi cát trắng và đảo san hô'),
        (N'Phong Nha', '/images/destinations/phong-nha.jpg', N'Kỳ quan hang động lớn nhất Việt Nam'),
        (N'Mekong Delta', '/images/destinations/mekong.jpg', N'Cuộc sống sông nước miền Tây Nam Bộ');
      END
      
      -- Fix wrong image filenames saved by older seed data
      UPDATE Destinations SET ImageURL = '/images/destinations/ha-long.jpg' WHERE ImageURL = '/images/destinations/halong.jpg';
      UPDATE Destinations SET ImageURL = '/images/destinations/da-nang.jpg' WHERE ImageURL = '/images/destinations/danang.jpg';
      UPDATE Destinations SET ImageURL = '/images/destinations/da-lat.jpg' WHERE ImageURL = '/images/destinations/dalat.jpg';
      UPDATE Destinations SET ImageURL = '/images/destinations/phu-quoc.jpg' WHERE ImageURL = '/images/destinations/phuquoc.jpg';
      UPDATE Destinations SET ImageURL = '/images/destinations/hoi-an.jpg' WHERE ImageURL = '/images/destinations/hoian.jpg';
      UPDATE Destinations SET ImageURL = '/images/destinations/nha-trang.jpg' WHERE ImageURL = '/images/destinations/nhatrang.jpg';
      UPDATE Destinations SET ImageURL = '/images/destinations/phong-nha.jpg' WHERE ImageURL = '/images/destinations/phongnha.jpg';

      -- Ensure the extra destinations exist (idempotent)
      IF NOT EXISTS (SELECT 1 FROM Destinations WHERE DestinationName = N'Hội An')
        INSERT INTO Destinations (DestinationName, ImageURL, Description) VALUES (N'Hội An', '/images/destinations/hoi-an.jpg', N'Phố cổ đèn lồng, di sản văn hóa thế giới');
      IF NOT EXISTS (SELECT 1 FROM Destinations WHERE DestinationName = N'Nha Trang')
        INSERT INTO Destinations (DestinationName, ImageURL, Description) VALUES (N'Nha Trang', '/images/destinations/nha-trang.jpg', N'Thành phố biển với bãi cát trắng và đảo san hô');
      IF NOT EXISTS (SELECT 1 FROM Destinations WHERE DestinationName = N'Phong Nha')
        INSERT INTO Destinations (DestinationName, ImageURL, Description) VALUES (N'Phong Nha', '/images/destinations/phong-nha.jpg', N'Kỳ quan hang động lớn nhất Việt Nam');
      IF NOT EXISTS (SELECT 1 FROM Destinations WHERE DestinationName = N'Mekong Delta')
        INSERT INTO Destinations (DestinationName, ImageURL, Description) VALUES (N'Mekong Delta', '/images/destinations/mekong.jpg', N'Cuộc sống sông nước miền Tây Nam Bộ');
      
      -- Clean duplicates and add constraint
      IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE name = 'UQ_DestinationName' AND type = 'UQ')
      BEGIN
        WITH Duplicates AS (
          SELECT DestinationID,
                 ROW_NUMBER() OVER (PARTITION BY DestinationName ORDER BY DestinationID) AS rn
          FROM Destinations
        )
        DELETE FROM Duplicates WHERE rn > 1;
        
        ALTER TABLE Destinations ADD CONSTRAINT UQ_DestinationName UNIQUE (DestinationName);
      END
    `;
    await pool.request().query(createTable);
}

async function ensureCategories(pool) {
    const createTable = `
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Categories')
      BEGIN
        CREATE TABLE Categories (
          CategoryID INT IDENTITY(1,1) PRIMARY KEY,
          CategoryName NVARCHAR(100) NOT NULL
        );
      END
      
      -- Seed sample data if empty
      IF NOT EXISTS (SELECT 1 FROM Categories)
      BEGIN
        INSERT INTO Categories (CategoryName) VALUES
        (N'Nghỉ dưỡng'),
        (N'Văn hóa'),
        (N'Khám phá'),
        (N'Gia đình'),
        (N'Honeymoon'),
        (N'Mạo hiểm');
      END
      
      -- Clean duplicates and add constraint
      IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE name = 'UQ_CategoryName' AND type = 'UQ')
      BEGIN
        WITH Duplicates AS (
          SELECT CategoryID,
                 ROW_NUMBER() OVER (PARTITION BY CategoryName ORDER BY CategoryID) AS rn
          FROM Categories
        )
        DELETE FROM Duplicates WHERE rn > 1;
        
        ALTER TABLE Categories ADD CONSTRAINT UQ_CategoryName UNIQUE (CategoryName);
      END
    `;
    await pool.request().query(createTable);
}

async function ensureAirports(pool) {
    const createTable = `
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Airports')
      BEGIN
        CREATE TABLE Airports (
          AirportCode VARCHAR(10) PRIMARY KEY,
          AirportName NVARCHAR(200) NOT NULL,
          City NVARCHAR(100) NOT NULL
        );
        
        -- Seed sample data if empty
        IF NOT EXISTS (SELECT 1 FROM Airports)
        BEGIN
          INSERT INTO Airports (AirportCode, AirportName, City) VALUES
          ('HAN', N'Sân bay Quốc tế Nội Bài', N'Hà Nội'),
          ('SGN', N'Sân bay Quốc tế Tân Sơn Nhất', N'TP. Hồ Chí Minh'),
          ('DAD', N'Sân bay Quốc tế Đà Nẵng', N'Đà Nẵng'),
          ('HPH', N'Sân bay Quốc tế Cát Bi', N'Hải Phòng'),
          ('VCS', N'Sân bay Côn Đảo', N'Côn Đảo');
        END
      END
    `;
    await pool.request().query(createTable);
}

async function ensureFlights(pool) {
    const createTable = `
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Flights')
      BEGIN
        CREATE TABLE Flights (
          FlightID INT IDENTITY(1,1) PRIMARY KEY,
          AirlineName NVARCHAR(100) NOT NULL,
          FlightNumber VARCHAR(20) NOT NULL,
          DepartureAirport VARCHAR(10) FOREIGN KEY REFERENCES Airports(AirportCode),
          ArrivalAirport VARCHAR(10) FOREIGN KEY REFERENCES Airports(AirportCode),
          DepartureTime DATETIME NOT NULL,
          ArrivalTime DATETIME NOT NULL,
          Price NUMERIC(15, 2) NOT NULL,
          AvailableSeats INT NOT NULL DEFAULT 0,
          Status INT NOT NULL DEFAULT 1
        );
      END
      
      -- Seed sample data if empty
      IF NOT EXISTS (SELECT 1 FROM Flights)
      BEGIN
        INSERT INTO Flights (AirlineName, FlightNumber, DepartureAirport, ArrivalAirport, DepartureTime, ArrivalTime, Price, AvailableSeats, Status) VALUES
        (N'Vietnam Airlines', 'VN123', 'HAN', 'SGN', '2026-09-20T06:00:00', '2026-09-20T08:00:00', 1500000, 180, 1),
        (N'Vietnam Airlines', 'VN124', 'SGN', 'HAN', '2026-09-20T09:00:00', '2026-09-20T11:00:00', 1500000, 180, 1),
        (N'Vietjet Air', 'VJ501', 'HAN', 'DAD', '2026-09-21T07:30:00', '2026-09-21T08:45:00', 900000, 175, 1),
        (N'Bamboo Airways', 'QH102', 'DAD', 'HPH', '2026-09-22T10:00:00', '2026-09-22T11:30:00', 1200000, 160, 1);
      END
      
      -- Clean duplicates and add constraint
      IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE name = 'UQ_FlightNumber_DepartureTime' AND type = 'UQ')
      BEGIN
        WITH Duplicates AS (
          SELECT FlightID,
                 ROW_NUMBER() OVER (PARTITION BY FlightNumber, DepartureTime ORDER BY FlightID) AS rn
          FROM Flights
        )
        DELETE FROM Duplicates WHERE rn > 1;
        
        ALTER TABLE Flights ADD CONSTRAINT UQ_FlightNumber_DepartureTime UNIQUE (FlightNumber, DepartureTime);
      END
    `;
    await pool.request().query(createTable);
}

async function ensureSettings(pool) {
    const createTable = `
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Settings')
      BEGIN
        CREATE TABLE Settings (
          [Key] NVARCHAR(100) PRIMARY KEY,
          [Value] NVARCHAR(MAX) NULL
        );
        
        -- Seed default settings
        INSERT INTO Settings ([Key], [Value]) VALUES
        ('siteName', 'Tour Du Lịch'),
        ('contactEmail', 'support@tourdulich.vn'),
        ('phone', '1900 1234'),
        ('address', N'Hà Nội, Việt Nam'),
        ('maintenanceMode', '0');
      END
    `;
    await pool.request().query(createTable);
}

async function ensureUsers(pool) {
    const createTable = `
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Users')
      BEGIN
        CREATE TABLE Users (
          UserID INT IDENTITY(1,1) PRIMARY KEY,
          FullName NVARCHAR(200) NOT NULL,
          Email VARCHAR(100) NOT NULL,
          PasswordHash VARCHAR(255) NOT NULL,
          Phone VARCHAR(20) NULL,
          Address NVARCHAR(510) NULL,
          Avatar NVARCHAR(MAX) NULL,
          Role VARCHAR(20) NOT NULL DEFAULT 'customer',
          Status BIT NOT NULL DEFAULT 1,
          CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
        );
      END

      -- Avatar stores a base64 data URL, so it must be MAX (old schema used varchar(255))
      IF EXISTS (
        SELECT 1 FROM sys.columns c
        JOIN sys.types t ON c.user_type_id = t.user_type_id
        WHERE c.object_id = OBJECT_ID('Users')
          AND c.name = 'Avatar'
          AND t.name IN ('varchar', 'nvarchar')
          AND c.max_length <> -1
      )
      BEGIN
        ALTER TABLE Users ALTER COLUMN Avatar NVARCHAR(MAX) NULL;
      END
    `;
    await pool.request().query(createTable);
}

async function ensurePayments(pool) {
    const createTable = `
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Payments')
      BEGIN
        CREATE TABLE Payments (
          PaymentID INT IDENTITY(1,1) PRIMARY KEY,
          BookingID INT NOT NULL,
          Method NVARCHAR(50) NOT NULL,
          Amount NUMERIC(15,2) NOT NULL,
          Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',
          TxnRef NVARCHAR(100) NULL,
          BankCode NVARCHAR(20) NULL,
          ResponseCode NVARCHAR(10) NULL,
          ResponseMessage NVARCHAR(200) NULL,
          PaidAt DATETIME NULL,
          CreatedAt DATETIME DEFAULT GETDATE()
        );
      END
      
      -- Avoid duplicate TxnRef values (keeps retries idempotent at DB level)
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_Payments_TxnRef' AND object_id = OBJECT_ID('Payments'))
      BEGIN
        IF EXISTS (
          SELECT TxnRef FROM Payments WHERE TxnRef IS NOT NULL
          GROUP BY TxnRef HAVING COUNT(*) > 1
        )
        BEGIN
          WITH Duplicates AS (
            SELECT PaymentID, ROW_NUMBER() OVER (PARTITION BY TxnRef ORDER BY PaymentID) AS rn
            FROM Payments WHERE TxnRef IS NOT NULL
          )
          DELETE FROM Duplicates WHERE rn > 1;
        END
        
        CREATE UNIQUE INDEX UQ_Payments_TxnRef ON Payments(TxnRef) WHERE TxnRef IS NOT NULL;
      END
      
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Payments_BookingID' AND object_id = OBJECT_ID('Payments'))
        CREATE INDEX IX_Payments_BookingID ON Payments(BookingID);
    `;
    await pool.request().query(createTable);
}

async function ensureBookings(pool) {
    const createTable = `
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Bookings')
      BEGIN
        CREATE TABLE Bookings (
          BookingID INT IDENTITY(1,1) PRIMARY KEY,
          UserID INT NOT NULL,
          BookingDate DATETIME NOT NULL DEFAULT GETDATE(),
          TotalAmount NUMERIC(15,2) NOT NULL DEFAULT 0,
          Status NVARCHAR(50) NOT NULL DEFAULT 'Pending'
        );
      END
      
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'BookingDetails')
      BEGIN
        CREATE TABLE BookingDetails (
          BookingDetailID INT IDENTITY(1,1) PRIMARY KEY,
          BookingID INT NOT NULL,
          TourID INT NOT NULL,
          Quantity INT NOT NULL DEFAULT 1,
          UnitPrice NUMERIC(15,2) NOT NULL DEFAULT 0
        );
      END
    `;
    await pool.request().query(createTable);
}

async function ensureFlightBookings(pool) {
    const createTable = `
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'FlightBookings')
      BEGIN
        CREATE TABLE FlightBookings (
          FlightBookingID INT IDENTITY(1,1) PRIMARY KEY,
          BookingID INT NOT NULL,
          FlightID INT NOT NULL,
          PassengerName NVARCHAR(200) NULL,
          IdCardOrPassport NVARCHAR(50) NULL,
          SeatNumber NVARCHAR(20) NULL,
          TicketType VARCHAR(50) NULL DEFAULT 'Economy',
          UnitPrice NUMERIC(15,2) NOT NULL DEFAULT 0
        );
      END
    `;
    await pool.request().query(createTable);
}

async function ensureTourImages(pool) {
    const createTable = `
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'TourImages')
      BEGIN
        CREATE TABLE TourImages (
          ImageID INT IDENTITY(1,1) PRIMARY KEY,
          TourID INT NOT NULL,
          ImageURL VARCHAR(500) NOT NULL
        );
      END
      
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Schedules')
      BEGIN
        CREATE TABLE Schedules (
          ScheduleID INT IDENTITY(1,1) PRIMARY KEY,
          TourID INT NOT NULL,
          DayNumber INT NOT NULL,
          Activity NVARCHAR(MAX) NULL
        );
      END
    `;
    await pool.request().query(createTable);
}

async function ensureReviews(pool) {
    const createTable = `
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Reviews')
      BEGIN
        CREATE TABLE Reviews (
          ReviewID INT IDENTITY(1,1) PRIMARY KEY,
          UserID INT NOT NULL,
          TourID INT NOT NULL,
          Rating INT NOT NULL,
          Comment NVARCHAR(MAX) NULL,
          CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
        );
      END
    `;
    await pool.request().query(createTable);
}

async function ensureTours(pool) {
    const createTable = `
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Tours')
      BEGIN
        CREATE TABLE Tours (
          TourID INT IDENTITY(1,1) PRIMARY KEY,
          TourName NVARCHAR(200) NOT NULL,
          Destination NVARCHAR(200) NOT NULL,
          Price NUMERIC(15, 2) NOT NULL,
          Duration NVARCHAR(50) NOT NULL,
          AvailableSeats INT NOT NULL DEFAULT 0,
          Description NVARCHAR(MAX) NULL,
          ImageURL VARCHAR(500) NULL,
          CategoryID INT NULL,
          Status INT NOT NULL DEFAULT 1
        );
      END
      
      -- Clean duplicates by TourName, keep lowest TourID
      IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE name = 'UQ_TourName' AND type = 'UQ')
      BEGIN
        WITH Duplicates AS (
          SELECT TourID,
                 ROW_NUMBER() OVER (PARTITION BY TourName ORDER BY TourID) AS rn
          FROM Tours
        )
        DELETE FROM Duplicates WHERE rn > 1;
        
        ALTER TABLE Tours ADD CONSTRAINT UQ_TourName UNIQUE (TourName);
      END
    `;
    await pool.request().query(createTable);
}

const connectDB = async () => {
    for (let attempt = 1; attempt <= RETRY_MAX; attempt++) {
        try {
            const pool = await sql.connect(config);
            console.log(`SQL Server Connected (attempt ${attempt})`);

            // Auto-create/repair tables on startup
            await ensureCategories(pool);
            await ensureDestinations(pool);
            await ensureAirports(pool);
            await ensureFlights(pool);
            await ensureSettings(pool);
            await ensureUsers(pool);
            await ensurePayments(pool);
            await ensureBookings(pool);
            await ensureFlightBookings(pool);
            await ensureTourImages(pool);
            await ensureReviews(pool);
            await ensureTours(pool);

            return pool;
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
