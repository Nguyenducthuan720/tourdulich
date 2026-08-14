const express = require("express");
const { sql } = require("../config/db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// ===========================
// DASHBOARD STATS
// ===========================
router.get("/dashboard/stats", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const queries = [
      "SELECT COUNT(*) as total FROM Users WHERE Role = 'customer'",
      "SELECT COUNT(*) as total FROM Tours WHERE Status = 1",
      "SELECT COUNT(*) as total FROM Bookings",
      "SELECT SUM(TotalAmount) as total FROM Bookings WHERE Status = N'Confirmed'",
      "SELECT COUNT(*) as total FROM Reviews",
      "SELECT ISNULL(AVG(CAST(Rating AS FLOAT)), 0) as avgRating FROM Reviews",
    ];

    const request = new sql.Request();
    const results = await Promise.all(
      queries.map(q => request.query(q))
    );

    const totalCustomers = results[0].recordset[0].total;
    const totalTours = results[1].recordset[0].total;
    const totalBookings = results[2].recordset[0].total;
    const totalRevenue = results[3].recordset[0].total || 0;
    const totalReviews = results[4].recordset[0].total;
    const avgRating = results[5].recordset[0].avgRating || 0;

    // Build last 6 month keys (YYYY-MM) for zero-filled series
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }

    // User registrations over last 6 months (real CreatedAt)
    const userTrendRows = await new sql.Request().query(
      `SELECT FORMAT(CreatedAt, 'yyyy-MM') as month, COUNT(*) as count
       FROM Users WHERE CreatedAt >= DATEADD(month, -5, GETDATE())
       GROUP BY FORMAT(CreatedAt, 'yyyy-MM')`
    );
    const userMap = Object.fromEntries(userTrendRows.recordset.map(r => [r.month, r.count]));
    const userTrend = months.map(m => ({ month: m, count: userMap[m] || 0 }));

    // Reviews over last 6 months (real CreatedAt)
    const reviewTrendRows = await new sql.Request().query(
      `SELECT FORMAT(CreatedAt, 'yyyy-MM') as month, COUNT(*) as count
       FROM Reviews WHERE CreatedAt >= DATEADD(month, -5, GETDATE())
       GROUP BY FORMAT(CreatedAt, 'yyyy-MM')`
    );
    const reviewMap = Object.fromEntries(reviewTrendRows.recordset.map(r => [r.month, r.count]));
    const reviewTrend = months.map(m => ({ month: m, count: reviewMap[m] || 0 }));

    // Reviews grouped by star rating (1..5)
    const ratingRows = await new sql.Request().query(
      "SELECT Rating, COUNT(*) as count FROM Reviews GROUP BY Rating"
    );
    const ratingMap = Object.fromEntries(ratingRows.recordset.map(r => [r.Rating, r.count]));
    const reviewsByRating = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: ratingMap[rating] || 0,
    }));

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalTours,
        totalBookings,
        totalRevenue,
        totalReviews,
        avgRating,
        userTrend,
        reviewTrend,
        reviewsByRating,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ===========================
// USERS MANAGEMENT
// ===========================

