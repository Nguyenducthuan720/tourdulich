const express = require("express");
const crypto = require("crypto");
const { sql } = require("../config/db");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// ===========================
// CONFIG
// ===========================
const VNPAY_TMN_CODE = process.env.VNPAY_TMN_CODE || "";
const VNPAY_HASH_SECRET = process.env.VNPAY_HASH_SECRET || "";
const VNPAY_URL = process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const VNPAY_RETURN_URL = process.env.VNPAY_RETURN_URL || "http://localhost:5173/payment/result";

const MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE || "";
const MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY || "";
const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY || "";
const MOMO_RETURN_URL = process.env.MOMO_RETURN_URL || "http://localhost:5173/payment/result";
const MOMO_IPN_URL = process.env.MOMO_IPN_URL || "http://localhost:5000/api/payments/momo/ipn";
const MOMO_ENDPOINT = process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create";

// Bank transfer (VietQR) config
const BANK_ID = process.env.BANK_ID || "";
const BANK_ACCOUNT_NO = process.env.BANK_ACCOUNT_NO || "";
const BANK_ACCOUNT_NAME = process.env.BANK_ACCOUNT_NAME || "";

// Placeholder guard: "YOUR_..." means the gateway is not configured yet
const isConfigured = (value) =>
  Boolean(value) && !String(value).trim().toUpperCase().startsWith("YOUR_");

const VNPAY_CONFIGURED =
  isConfigured(VNPAY_TMN_CODE) && isConfigured(VNPAY_HASH_SECRET);
const MOMO_CONFIGURED =
  isConfigured(MOMO_PARTNER_CODE) &&
  isConfigured(MOMO_ACCESS_KEY) &&
  isConfigured(MOMO_SECRET_KEY);

const PENDING_REUSE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// ===========================
// HELPERS
// ===========================
const formatVnpDate = (date = new Date()) => {
  const p = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}` +
    `${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}`
  );
};

// VNPay expects params sorted A→Z with values URL-encoded, spaces as '+'
const buildVnpQuery = (params) => {
  const sorted = {};
  Object.keys(params)
    .map((k) => encodeURIComponent(k))
    .sort()
    .forEach((k) => {
      sorted[k] = encodeURIComponent(params[k]).replace(/%20/g, "+");
    });
  return sorted;
};

function createVNPayUrl({ bookingId, amount, orderInfo, txnRef, ipAddr }) {
  const params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: VNPAY_TMN_CODE,
    vnp_Amount: Math.round(amount * 100),
    vnp_CurrCode: "VND",
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo || `Thanh toan don hang ${bookingId}`,
    vnp_OrderType: "billpayment",
    vnp_Locale: "vn",
    vnp_ReturnUrl: VNPAY_RETURN_URL,
    vnp_IpAddr: ipAddr || "127.0.0.1",
    vnp_CreateDate: formatVnpDate(),
  };

  const signed = buildVnpQuery(params);
  const signData = Object.entries(signed)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  const secureHash = crypto
    .createHmac("sha512", VNPAY_HASH_SECRET)
    .update(signData)
    .digest("hex");

  const query = `${signData}&vnp_SecureHash=${secureHash}`;
  return `${VNPAY_URL}?${query}`;
}

async function createMoMoPayment({ bookingId, amount, orderInfo, txnRef }) {
  const orderId = txnRef;
  const requestId = txnRef;
  const orderInfoText = orderInfo || `Thanh toan don hang ${bookingId}`;

  // MoMo signs RAW values (not URL-encoded)
  const rawSignature =
    `accessKey=${MOMO_ACCESS_KEY}` +
    `&amount=${Math.round(amount)}` +
    `&extraData=` +
    `&ipnUrl=${MOMO_IPN_URL}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfoText}` +
    `&partnerCode=${MOMO_PARTNER_CODE}` +
    `&redirectUrl=${MOMO_RETURN_URL}` +
    `&requestId=${requestId}` +
    `&requestType=captureWallet`;

  const signature = crypto
    .createHmac("sha256", MOMO_SECRET_KEY)
    .update(rawSignature)
    .digest("hex");

  const body = {
    partnerCode: MOMO_PARTNER_CODE,
    accessKey: MOMO_ACCESS_KEY,
    requestId,
    orderId,
    amount: Math.round(amount),
    orderInfo: orderInfoText,
    returnUrl: MOMO_RETURN_URL,
    notifyUrl: MOMO_IPN_URL,
    extraData: "",
    requestType: "captureWallet",
    signature,
  };

  const response = await fetch(MOMO_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return response.json();
}

// VietQR image URL so the customer can scan with any banking app
function buildBankQr(txnRef, amount) {
  if (!BANK_ID || !BANK_ACCOUNT_NO) return null;
  const addInfo = encodeURIComponent(`Thanh toan ${txnRef}`);
  const accountName = encodeURIComponent(BANK_ACCOUNT_NAME);
  return `https://img.vietqr.io/image/${BANK_ID}-${BANK_ACCOUNT_NO}-compact2.png?amount=${Math.round(
    amount
  )}&addInfo=${addInfo}&accountName=${accountName}`;
}

// Fake QR used in demo mode so the UI flow can be tested without a merchant account
function buildDemoQr(method, txnRef, amount) {
  const label = method === "momo" ? "MOMO" : "VNPAY";
  const payload =
    `${label}://demo-payment` +
    `?orderId=${txnRef}` +
    `&amount=${Math.round(amount)}` +
    `&note=${encodeURIComponent(`Thanh toan don hang ${txnRef}`)}` +
    `&env=sandbox`;

  return {
    payload,
    qrUrl: `https://quickchart.io/qr?size=280&margin=1&text=${encodeURIComponent(payload)}`,
  };
}

