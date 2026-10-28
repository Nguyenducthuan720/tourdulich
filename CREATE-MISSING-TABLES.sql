-- Fix duplicate data and ensure destinations show up

-- ===== DESTINATIONS =====
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Destinations')
BEGIN
  CREATE TABLE Destinations (
    DestinationID INT IDENTITY(1,1) PRIMARY KEY,
    DestinationName NVARCHAR(200) NOT NULL,
    ImageURL VARCHAR(500) NULL,
    Description NVARCHAR(MAX) NULL
  )
  
  -- Add unique constraint after table creation
  ALTER TABLE Destinations ADD CONSTRAINT UQ_DestinationName UNIQUE (DestinationName)
END
ELSE
BEGIN
  -- Add unique constraint if not exists
  IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE name = 'UQ_DestinationName' AND type = 'UQ')
  BEGIN
    -- First clean duplicates
    WITH Duplicates AS (
      SELECT DestinationID,
             ROW_NUMBER() OVER (PARTITION BY DestinationName ORDER BY DestinationID) AS rn
      FROM Destinations
    )
    DELETE FROM Duplicates WHERE rn > 1;
    
    -- Then add constraint
    ALTER TABLE Destinations ADD CONSTRAINT UQ_DestinationName UNIQUE (DestinationName)
  END
END

-- Seed sample destinations if empty
IF NOT EXISTS (SELECT 1 FROM Destinations)
BEGIN
  INSERT INTO Destinations (DestinationName, ImageURL, Description) VALUES
  (N'Vịnh Hạ Long', '/images/destinations/halong.jpg', N'Di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi'),
  (N'Phú Quốc', '/images/destinations/phuquoc.jpg', N'Đảo ngọc biển Đông, bãi biển cát trắng trong vắt'),
  (N'Đà Nẵng', '/images/destinations/danang.jpg', N'Thành phố đáng sống nhất Việt Nam, cầu Rồng, biển Mỹ Khê'),
  (N'Đà Lạt', '/images/destinations/dalat.jpg', N'Thành phố ngàn hoa, khí hậu mát mẻ quanh năm'),
  (N'Sapa', '/images/destinations/sapa.jpg', N'Ruộng bậc thang trùng điệp, văn hóa dân tộc thiểu số')
END

-- ===== CATEGORIES =====
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Categories')
BEGIN
  CREATE TABLE Categories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL
  )
  
  -- Add unique constraint after table creation
  ALTER TABLE Categories ADD CONSTRAINT UQ_CategoryName UNIQUE (CategoryName)
END
ELSE
BEGIN
  -- Add unique constraint if not exists
  IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE name = 'UQ_CategoryName' AND type = 'UQ')
  BEGIN
    -- First clean duplicates
    WITH Duplicates AS (
      SELECT CategoryID,
             ROW_NUMBER() OVER (PARTITION BY CategoryName ORDER BY CategoryID) AS rn
      FROM Categories
    )
    DELETE FROM Duplicates WHERE rn > 1;
    
    -- Then add constraint
    ALTER TABLE Categories ADD CONSTRAINT UQ_CategoryName UNIQUE (CategoryName)
  END
END

-- Seed sample categories if empty
IF NOT EXISTS (SELECT 1 FROM Categories)
BEGIN
  INSERT INTO Categories (CategoryName) VALUES
  (N'Nghỉ dưỡng'),
  (N'Văn hóa'),
  (N'Khám phá'),
  (N'Gia đình'),
  (N'Honeymoon'),
  (N'Mạo hiểm')
END

-- ===== AIRPORTS =====
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Airports')
BEGIN
  CREATE TABLE Airports (
    AirportCode VARCHAR(10) PRIMARY KEY,
    AirportName NVARCHAR(200) NOT NULL,
    City NVARCHAR(100) NOT NULL
  )
END