// Lấy danh sách users
router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT * FROM Users 
      WHERE FullName LIKE @search OR Email LIKE @search
      ORDER BY UserID DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM Users 
      WHERE FullName LIKE @search OR Email LIKE @search
    `;

    const request = new sql.Request();
    request.input("search", sql.VarChar, `%${search}%`);

    const [usersResult, countResult] = await Promise.all([
      request.query(query),
      new sql.Request().input("search", sql.VarChar, `%${search}%`).query(countQuery),
    ]);

    res.json({
      success: true,
      data: usersResult.recordset,
      total: countResult.recordset[0].total,
      page: parseInt(page),
      pages: Math.ceil(countResult.recordset[0].total / limit),
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Cập nhật user
router.put("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, role, status } = req.body;

    const query = `
      UPDATE Users 
      SET FullName = @fullName, Email = @email, Role = @role, Status = @status
      WHERE UserID = @id
    `;

    const request = new sql.Request();
    request.input("id", sql.Int, id);
    request.input("fullName", sql.NVarChar, fullName);
    request.input("email", sql.VarChar, email);
    request.input("role", sql.VarChar, role);
    request.input("status", sql.Int, status);

    await request.query(query);

    res.json({
      success: true,
      message: "Cập nhật user thành công",
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Xóa user
router.delete("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Không cho xóa admin
    const checkQuery = "SELECT Role FROM Users WHERE UserID = @id";
    const checkRequest = new sql.Request();
    checkRequest.input("id", sql.Int, id);
    const checkResult = await checkRequest.query(checkQuery);

    if (checkResult.recordset.length > 0 && checkResult.recordset[0].Role === "Admin") {
      return res.status(403).json({ message: "Không thể xóa tài khoản admin" });
    }

    const deleteQuery = "DELETE FROM Users WHERE UserID = @id";
    const request = new sql.Request();
    request.input("id", sql.Int, id);
    await request.query(deleteQuery);

    res.json({
      success: true,
      message: "Xóa user thành công",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ===========================
// REVIEWS MANAGEMENT
// ===========================

// Lấy danh sách reviews
router.get("/reviews", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        r.ReviewID, r.UserID, r.TourID, r.Rating, r.Comment, r.CreatedAt,
        u.FullName as UserName, t.TourName
      FROM Reviews r
      JOIN Users u ON r.UserID = u.UserID
      JOIN Tours t ON r.TourID = t.TourID
      ORDER BY r.CreatedAt DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `;

    const countQuery = "SELECT COUNT(*) as total FROM Reviews";

    const [reviewsResult, countResult] = await Promise.all([
      new sql.Request().query(query),
      new sql.Request().query(countQuery),
    ]);

    res.json({
      success: true,
      data: reviewsResult.recordset,
      total: countResult.recordset[0].total,
      page: parseInt(page),
      pages: Math.ceil(countResult.recordset[0].total / limit),
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Xóa review
router.delete("/reviews/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const query = "DELETE FROM Reviews WHERE ReviewID = @id";
    const request = new sql.Request();
    request.input("id", sql.Int, id);
    await request.query(query);

    res.json({
      success: true,
      message: "Xóa review thành công",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ===========================
// BOOKINGS MANAGEMENT
// ===========================

// Lấy danh sách bookings
router.get("/bookings", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "" } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        b.BookingID, b.UserID, b.BookingDate, b.TotalAmount, b.Status,
        u.FullName as UserName, u.Email,
        bd.TourID, t.TourName
      FROM Bookings b
      JOIN Users u ON b.UserID = u.UserID
      JOIN BookingDetails bd ON b.BookingID = bd.BookingID
      JOIN Tours t ON bd.TourID = t.TourID
      WHERE 1=1
    `;

    const request = new sql.Request();

    if (status) {
      query += " AND b.Status = @status";
      request.input("status", sql.NVarChar, status);
    }

    query += ` ORDER BY b.BookingDate DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

    let countQuery = "SELECT COUNT(DISTINCT b.BookingID) as total FROM Bookings b";
    if (status) {
      countQuery += " WHERE b.Status = @status";
    }

    const bookingsResult = await request.query(query);
    const countRequest = new sql.Request();
    if (status) {
      countRequest.input("status", sql.NVarChar, status);
    }
    const countResult = await countRequest.query(countQuery);

    res.json({
      success: true,
      data: bookingsResult.recordset,
      total: countResult.recordset[0].total,
      page: parseInt(page),
      pages: Math.ceil(countResult.recordset[0].total / limit),
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Cập nhật booking status
router.put("/bookings/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const query = "UPDATE Bookings SET Status = @status WHERE BookingID = @id";
    const request = new sql.Request();
    request.input("id", sql.Int, id);
    request.input("status", sql.NVarChar, status);

    await request.query(query);

    res.json({
      success: true,
      message: "Cập nhật trạng thái booking thành công",
    });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Xóa booking
router.delete("/bookings/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const query = "DELETE FROM Bookings WHERE BookingID = @id";
    const request = new sql.Request();
    request.input("id", sql.Int, id);
    await request.query(query);

    res.json({
      success: true,
      message: "Xóa booking thành công",
    });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
