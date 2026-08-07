const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "XIN-CHAO-BAN";

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verify error:", error.message);
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user?.role?.toLowerCase() !== "admin") {
    return res.status(403).json({ message: "Chỉ admin có thể thực hiện hành động này" });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };
