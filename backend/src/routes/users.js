const express = require("express");
const { sql } = require("../config/db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

// Lấy profile của user - GET /api/users/profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const query = "SELECT UserID as id, FullName as name, Email as email, Role as role FROM Users WHERE UserID = @userId";
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
