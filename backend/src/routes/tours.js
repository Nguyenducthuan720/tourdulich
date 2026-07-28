const express = require("express");
const fs = require("fs");
const path = require("path");
const { sql } = require("../config/db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

function localImageExists(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith("/images/")) {
    return true;
  }

  const imagePath = path.join(__dirname, "..", imageUrl.replace(/^\/images\//, "images/"));
  return fs.existsSync(imagePath);
}

function resolveLocalTourImageUrl(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith("/images/tours/")) {
    return imageUrl;
  }

  if (localImageExists(imageUrl)) {
    return imageUrl;
  }

  const aliases = [
    imageUrl.replace("/halong-", "/ha-long-"),
    imageUrl.replace("/danang-", "/da-nang-"),
    imageUrl.replace("/dalat-", "/da-lat-"),
    imageUrl.replace("/fansipan-", "/Fansipan-"),
    imageUrl.replace(/-\d+(\.\w+)$/, "$1"),
  ];

  return aliases.find(localImageExists) || null;
}

// Lấy danh sách tours (public) - GET /api/tours
router.get("/", async (req, res) => {
  try {
    const { keyword = "", location = "", categoryId = "" } = req.query;

    let query = `
      SELECT t.*, c.CategoryName 
      FROM Tours t 
      LEFT JOIN Categories c ON t.CategoryID = c.CategoryID 
      WHERE 1=1
    `;
    const request = new sql.Request();

    if (categoryId) {
      query += " AND t.CategoryID = @categoryId";
      request.input("categoryId", sql.Int, categoryId);
    }

    if (keyword) {
      query += " AND (t.TourName LIKE @keyword OR t.Description LIKE @keyword OR c.CategoryName LIKE @keyword)";
      request.input("keyword", sql.NVarChar, `%${keyword}%`);
    }

    if (location) {
      query += " AND (t.Destination LIKE @location OR t.DepartureLocation LIKE @location OR t.TourName LIKE @location)";
      request.input("location", sql.NVarChar, `%${location}%`);
    }

    query += " ORDER BY t.TourName";

    const result = await request.query(query);

    res.json({
      items: result.recordset,
    });
  } catch (error) {
    console.error("Get tours error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Lấy chi tiết tour - GET /api/tours/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(404).json({ message: "Không tìm thấy tour" });
    }

    const query = "SELECT * FROM Tours WHERE TourID = @id";
    const request = new sql.Request();
    request.input("id", sql.Int, id);

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy tour" });
    }

    const tour = result.recordset[0];

    // Lấy thêm các ảnh phụ của tour
    const imagesQuery = "SELECT ImageURL FROM TourImages WHERE TourID = @id";
    const imagesResult = await request.query(imagesQuery);
    tour.images = imagesResult.recordset
      .map(img => img.ImageURL)
      .map(resolveLocalTourImageUrl)
      .filter(Boolean)
      .filter(localImageExists);

    res.json(tour);
  } catch (error) {
    console.error("Get tour by id error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Tạo tour (admin) - POST /api/admin/tours
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const {
      title,
      location,
      price,
      duration,
      category,
      seats,
      description,
      image,
      highlights,
      itinerary,
    } = req.body;

    const query = `
      INSERT INTO Tours (TourName, Destination, Price, Duration, CategoryID, AvailableSeats, Description, ImageURL)
      VALUES (@title, @location, @price, @duration, @category, @seats, @description, @image);
      SELECT SCOPE_IDENTITY() as TourID;
    `;

    const request = new sql.Request();
    request.input("title", sql.VarChar, title);
    request.input("location", sql.VarChar, location);
    request.input("price", sql.Numeric(15, 2), price);
    request.input("duration", sql.VarChar, duration);
    request.input("category", sql.VarChar, category);
    request.input("seats", sql.Int, seats);
    request.input("description", sql.VarChar, description);
    request.input("image", sql.VarChar, image);

    const result = await request.query(query);
    const tourId = result.recordset[0].TourID;

    res.status(201).json({
      id: tourId,
      title,
      location,
      price,
      duration,
      category,
      seats,
      description,
      image,
    });
  } catch (error) {
    console.error("Create tour error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Cập nhật tour (admin) - PUT /api/admin/tours/:id
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, location, price, duration, category, seats, description, image } = req.body;

    const query = `
      UPDATE Tours SET 
        TourName = @title,
        Destination = @location,
        Price = @price,
        Duration = @duration,
        CategoryID = @category,
        AvailableSeats = @seats,
        Description = @description,
        ImageURL = @image
      WHERE TourID = @id
    `;

    const request = new sql.Request();
    request.input("id", sql.Int, id);
    request.input("title", sql.VarChar, title);
    request.input("location", sql.VarChar, location);
    request.input("price", sql.Numeric(15, 2), price);
    request.input("duration", sql.VarChar, duration);
    request.input("category", sql.VarChar, category);
    request.input("seats", sql.Int, seats);
    request.input("description", sql.VarChar, description);
    request.input("image", sql.VarChar, image);

    await request.query(query);

    res.json({
      id,
      title,
      location,
      price,
      duration,
      category,
      seats,
      description,
      image,
    });
  } catch (error) {
    console.error("Update tour error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Xóa tour (admin) - DELETE /api/admin/tours/:id
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const query = "DELETE FROM Tours WHERE TourID = @id";
    const request = new sql.Request();
    request.input("id", sql.Int, id);

    await request.query(query);

    res.json({ message: "Xóa tour thành công" });
  } catch (error) {
    console.error("Delete tour error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});
// Lấy danh sách tất cả chuyến bay để hiển thị lên Form Frontend
router.get("/flights", async (req, res) => {
  try {
    const query = `
      SELECT f.*, 
             a1.AirportName as DepartureAirportName, a1.City as DepartureCity,
             a2.AirportName as ArrivalAirportName, a2.City as ArrivalCity
      FROM Flights f
      JOIN Airports a1 ON f.DepartureAirport = a1.AirportCode
      JOIN Airports a2 ON f.ArrivalAirport = a2.AirportCode
      WHERE f.AvailableSeats > 0 AND f.Status = 1
    `;
    const result = await new sql.Request().query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error("Get flights error:", error);
    res.status(500).json({ message: "Lỗi không lấy được danh sách chuyến bay" });
  }
});

module.exports = router;
