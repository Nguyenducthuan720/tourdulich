const express = require("express");
const { sql } = require("../config/db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

// Lấy danh sách đánh giá của một tour + điểm trung bình - GET /api/reviews/tour/:tourId
router.get("/tour/:tourId", async (req, res) => {
  try {
    const { tourId } = req.params;

    const tourQuery = "SELECT COUNT(*) as total FROM Tours WHERE TourID = @tourId";
    const tourReq = new sql.Request().input("tourId", sql.Int, tourId);
    const tourResult = await tourReq.query(tourQuery);
    if (tourResult.recordset[0].total === 0) {
      return res.status(404).json({ message: "Không tìm thấy tour" });
    }

    const listQuery = `
      SELECT r.ReviewID, r.UserID, r.Rating, r.Comment, r.CreatedAt,
             u.FullName as UserName
      FROM Reviews r
      JOIN Users u ON r.UserID = u.UserID
      WHERE r.TourID = @tourId
      ORDER BY r.CreatedAt DESC
    `;
    const listReq = new sql.Request();
    listReq.input("tourId", sql.Int, tourId);
    const [listResult, avgResult] = await Promise.all([
      listReq.query(listQuery),
      new sql.Request()
        .input("tourId", sql.Int, tourId)
        .query("SELECT ISNULL(AVG(CAST(Rating AS FLOAT)), 0) as avg, COUNT(*) as count FROM Reviews WHERE TourID = @tourId"),
    ]);

    const avg = Number(avgResult.recordset[0].avg || 0);
    const count = avgResult.recordset[0].count;

    res.json({ items: listResult.recordset, avgRating: Math.round(avg * 10) / 10, total: count });
  } catch (error) {
    console.error("Get tour reviews error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Tạo đánh giá mới - POST /api/reviews
router.post("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { tourId, rating, comment } = req.body;

    const parsedRating = parseInt(rating, 10);
    if (!tourId || !parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: "Đánh giá phải là số sao từ 1 đến 5" });
    }

    const tourResult = await new sql.Request()
      .input("tourId", sql.Int, tourId)
      .query("SELECT TourID FROM Tours WHERE TourID = @tourId");
    if (tourResult.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy tour" });
    }

    const dupResult = await new sql.Request()
      .input("userId", sql.Int, userId)
      .input("tourId", sql.Int, tourId)
      .query("SELECT ReviewID FROM Reviews WHERE UserID = @userId AND TourID = @tourId");
    if (dupResult.recordset.length > 0) {
      return res.status(409).json({ message: "Bạn đã đánh giá tour này rồi" });
    }

    const insertReq = new sql.Request();
    insertReq.input("userId", sql.Int, userId);
    insertReq.input("tourId", sql.Int, tourId);
    insertReq.input("rating", sql.Int, parsedRating);
    insertReq.input("comment", sql.NVarChar(sql.MAX), comment || "");
    const insertResult = await insertReq.query(`
      INSERT INTO Reviews (UserID, TourID, Rating, Comment)
      VALUES (@userId, @tourId, @rating, @comment);
      SELECT SCOPE_IDENTITY() as ReviewID;
    `);

    const avgResult = await new sql.Request()
      .input("tourId", sql.Int, tourId)
      .query("SELECT ISNULL(AVG(CAST(Rating AS FLOAT)), 0) as avg, COUNT(*) as count FROM Reviews WHERE TourID = @tourId");

    res.status(201).json({
      id: insertResult.recordset[0].ReviewID,
      avgRating: Math.round(Number(avgResult.recordset[0].avg) * 10) / 10,
      total: avgResult.recordset[0].count,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
