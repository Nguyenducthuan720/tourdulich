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
const adminCategoriesRoutes = require("./routes/adminCategories");
const adminDestinationsRoutes = require("./routes/adminDestinations");
const adminFlightsRoutes = require("./routes/adminFlights");
const adminSettingsRoutes = require("./routes/adminSettings");
const adminAIRoutes = require("./routes/adminAI");
const paymentsRoutes = require("./routes/payments");
const bookingsRoutes = require("./routes/bookings");
const usersRoutes = require("./routes/users");
const aiRoutes = require("./routes/ai");
const reviewsRoutes = require("./routes/reviews");

connectDB()
    .then(() => {
        connectMongoDB();
        app.use(cors());
        app.use(express.json());
        
        // Custom image serving with fallback
        const fs = require("fs");
        const path = require("path");
        const { pickFallbackImage } = require("./config/imageFallbacks");
        const imagesDir = path.join(__dirname, "images");
        
        app.use("/images", (req, res) => {
          const relativePath = decodeURIComponent(req.path.replace(/^\/+/, ""));
          const filePath = path.join(imagesDir, relativePath);
          
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.sendFile(filePath);
          } else {
            res.redirect(pickFallbackImage(relativePath));
          }
        });

        app.get("/", (req, res) => {
            res.send("Travel Booking API Running...");
        });

        // Mount routes
        app.use("/api/auth", authRoutes);
        app.use("/api/categories", categoriesRoutes);
        app.use("/api/destinations", destinationsRoutes);
        app.use("/api/admin", adminRoutes);
        app.use("/api/admin/categories", adminCategoriesRoutes);
        app.use("/api/admin/destinations", adminDestinationsRoutes);
        app.use("/api/admin/flights", adminFlightsRoutes);
        app.use("/api/admin/settings", adminSettingsRoutes);
        app.use("/api/admin/ai", adminAIRoutes);
        app.use("/api/payments", paymentsRoutes);
        app.use("/api/tours", toursRoutes);
        app.use("/api/admin/tours", toursRoutes);
        app.use("/api/bookings", bookingsRoutes);
        app.use("/api/admin/bookings", bookingsRoutes);
        app.use("/api/users", usersRoutes);
        app.use("/api/ai", aiRoutes);
        app.use("/api/reviews", reviewsRoutes);

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("[DB] Dừng khởi động backend vì không kết nối được SQL Server:", err.message);
        process.exit(1);
    });
