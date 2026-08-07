const express = require("express");
const bcrypt = require("bcrypt");
const { sql } = require("../config/db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

// Lấy profile của user - GET /api/users/profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const query = "SELECT UserID as id, FullName as name, Email as email, Phone as phone, Address as address, Role as role, Status as status, CreatedAt as createdAt FROM Users WHERE UserID = @userId";
    const request = new sql.Request();
    request.input("userId", sql.Int, userId);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Cập nhật thông tin cá nhân
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, email, phone = "", address = "" } = req.body;
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ message: "Họ tên và email là bắt buộc" });
    }

    const request = new sql.Request();
    request.input("userId", sql.Int, req.user.userId);
    request.input("name", sql.NVarChar(100), name.trim());
    request.input("email", sql.VarChar(100), email.trim());
    request.input("phone", sql.VarChar(20), phone.trim());
    request.input("address", sql.NVarChar(255), address.trim());

    const result = await request.query(`
      UPDATE Users
      SET FullName = @name, Email = @email, Phone = @phone, Address = @address
      OUTPUT INSERTED.UserID as id, INSERTED.FullName as name, INSERTED.Email as email,
             INSERTED.Phone as phone, INSERTED.Address as address, INSERTED.Role as role,
             INSERTED.Status as status, INSERTED.CreatedAt as createdAt
      WHERE UserID = @userId;
    `);

    if (!result.recordset.length) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json(result.recordset[0]);
  } catch (error) {
    if (error.number === 2627 || error.number === 2601) {
      return res.status(409).json({ message: "Email đã được sử dụng" });
    }
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Lỗi cập nhật hồ sơ" });
  }
});

// Đổi mật khẩu
router.put("/profile/password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }

    const request = new sql.Request();
    request.input("userId", sql.Int, req.user.userId);
    const result = await request.query("SELECT PasswordHash FROM Users WHERE UserID = @userId");
    if (!result.recordset.length) return res.status(404).json({ message: "Không tìm thấy user" });

    const valid = await bcrypt.compare(currentPassword, result.recordset[0].PasswordHash);
    if (!valid) return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updateRequest = new sql.Request();
    updateRequest.input("userId", sql.Int, req.user.userId);
    updateRequest.input("passwordHash", sql.VarChar(255), passwordHash);
    await updateRequest.query("UPDATE Users SET PasswordHash = @passwordHash WHERE UserID = @userId");

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Lỗi đổi mật khẩu" });
  }
});

// Lấy danh sách user (admin) - GET /api/admin/users
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const query = "SELECT UserID as id, FullName as name, Email as email, Role as role FROM Users ORDER BY UserID DESC";
    const result = await new sql.Request().query(query);

    res.json({ data: result.recordset });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
