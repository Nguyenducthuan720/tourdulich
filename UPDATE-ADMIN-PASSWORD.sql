-- ===================================================
-- UPDATE ADMIN PASSWORD
-- ===================================================
-- Email: admin@tourdulich.com
-- Password: admin@123456
-- ===================================================

USE TravelBookingDB;
GO

UPDATE Users 
SET PasswordHash = '$2b$10$kjyJEfvkF746O5kPVEdUeu5f6KPhIvMYQHLE4WNn77.e9TlKyyZJ.'
WHERE Email = 'admin@tourdulich.com';

-- Verify update
SELECT UserID, FullName, Email, Role, PasswordHash FROM Users WHERE Email = 'admin@tourdulich.com';

GO
PRINT '✓ Admin password updated successfully!';
PRINT 'Email: admin@tourdulich.com';
PRINT 'Password: admin@123456';