async function findReusablePayment(bookingId, method) {
  const result = await new sql.Request()
    .input("bookingId", sql.Int, bookingId)
    .input("method", sql.NVarChar, method)
    .query(`
      SELECT TOP 1 PaymentID, TxnRef, Amount, CreatedAt
      FROM Payments
      WHERE BookingID = @bookingId AND Method = @method AND Status = 'Pending'
      ORDER BY PaymentID DESC
    `);

  if (!result.recordset.length) return null;

  const row = result.recordset[0];
  const age = Date.now() - new Date(row.CreatedAt).getTime();
  if (age > PENDING_REUSE_WINDOW_MS) return null;

  return row;
}

// ===========================
// POST /api/payments/create
// ===========================
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { bookingId, amount, method, orderInfo } = req.body;

    if (!bookingId || !amount || !method) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin thanh toán" });
    }

    // Already-paid guard: never create a second payment for a settled booking
    const paidCheck = await new sql.Request()
      .input("bookingId", sql.Int, bookingId)
      .query(`
        SELECT TOP 1 TxnRef FROM Payments
        WHERE BookingID = @bookingId AND Status = 'Success'
        ORDER BY PaymentID DESC
      `);

    if (paidCheck.recordset.length) {
      return res.status(409).json({
        success: false,
        message: "Đơn hàng này đã được thanh toán",
      });
    }

    // Idempotency: reuse a recent Pending payment instead of creating a duplicate
    const reusable = await findReusablePayment(bookingId, method);
    const txnRef =
      reusable?.TxnRef || `${String(method).toUpperCase()}-${bookingId}-${Date.now()}`;

    if (!reusable) {
      await new sql.Request()
        .input("bookingId", sql.Int, bookingId)
        .input("method", sql.NVarChar, method)
        .input("amount", sql.Numeric(15, 2), amount)
        .input("txnRef", sql.NVarChar, txnRef)
        .query(`
          INSERT INTO Payments (BookingID, Method, Amount, Status, TxnRef)
          VALUES (@bookingId, @method, @amount, 'Pending', @txnRef);
        `);
    }

    // Bank transfer: return QR, no redirect needed
    if (method === "bank_transfer" || method === "Chuyển khoản") {
      const qrUrl = buildBankQr(txnRef, amount);
      return res.json({
        success: true,
        configured: Boolean(qrUrl),
        method: "bank_transfer",
        txnRef,
        reused: Boolean(reusable),
        bank: qrUrl
          ? {
              bankId: BANK_ID,
              accountNo: BANK_ACCOUNT_NO,
              accountName: BANK_ACCOUNT_NAME,
              qrUrl,
            }
          : null,
        message: qrUrl
          ? "Quét mã QR để chuyển khoản"
          : "Chưa cấu hình tài khoản ngân hàng (BANK_ID / BANK_ACCOUNT_NO)",
      });
    }

    if (method === "vnpay" && !VNPAY_CONFIGURED) {
      return res.json({
        success: true,
        configured: false,
        method,
        txnRef,
        reused: Boolean(reusable),
        demo: buildDemoQr("vnpay", txnRef, amount),
        message: "VNPay chưa được cấu hình. Đang chạy chế độ demo.",
      });
    }

    if (method === "momo" && !MOMO_CONFIGURED) {
      return res.json({
        success: true,
        configured: false,
        method,
        txnRef,
        reused: Boolean(reusable),
        demo: buildDemoQr("momo", txnRef, amount),
        message: "MoMo chưa được cấu hình. Đang chạy chế độ demo.",
      });
    }

    let paymentUrl = "";

    if (method === "vnpay") {
      const ipAddr =
        (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
        req.socket?.remoteAddress ||
        "127.0.0.1";
      paymentUrl = createVNPayUrl({ bookingId, amount, orderInfo, txnRef, ipAddr });
    } else if (method === "momo") {
      const momoResponse = await createMoMoPayment({ bookingId, amount, orderInfo, txnRef });
      paymentUrl = momoResponse.payUrl || "";

      if (!paymentUrl) {
        await new sql.Request()
          .input("txnRef", sql.NVarChar, txnRef)
          .input("responseMessage", sql.NVarChar, momoResponse.message || "MoMo từ chối giao dịch")
          .query(`
            UPDATE Payments
            SET Status = 'Failed', ResponseMessage = @responseMessage
            WHERE TxnRef = @txnRef
          `);
        return res.status(502).json({
          success: false,
          method,
          txnRef,
          message: momoResponse.message || "MoMo từ chối giao dịch",
        });
      }
    }

    res.json({
      success: true,
      configured: true,
      method,
      paymentUrl,
      txnRef,
      reused: Boolean(reusable),
    });
  } catch (error) {
    console.error("[payments] create error", error);
    res.status(500).json({ success: false, message: "Lỗi tạo thanh toán" });
  }
});

