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
    const query = "DELETE FROM Categories WHERE CategoryID = @id";
    const request = new sql.Request();
    request.input("id", sql.Int, id);
    await request.query(query);
    res.json({ success: true, message: "Xóa danh mục thành công" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

module.exports = router;
