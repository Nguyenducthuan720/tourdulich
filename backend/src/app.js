const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const { connectDB } = require("./config/db");
const { connectMongoDB } = require("./config/mongodb");
// Routes
const authRoutes = require("./routes/auth");
const toursRoutes = require("./routes/tours");
const categoriesRoutes = require("./routes/categories");
const destinationsRoutes = require("./routes/destinations");
const adminRoutes = require("./routes/admin");
const bookingsRoutes = require("./routes/bookings");
const usersRoutes = require("./routes/users");
const aiRoutes = require("./routes/ai");

connectDB();
connectMongoDB();
app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "images")));

app.get("/", (req, res) => {
    res.send("Travel Booking API Running...");
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/destinations", destinationsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/admin/tours", toursRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/admin/bookings", bookingsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/admin/users", usersRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
