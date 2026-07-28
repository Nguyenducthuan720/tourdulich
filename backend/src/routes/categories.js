const express = require("express");
const { sql } = require("../config/db");

const router = express.Router();

// Lấy danh sách categories
router.get("/", async (req, res) => {
  try {
    const query = "SELECT CategoryID, CategoryName FROM Categories ORDER BY CategoryName";
    const request = new sql.Request();
    const result = await request.query(query);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server" 
    });
  }
});

// Lấy tours theo category
router.get("/:categoryId/tours", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { keyword = "" } = req.query;

    let query = `
      SELECT t.*, c.CategoryName 
      FROM Tours t 
      JOIN Categories c ON t.CategoryID = c.CategoryID 
      WHERE t.CategoryID = @categoryId AND t.Status = 1
    `;

    const request = new sql.Request();
    request.input("categoryId", sql.Int, categoryId);

    if (keyword) {
      query += " AND (t.TourName LIKE @keyword OR t.Description LIKE @keyword)";
      request.input("keyword", sql.VarChar, `%${keyword}%`);
    }

    query += " ORDER BY t.TourName";

    const result = await request.query(query);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error("Get tours by category error:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server" 
    });
  }
});

module.exports = router;
