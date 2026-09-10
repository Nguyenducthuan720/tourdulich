const express = require("express");
const { sql } = require("../config/db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const query = "SELECT * FROM Destinations ORDER BY DestinationName";
    const result = await new sql.Request().query(query);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Get destinations error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, image, description } = req.body;
    const query = `
      INSERT INTO Destinations (DestinationName, ImageURL, Description)
      VALUES (@name, @image, @description);
      SELECT SCOPE_IDENTITY() as DestinationID;
    `;
    const request = new sql.Request();
    request.input("name", sql.NVarChar, name);
    request.input("image", sql.VarChar, image);
    request.input("description", sql.NVarChar, description);
    const result = await request.query(query);
    res.status(201).json({ success: true, id: result.recordset[0].DestinationID, name, image, description });
  } catch (error) {
    console.error("Create destination error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, description } = req.body;
    const query = `
      UPDATE Destinations SET
        DestinationName = @name,
        ImageURL = @image,
        Description = @description
      WHERE DestinationID = @id
    `;
    const request = new sql.Request();
    request.input("id", sql.Int, id);
    request.input("name", sql.NVarChar, name);
    request.input("image", sql.VarChar, image);
    request.input("description", sql.NVarChar, description);
    await request.query(query);
    res.json({ success: true, id, name, image, description });
  } catch (error) {
    console.error("Update destination error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM Destinations WHERE DestinationID = @id";
    const request = new sql.Request();
    request.input("id", sql.Int, id);
    await request.query(query);
    res.json({ success: true, message: "Xóa điểm đến thành công" });
  } catch (error) {
    console.error("Delete destination error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

module.exports = router;
