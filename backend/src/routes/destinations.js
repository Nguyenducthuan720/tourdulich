const express = require("express");
const { sql } = require("../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM Destinations";
    const result = await new sql.Request().query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error("Get destinations error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
