const express = require("express");
const { sql } = require("../config/db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

// 1. Tạo đặt Tour thường - POST /api/bookings
router.post("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { tourId, date, guests, roomType = 'Standard', paymentMethod = 'Chuyển khoản' } = req.body;

    if (!tourId || !date || !guests) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const tourResult = await new sql.Request()
      .input("tourId", sql.Int, tourId)
      .query("SELECT * FROM Tours WHERE TourID = @tourId");

    if (tourResult.recordset.length === 0) return res.status(404).json({ message: "Không tìm thấy tour" });
    const tour = tourResult.recordset[0];

    const total = (tour.Price + (roomType === 'Deluxe' ? 500000 : roomType === 'Suite' ? 1500000 : 0)) * guests;

    const bookingResult = await new sql.Request()
      .input("userId", sql.Int, userId)
      .input("bookingDate", sql.Date, date)
      .input("total", sql.Decimal(15, 2), total)
      .input("roomType", sql.NVarChar(50), roomType)
      .input("paymentMethod", sql.NVarChar(50), paymentMethod)
      .query(`INSERT INTO Bookings (UserID, BookingDate, TotalAmount, Status) 
              VALUES (@userId, @bookingDate, @total, 'Pending');
              SELECT SCOPE_IDENTITY() as BookingID;`);

    const bookingId = bookingResult.recordset[0].BookingID;

    await new sql.Request()
      .input("bookingId", sql.Int, bookingId)
      .input("tourId", sql.Int, tourId)
      .input("guests", sql.Int, guests)
      .input("unitPrice", sql.Decimal(15, 2), tour.Price)
      .query("INSERT INTO BookingDetails (BookingID, TourID, Quantity, UnitPrice) VALUES (@bookingId, @tourId, @guests, @unitPrice)");

    res.status(201).json({ id: bookingId, total, status: "Cho xac nhan" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 2. Đặt Combo (Tour + Vé máy bay) - POST /api/bookings/combo
router.post("/combo", verifyToken, async (req, res) => {
  const transaction = new sql.Transaction();
  try {
    const userId = req.user.userId;
    const { tourId, flightId, guests, passengerName, idCard, seatNumber, roomType } = req.body;

    await transaction.begin();

    // 1. Kiểm tra và lấy thông tin Tour + trừ số ghế
    const tourRes = await new sql.Request(transaction)
      .input("tid", tourId)
      .query("UPDATE Tours SET AvailableSeats = AvailableSeats - @guests OUTPUT INSERTED.* WHERE TourID = @tid AND AvailableSeats >= @guests");

    if (tourRes.recordset.length === 0) throw new Error("Tour đã hết chỗ hoặc không tồn tại!");
    const tour = tourRes.recordset[0];

    // 2. Kiểm tra và lấy thông tin Chuyến bay + trừ số ghế
    const flightRes = await new sql.Request(transaction)
      .input("fid", flightId)
      .query("UPDATE Flights SET AvailableSeats = AvailableSeats - 1 OUTPUT INSERTED.* WHERE FlightID = @fid AND AvailableSeats >= 1");

    if (flightRes.recordset.length === 0) throw new Error("Chuyến bay đã hết chỗ!");
    const flight = flightRes.recordset[0];

    // 3. Tính toán tổng tiền
    const totalAmount = (tour.Price + (roomType === 'Deluxe' ? 500000 : 0)) * guests + flight.Price;

    // 4. Tạo Booking
    const bRes = await new sql.Request(transaction)
      .input("u", userId).input("d", new Date()).input("t", totalAmount)
      .query("INSERT INTO Bookings (UserID, BookingDate, TotalAmount, Status) VALUES (@u, @d, @t, 'Confirmed'); SELECT SCOPE_IDENTITY() as BID;");
    const bId = bRes.recordset[0].BID;

    // 5. Lưu chi tiết
    await new sql.Request(transaction).input("bid", bId).input("tid", tourId).input("q", guests).input("up", tour.Price)
      .query("INSERT INTO BookingDetails (BookingID, TourID, Quantity, UnitPrice) VALUES (@bid, @tid, @q, @up)");

    await new sql.Request(transaction).input("bid", bId).input("fid", flightId).input("p", passengerName).input("id", idCard).input("s", seatNumber).input("up", flight.Price)
      .query("INSERT INTO FlightBookings (BookingID, FlightID, PassengerName, IdCardOrPassport, SeatNumber, UnitPrice) VALUES (@bid, @fid, @p, @id, @s, @up)");

    await transaction.commit();
    res.status(201).json({ message: "Đặt combo thành công!", bookingId: bId });
  } catch (error) {
    if (transaction.isActive) await transaction.rollback();
    res.status(400).json({ message: error.message });
  }
});

// Đặt vé máy bay độc lập. Thông tin hành khách chính được lấy từ tài khoản.
router.post("/flight", verifyToken, async (req, res) => {
  const transaction = new sql.Transaction();
  try {
    const { flightId, passengerName, idCard, seatNumber, ticketType = "Economy", paymentMethod = "Chuyển khoản" } = req.body;
    if (!flightId || !idCard || !seatNumber) return res.status(400).json({ message: "Vui lòng chọn chuyến bay, ghế và nhập CCCD/Hộ chiếu" });
    await transaction.begin();
    const flightRes = await new sql.Request(transaction).input("fid", sql.Int, flightId)
      .query("UPDATE Flights SET AvailableSeats = AvailableSeats - 1 OUTPUT INSERTED.* WHERE FlightID = @fid AND AvailableSeats >= 1 AND Status = 1");
    if (!flightRes.recordset.length) throw new Error("Chuyến bay đã hết chỗ hoặc không còn hoạt động");
    const flight = flightRes.recordset[0];
    const fareFactor = ticketType === "Business" ? 2.2 : ticketType === "Premium Economy" ? 1.35 : 1;
    const totalAmount = Number(flight.Price) * fareFactor;
    const seatCheck = await new sql.Request(transaction).input("fid", sql.Int, flightId).input("seat", sql.NVarChar(20), seatNumber)
      .query("SELECT 1 FROM FlightBookings WHERE FlightID = @fid AND SeatNumber = @seat");
    if (seatCheck.recordset.length) throw new Error("Ghế này vừa được người khác chọn, vui lòng chọn ghế khác");
    const bookingRes = await new sql.Request(transaction)
      .input("uid", sql.Int, req.user.userId).input("total", sql.Decimal(15, 2), totalAmount)
      .query("INSERT INTO Bookings (UserID, BookingDate, TotalAmount, Status) VALUES (@uid, GETDATE(), @total, 'Confirmed'); SELECT SCOPE_IDENTITY() AS BookingID;");
    const bookingId = bookingRes.recordset[0].BookingID;
    await new sql.Request(transaction).input("bid", sql.Int, bookingId).input("fid", sql.Int, flightId)
      .input("name", sql.NVarChar(200), passengerName || "").input("idcard", sql.NVarChar(50), idCard)
      .input("seat", sql.NVarChar(20), seatNumber || "").input("type", sql.VarChar(50), ticketType).input("price", sql.Decimal(15, 2), totalAmount)
      .query("INSERT INTO FlightBookings (BookingID, FlightID, PassengerName, IdCardOrPassport, SeatNumber, TicketType, UnitPrice) VALUES (@bid, @fid, @name, @idcard, @seat, @type, @price)");
    await transaction.commit();
    res.status(201).json({ bookingId, total: totalAmount, ticketType, status: "Confirmed", paymentMethod });
  } catch (error) {
    if (transaction.isActive) await transaction.rollback();
    res.status(400).json({ message: error.message });
  }
});

// 3. Lấy danh sách cá nhân - GET /api/bookings/my
router.get("/my", verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        b.BookingID as id, 
        b.BookingDate as date, 
        b.TotalAmount as total, 
        b.Status as status, 
        t.TourName as tourTitle, 
        bd.Quantity as guests 
      FROM Bookings b 
      JOIN BookingDetails bd ON b.BookingID = bd.BookingID 
      JOIN Tours t ON bd.TourID = t.TourID 
      WHERE b.UserID = @uid 
      ORDER BY b.BookingDate DESC
    `;
    const result = await new sql.Request()
      .input("uid", sql.Int, req.user.userId)
      .query(query);
    res.json({ items: result.recordset });
  } catch (error) {
    console.error("Get my bookings error:", error);
    res.status(500).json({ message: "Lỗi lấy lịch sử đặt tour" });
  }
});
// Lấy danh sách tất cả chuyến bay để hiển thị lên Form Frontend
router.get("/flights", async (req, res) => {
  try {
    const query = `
      SELECT f.*, 
             a1.AirportName as DepartureAirportName, a1.City as DepartureCity,
             a2.AirportName as ArrivalAirportName, a2.City as ArrivalCity,
             (SELECT STRING_AGG(CAST(fb.SeatNumber AS VARCHAR(MAX)), ',') FROM FlightBookings fb WHERE fb.FlightID = f.FlightID AND fb.SeatNumber IS NOT NULL AND fb.SeatNumber <> '') AS OccupiedSeats
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
