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
  INSERT INTO Settings ([Key], [Value]) VALUES ('address', 'Hà Nội, Việt Nam')

IF NOT EXISTS (SELECT 1 FROM Settings WHERE [Key] = 'maintenanceMode')
  INSERT INTO Settings ([Key], [Value]) VALUES ('maintenanceMode', '0')

SELECT [Key], [Value] FROM Settings