// ===========================
// POST /api/payments/simulate/:txnRef  (demo only)
// ===========================
router.post("/simulate/:txnRef", verifyToken, async (req, res) => {
  try {
    const { txnRef } = req.params;
    const { result = "success" } = req.body || {};

    if (VNPAY_CONFIGURED || MOMO_CONFIGURED) {
      return res.status(400).json({
        success: false,
        message: "Chế độ demo chỉ dùng khi cổng thanh toán chưa được cấu hình",
      });
    }

    const status = result === "success" ? "Success" : "Failed";

    const update = await new sql.Request()
      .input("txnRef", sql.NVarChar, txnRef)
      .input("status", sql.NVarChar, status)
      .input("paidAt", sql.DateTime, status === "Success" ? new Date() : null)
      .query(`
        UPDATE Payments
        SET Status = @status, ResponseCode = 'DEMO', ResponseMessage = 'Demo payment',
            PaidAt = @paidAt
        WHERE TxnRef = @txnRef
      `);

    if (update.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy giao dịch" });
    }

    if (status === "Success") {
      await new sql.Request()
        .input("txnRef", sql.NVarChar, txnRef)
        .query(`
          UPDATE Bookings
          SET Status = 'Confirmed'
          WHERE BookingID IN (SELECT BookingID FROM Payments WHERE TxnRef = @txnRef)
        `);
    }

    res.json({ success: true, status, txnRef });
  } catch (error) {
    console.error("[payments] simulate error", error);
    res.status(500).json({ success: false, message: "Lỗi mô phỏng thanh toán" });
  }
});

// ===========================
// GET /api/payments/vnpay/callback
// ===========================
router.get("/vnpay/callback", async (req, res) => {
  try {
    const query = { ...req.query };
    const vnpSecureHash = query.vnp_SecureHash;
    delete query.vnp_SecureHash;
    delete query.vnp_SecureHashType;

    const signed = buildVnpQuery(query);
    const signData = Object.entries(signed)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");

    const expectedHash = crypto
      .createHmac("sha512", VNPAY_HASH_SECRET)
      .update(signData)
      .digest("hex");

    const validSignature = vnpSecureHash === expectedHash;
    const success = validSignature && query.vnp_ResponseCode === "00";
    const status = success ? "Success" : "Failed";

    await new sql.Request()
      .input("txnRef", sql.NVarChar, query.vnp_TxnRef)
      .input("status", sql.NVarChar, status)
      .input("responseCode", sql.NVarChar, query.vnp_ResponseCode)
      .input("bankCode", sql.NVarChar, query.vnp_BankCode)
      .input("responseMessage", sql.NVarChar, validSignature ? "VNPay callback" : "Sai chữ ký")
      .input("paidAt", sql.DateTime, success ? new Date() : null)
      .query(`
        UPDATE Payments
        SET Status = @status, ResponseCode = @responseCode, BankCode = @bankCode,
            ResponseMessage = @responseMessage, PaidAt = @paidAt
        WHERE TxnRef = @txnRef
      `);

    if (success) {
      await new sql.Request()
        .input("txnRef", sql.NVarChar, query.vnp_TxnRef)
        .query(`
          UPDATE Bookings SET Status = 'Confirmed'
          WHERE BookingID IN (SELECT BookingID FROM Payments WHERE TxnRef = @txnRef)
        `);
    }

    res.redirect(`${VNPAY_RETURN_URL}?txnRef=${query.vnp_TxnRef}&status=${status}&method=vnpay`);
  } catch (error) {
    console.error("[payments] VNPay callback error", error);
    res.redirect(`${VNPAY_RETURN_URL}?status=Failed&method=vnpay`);
  }
});

