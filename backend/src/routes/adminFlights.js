const express = require("express");
const { sql } = require("../config/db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const query = `
      SELECT f.*, 
             a1.AirportName as DepartureAirportName, a1.City as DepartureCity,
             a2.AirportName as ArrivalAirportName, a2.City as ArrivalCity
      FROM Flights f
      JOIN Airports a1 ON f.DepartureAirport = a1.AirportCode
      JOIN Airports a2 ON f.ArrivalAirport = a2.AirportCode
      ORDER BY f.FlightID DESC
    `;
    const result = await new sql.Request().query(query);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Get flights error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { airline, flightNumber, departure, arrival, departureTime, arrivalTime, price, seats, status } = req.body;
    
    // Check for duplicate flight (same flight number + departure time)
    const checkQuery = `
      SELECT FlightID FROM Flights 
      WHERE FlightNumber = @flightNumber AND DepartureTime = @departureTime
    `;
    const checkResult = await new sql.Request()
      .input("flightNumber", sql.VarChar, flightNumber)
      .input("departureTime", sql.DateTime, departureTime)
      .query(checkQuery);
    
    if (checkResult.recordset.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Chuyến bay ${flightNumber} lúc ${departureTime} đã tồn tại` 
      });
    }
    
    const query = `
      INSERT INTO Flights (AirlineName, FlightNumber, DepartureAirport, ArrivalAirport, DepartureTime, ArrivalTime, Price, AvailableSeats, Status)
      VALUES (@airline, @flightNumber, @departure, @arrival, @departureTime, @arrivalTime, @price, @seats, @status);
      SELECT SCOPE_IDENTITY() as FlightID;
    `;
    const request = new sql.Request();
    request.input("airline", sql.NVarChar, airline);
    request.input("flightNumber", sql.VarChar, flightNumber);
    request.input("departure", sql.VarChar, departure);
    request.input("arrival", sql.VarChar, arrival);
    request.input("departureTime", sql.DateTime, departureTime);
    request.input("arrivalTime", sql.DateTime, arrivalTime);
    request.input("price", sql.Numeric(15, 2), price);
    request.input("seats", sql.Int, seats);
    request.input("status", sql.Int, status);
    const result = await request.query(query);
    res.status(201).json({ success: true, id: result.recordset[0].FlightID });
  } catch (error) {
    console.error("Create flight error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { airline, flightNumber, departure, arrival, departureTime, arrivalTime, price, seats, status } = req.body;
    const query = `
      UPDATE Flights SET
        AirlineName = @airline,
        FlightNumber = @flightNumber,
        DepartureAirport = @departure,
        ArrivalAirport = @arrival,
        DepartureTime = @departureTime,
        ArrivalTime = @arrivalTime,
        Price = @price,
        AvailableSeats = @seats,
        Status = @status
      WHERE FlightID = @id
    `;
    const request = new sql.Request();
    request.input("id", sql.Int, id);
    request.input("airline", sql.NVarChar, airline);
    request.input("flightNumber", sql.VarChar, flightNumber);
    request.input("departure", sql.VarChar, departure);
    request.input("arrival", sql.VarChar, arrival);
    request.input("departureTime", sql.DateTime, departureTime);
    request.input("arrivalTime", sql.DateTime, arrivalTime);
    request.input("price", sql.Numeric(15, 2), price);
    request.input("seats", sql.Int, seats);
    request.input("status", sql.Int, status);
    await request.query(query);
    res.json({ success: true, id });
  } catch (error) {
    console.error("Update flight error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM Flights WHERE FlightID = @id";
    const request = new sql.Request();
    request.input("id", sql.Int, id);
    await request.query(query);
    res.json({ success: true, message: "Xóa chuyến bay thành công" });
  } catch (error) {
    console.error("Delete flight error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

module.exports = router;
