const express = require("express");
const { sql } = require("../config/db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const query = "SELECT CategoryID, CategoryName FROM Categories ORDER BY CategoryName";
    const result = await new sql.Request().query(query);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    
    // Check for duplicate category name
    const checkQuery = "SELECT CategoryID FROM Categories WHERE LOWER(CategoryName) = LOWER(@name)";
    const checkResult = await new sql.Request()
      .input("name", sql.NVarChar, name)
      .query(checkQuery);
    
    if (checkResult.recordset.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Danh mục "${name}" đã tồn tại` 
      });
    }
    
    const query = "INSERT INTO Categories (CategoryName) VALUES (@name); SELECT SCOPE_IDENTITY() as CategoryID;";
    const request = new sql.Request();
    request.input("name", sql.NVarChar, name);
    const result = await request.query(query);
    res.status(201).json({ success: true, id: result.recordset[0].CategoryID, name });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const query = "UPDATE Categories SET CategoryName = @name WHERE CategoryID = @id";
    const request = new sql.Request();
    request.input("id", sql.Int, id);
    request.input("name", sql.NVarChar, name);
    await request.query(query);
    res.json({ success: true, id, name });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Count tours using this category for a friendly message
    const usedResult = await new sql.Request()
      .input("id", sql.Int, id)
      .query("SELECT COUNT(*) as total FROM Tours WHERE CategoryID = @id");
    const usedCount = usedResult.recordset[0].total;

    if (usedCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Không thể xóa: còn ${usedCount} tour đang dùng danh mục này`,
      });
    }

    const result = await new sql.Request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Categories WHERE CategoryID = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh mục" });
    }

    res.json({ success: true, message: "Xóa danh mục thành công" });
  } catch (error) {
    if (Number(error?.number) === 547) {
      return res.status(409).json({
        success: false,
        message: "Không thể xóa danh mục vì còn dữ liệu liên quan",
      });
    }
    console.error("Delete category error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

module.exports = router;
