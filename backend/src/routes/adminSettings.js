const express = require("express");
const { sql } = require("../config/db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router();

const defaultSettings = {
  siteName: 'Tour Du Lịch',
  contactEmail: 'support@tourdulich.vn',
  phone: '1900 1234',
  address: 'Hà Nội, Việt Nam',
  maintenanceMode: false,
}

// DB stores everything as text; normalise known boolean keys on read
const toClientValue = (key, value) => {
  if (key === 'maintenanceMode') {
    return value === '1' || value === 'true' || value === true
  }
  return value
}

// ...and serialise booleans back to '1' / '0' on write
const toDbValue = (value) => {
  if (typeof value === 'boolean') return value ? '1' : '0'
  if (value === null || value === undefined) return ''
  return String(value)
}

router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const query = "SELECT [Key], [Value] FROM Settings";
    const result = await new sql.Request().query(query);
    const data = { ...defaultSettings };
    for (const row of result.recordset) {
      data[row.Key] = toClientValue(row.Key, row.Value);
    }
    res.json({ success: true, data });
  } catch (error) {
    console.warn("Settings table not found, returning defaults:", error.message);
    res.json({ success: true, data: { ...defaultSettings } });
  }
});

router.put("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const settings = req.body || {};
    const query = `
      IF EXISTS (SELECT 1 FROM Settings WHERE [Key] = @key)
        UPDATE Settings SET [Value] = @value WHERE [Key] = @key;
      ELSE
        INSERT INTO Settings ([Key], [Value]) VALUES (@key, @value);
    `;

    for (const [key, value] of Object.entries(settings)) {
      await new sql.Request()
        .input("key", sql.NVarChar(100), key)
        .input("value", sql.NVarChar(sql.MAX), toDbValue(value))
        .query(query);
    }

    res.json({ success: true, message: "Lưu cài đặt thành công" });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

module.exports = router;