-- Remove duplicate airports, keep the lowest ID
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Airports')
BEGIN
  WITH Duplicates AS (
    SELECT AirportCode,
           ROW_NUMBER() OVER (PARTITION BY AirportCode ORDER BY AirportCode) AS rn
    FROM Airports
  )
  DELETE FROM Duplicates WHERE rn > 1;

  -- Seed sample airports if empty
  IF NOT EXISTS (SELECT 1 FROM Airports)
  BEGIN
    INSERT INTO Airports (AirportCode, AirportName, City) VALUES
    ('HAN', N'Sân bay Quốc tế Nội Bài', N'Hà Nội'),
    ('SGN', N'Sân bay Quốc tế Tân Sơn Nhất', N'TP. Hồ Chí Minh'),
    ('DAD', N'Sân bay Quốc tế Đà Nẵng', N'Đà Nẵng'),
    ('HPH', N'Sân bay Quốc tế Cát Bi', N'Hải Phòng'),
    ('VCS', N'Sân bay Côn Đảo', N'Côn Đảo')
  END
END

-- ===== FLIGHTS =====
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
  )
  
  -- Add unique constraint after table creation
  ALTER TABLE Flights ADD CONSTRAINT UQ_FlightNumber_DepartureTime UNIQUE (FlightNumber, DepartureTime)
END
ELSE
BEGIN
  -- Add unique constraint if not exists
  IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE name = 'UQ_FlightNumber_DepartureTime' AND type = 'UQ')
  BEGIN
    -- First clean duplicates
    WITH Duplicates AS (
      SELECT FlightID,
             ROW_NUMBER() OVER (PARTITION BY FlightNumber, DepartureTime ORDER BY FlightID) AS rn
      FROM Flights
    )
    DELETE FROM Duplicates WHERE rn > 1;
    
    -- Then add constraint
    ALTER TABLE Flights ADD CONSTRAINT UQ_FlightNumber_DepartureTime UNIQUE (FlightNumber, DepartureTime)
  END
END

-- Seed sample flights if empty
IF NOT EXISTS (SELECT 1 FROM Flights)
BEGIN
  INSERT INTO Flights (AirlineName, FlightNumber, DepartureAirport, ArrivalAirport, DepartureTime, ArrivalTime, Price, AvailableSeats, Status) VALUES
  (N'Vietnam Airlines', 'VN123', 'HAN', 'SGN', '2026-09-20T06:00:00', '2026-09-20T08:00:00', 1500000, 180, 1),
  (N'Vietnam Airlines', 'VN124', 'SGN', 'HAN', '2026-09-20T09:00:00', '2026-09-20T11:00:00', 1500000, 180, 1),
  (N'Vietjet Air', 'VJ501', 'HAN', 'DAD', '2026-09-21T07:30:00', '2026-09-21T08:45:00', 900000, 175, 1),
  (N'Bamboo Airways', 'QH102', 'DAD', 'HPH', '2026-09-22T10:00:00', '2026-09-22T11:30:00', 1200000, 160, 1)
END

-- ===== SETTINGS =====
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Settings')
BEGIN
  CREATE TABLE Settings (
    [Key] NVARCHAR(100) PRIMARY KEY,
    [Value] NVARCHAR(MAX) NULL
  )
END

IF NOT EXISTS (SELECT 1 FROM Settings WHERE [Key] = 'siteName')
  INSERT INTO Settings ([Key], [Value]) VALUES ('siteName', 'Tour Du Lịch')

IF NOT EXISTS (SELECT 1 FROM Settings WHERE [Key] = 'contactEmail')
  INSERT INTO Settings ([Key], [Value]) VALUES ('contactEmail', 'support@tourdulich.vn')

IF NOT EXISTS (SELECT 1 FROM Settings WHERE [Key] = 'phone')
  INSERT INTO Settings ([Key], [Value]) VALUES ('phone', '1900 1234')

IF NOT EXISTS (SELECT 1 FROM Settings WHERE [Key] = 'address')
  INSERT INTO Settings ([Key], [Value]) VALUES ('address', N'Hà Nội, Việt Nam')

IF NOT EXISTS (SELECT 1 FROM Settings WHERE [Key] = 'maintenanceMode')
  INSERT INTO Settings ([Key], [Value]) VALUES ('maintenanceMode', '0')

-- ===== VERIFY DATA =====
SELECT 'Destinations' AS TableName, COUNT(*) AS Total FROM Destinations
UNION ALL
SELECT 'Categories', COUNT(*) FROM Categories
UNION ALL
SELECT 'Airports', COUNT(*) FROM Airports
UNION ALL
SELECT 'Flights', COUNT(*) FROM Flights
UNION ALL
SELECT 'Settings', COUNT(*) FROM Settings
