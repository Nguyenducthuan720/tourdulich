const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sql } = require("../config/db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "XIN-CHAO-BAN";

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email và password bắt buộc" });
    }

    const query = `SELECT * FROM Users WHERE Email = @email`;
    const request = new sql.Request();
    request.input("email", sql.VarChar, email);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Email hoặc password sai" });
    }

    const user = result.recordset[0];
    const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email hoặc password sai" });
    }

    const token = jwt.sign(
      { userId: user.UserID, email: user.Email, role: user.Role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.UserID,
        name: user.FullName,
        email: user.Email,
        role: user.Role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const checkQuery = `SELECT * FROM Users WHERE Email = @email`;
    const checkRequest = new sql.Request();
    checkRequest.input("email", sql.VarChar, email);
    const existingUser = await checkRequest.query(checkQuery);

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO Users (FullName, Email, PasswordHash, Role)
      VALUES (@name, @email, @password, 'customer')
      SELECT SCOPE_IDENTITY() as UserID
    `;

    const insertRequest = new sql.Request();
    insertRequest.input("name", sql.VarChar, name);
    insertRequest.input("email", sql.VarChar, email);
    insertRequest.input("password", sql.VarChar, hashedPassword);

    const result = await insertRequest.query(insertQuery);
    const userId = result.recordset[0].UserID;

    const token = jwt.sign(
      { userId, email, role: "customer" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
  
    res.status(201).json({
      token,
      user: {
        id: userId,
        name,
        email,
        role: "customer",
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});
module.exports = router;