// ===========================
// POST /api/payments/momo/ipn
// ===========================
router.post("/momo/ipn", async (req, res) => {
  try {
    const body = req.body || {};

    // Verify MoMo signature
    const rawSignature =
      `accessKey=${MOMO_ACCESS_KEY}` +
      `&amount=${body.amount ?? ""}` +
      `&extraData=${body.extraData ?? ""}` +
      `&message=${body.message ?? ""}` +
      `&orderId=${body.orderId ?? ""}` +
      `&orderInfo=${body.orderInfo ?? ""}` +
      `&orderType=${body.orderType ?? ""}` +
      `&partnerCode=${body.partnerCode ?? ""}` +
      `&payType=${body.payType ?? ""}` +
      `&requestId=${body.requestId ?? ""}` +
      `&responseTime=${body.responseTime ?? ""}` +
      `&resultCode=${body.resultCode ?? ""}` +
      `&transId=${body.transId ?? ""}`;

    const expectedSignature = crypto
      .createHmac("sha256", MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest("hex");

    if (!MOMO_CONFIGURED || expectedSignature !== body.signature) {
      return res.status(400).json({ success: false, message: "Sai chữ ký MoMo" });
    }

    const success = Number(body.resultCode) === 0;
    const status = success ? "Success" : "Failed";

    await new sql.Request()
      .input("txnRef", sql.NVarChar, body.orderId)
      .input("status", sql.NVarChar, status)
      .input("responseCode", sql.NVarChar, String(body.resultCode))
      .input("responseMessage", sql.NVarChar, body.message || "")
      .input("paidAt", sql.DateTime, success ? new Date() : null)
      .query(`
        UPDATE Payments
        SET Status = @status, ResponseCode = @responseCode,
            ResponseMessage = @responseMessage, PaidAt = @paidAt
        WHERE TxnRef = @txnRef
      `);

    if (success) {
      await new sql.Request()
        .input("txnRef", sql.NVarChar, body.orderId)
        .query(`
          UPDATE Bookings SET Status = 'Confirmed'
          WHERE BookingID IN (SELECT BookingID FROM Payments WHERE TxnRef = @txnRef)
        `);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("[payments] MoMo IPN error", error);
    res.status(500).json({ success: false });
  }
});

// ===========================
// GET /api/payments/momo/return
// ===========================
router.get("/momo/return", async (req, res) => {
  try {
    const { orderId, resultCode } = req.query;
    const status = String(resultCode) === "0" ? "Success" : "Failed";

    res.redirect(`${MOMO_RETURN_URL}?txnRef=${orderId}&status=${status}&method=momo`);
  } catch (error) {
    console.error("[payments] MoMo return error", error);
    res.redirect(`${MOMO_RETURN_URL}?status=Failed&method=momo`);
  }
});

// ===========================
// GET /api/payments/status/:txnRef
// ===========================
router.get("/status/:txnRef", verifyToken, async (req, res) => {
  try {
    const { txnRef } = req.params;
    const result = await new sql.Request()
      .input("txnRef", sql.NVarChar, txnRef)
      .query("SELECT * FROM Payments WHERE TxnRef = @txnRef");

    if (!result.recordset.length) {
      return res.status(404).json({ success: false, message: "Không tìm thấy giao dịch" });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error("[payments] status error", error);
    res.status(500).json({ success: false, message: "Lỗi lấy trạng thái thanh toán" });
  }
});

module.exports = router;
