# AGENTS.md — Dự án Tour Du Lịch

## Tổng quan

Nền tảng đặt tour du lịch Việt Nam gồm:
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + React Router v7
- **Backend**: Express 5 + Node.js (CommonJS)
- **Database**: SQL Server (dữ liệu chính) + MongoDB Compass (chat logs)
- **AI**: Google Gemini API (chatbot tư vấn tour)

Kiến trúc: monorepo thô, `backend/` và `travel-client/` là 2 project độc lập.

```
tourdulich/
├── backend/                    # API server (Express 5, port 5000)
│   ├── src/
│   │   ├── app.js              # Entry point, mount routes
│   │   ├── config/
│   │   │   ├── db.js           # SQL Server connection
│   │   │   └── mongodb.js      # MongoDB Compass connection
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT verifyToken + verifyAdmin
│   │   ├── routes/
│   │   │   ├── auth.js         # POST /login, /register
│   │   │   ├── tours.js        # CRUD tours + /flights
│   │   │   ├── categories.js   # GET categories + tours by category
│   │   │   ├── destinations.js # GET destinations
│   │   │   ├── bookings.js     # Tour/flight/combo booking + /flights
│   │   │   ├── users.js        # GET profile + list users
│   │   │   ├── admin.js        # Dashboard stats, users, reviews, bookings
│   │   │   └── ai.js           # POST /chat (Gemini RAG + MongoDB)
│   │   └── images/             # Static images (tours/, destinations/)
│   ├── package.json
│   └── .env                    # PORT, JWT_SECRET, MONGO_URI, GEMINI_API_KEY
│
├── travel-client/              # Frontend (React, port 5173 dev)
│   ├── src/
│   │   ├── main.jsx            # React root
│   │   ├── App.jsx             # AuthProvider + RouterProvider
│   │   ├── App.css
│   │   ├── index.css           # Tailwind
│   │   ├── api/                # Axios client + service modules
│   │   ├── components/         # Navbar, Footer, TourCard, SearchBox, AIChatbot, CategoryFilter
│   │   ├── context/            # AuthContext (login/register/logout)
│   │   ├── data/               # mockData.js (fallback tours)
│   │   ├── layouts/            # MainLayout + AdminLayout
│   │   ├── pages/              # Public pages + admin/ subfolder
│   │   ├── routes/             # AppRoutes.jsx (createBrowserRouter)
│   │   └── utils/              # imageUrl, formatters
│   ├── vite.config.js          # Proxy /api + /images -> localhost:5000
│   ├── package.json
│   └── .env                    # VITE_API_URL
│
├── INSERT-DATA.sql             # Schema + seed data SQL Server
├── ADMIN-SETUP.md              # Admin login guide
└── .gitignore
```

---

## Cách chạy dự án

### Yêu cầu hệ thống
- Node.js >= 18
- SQL Server (local hoặc remote, port 1433, database `TravelBookingDB`)
- MongoDB (local, port 27017, database `tour`)
- Google Gemini API key (tùy chọn, cho chatbot AI)

### Backend

```bash
cd backend
npm install
# Sửa .env với thông tin thực tế (JWT_SECRET, MONGO_URI, GEMINI_API_KEY)
# Chạy INSERT-DATA.sql trên SQL Server để tạo schema + seed data
npm run dev    # nodemon, port 5000
```

### Frontend

```bash
cd travel-client
npm install
npm run dev    # Vite, port 5173, proxy /api + /images -> backend:5000
```

---

## Kiến trúc chi tiết

### Database (SQL Server)

**Các bảng chính:**
- `Users` — FullName, Email, PasswordHash (bcrypt), Role ("Admin"/"Customer"), Status
- `Tours` — TourName, Destination, Price, Duration, AvailableSeats, Description, ImageURL
- `Categories` — CategoryName (Nghỉ dưỡng, Văn hóa, Khám phá...)
- `BookingDetails` — join Bookings-Tours, Quantity, UnitPrice
- `Bookings` — UserID, TotalAmount, Status (Pending/Confirmed)
- `FlightBookings` — BookingID, FlightID, PassengerName, SeatNumber, TicketType
- `Flights` — AirlineName, FlightNumber, Departure/Arrival, Price
- `Airports` — AirportCode (PK), AirportName, City
- `Schedules` — TourID, DayNumber, Activity
- `TourImages` — TourID, ImageURL
- `Reviews` — UserID, TourID, Rating (1-5), Comment
- `Destinations` — static data for display
- Các bảng phụ: Promotions, TourPromotions, Payments, Notifications, FavoriteTours, AIRecommendations

**Lưu ý:**
- SQL Server credentials hiện hardcode trong `db.js` (user: `sa`, password: `123456`). Cần chuyển vào `.env`.
- `INSERT-DATA.sql` tạo toàn bộ schema + insert dữ liệu mẫu. Admin mặc định: `admin@tourdulich.com` / `admin@123456`.

### MongoDB

- Database: `tour`
- Collection: `UserChatSessions`
- Document structure:
  ```json
  {
    "session_id": "string",
    "user_id": null | int,
    "conversations": [{ "sender": "user|assistant", "message": "text", "timestamp": ISODate }],
    "meta_data": { "ip_address": "string", "device": "Desktop|Mobile" },
    "extracted_behavior": {
      "preferred_destinations": ["..."],
      "max_budget_detected": null | int,
      "duration_days_detected": null | int,
      "inferred_tags": ["..."]
    },
    "last_updated": ISODate
  }
  ```

### API Routes

| Method | Path | Auth | Mô tả |
|--------|------|------|------|
| POST | /api/auth/login | No | Đăng nhập, trả về JWT |
| POST | /api/auth/register | No | Đăng ký |
| GET | /api/tours | No | Danh sách tour (keyword, location, categoryId) |
| GET | /api/tours/:id | No | Chi tiết tour + images + schedules |
| GET | /api/tours/flights | No | Danh sách chuyến bay (TRÙNG với bookings) |
| POST | /api/tours | Admin | Tạo tour mới |
| PUT | /api/tours/:id | Admin | Cập nhật tour |
| DELETE | /api/tours/:id | Admin | Xóa tour |
| GET | /api/categories | No | Danh sách loại tour |
| GET | /api/categories/:id/tours | No | Tours theo loại |
| GET | /api/destinations | No | Danh sách điểm đến |
| GET | /api/bookings/my | User | Lịch sử đặt tour cá nhân |
| POST | /api/bookings | User | Đặt tour thường |
| POST | /api/bookings/combo | User | Đặt combo tour + vé bay |
| POST | /api/bookings/flight | User | Đặt vé máy bay riêng |
| GET | /api/bookings/flights | No | Danh sách chuyến bay (TRÙNG) |
| GET | /api/users/profile | User | Profile cá nhân |
| GET | /api/admin/dashboard/stats | Admin | Thống kê dashboard |
| GET/PUT/DELETE | /api/admin/users | Admin | Quản lý users |
| GET/PUT/DELETE | /api/admin/bookings | Admin | Quản lý bookings |
| GET/DELETE | /api/admin/reviews | Admin | Quản lý reviews |
| POST | /api/ai/chat | No | Chatbot Gemini (session_id, user_id, message) |

### JWT Auth flow

1. User login/register -> backend trả `{ token, user: { id, name, email, role } }`
2. Frontend lưu `travel_token` + `travel_user` vào localStorage
3. Axios interceptor gắn `Authorization: Bearer <token>` vào mọi request
4. Middleware `verifyToken` giải mã JWT, `verifyAdmin` kiểm tra role = "admin"
5. 401 response -> tự động xóa token + redirect `/login`

### Frontend Routing

| Path | Component | Auth |
|------|-----------|------|
| / | HomePage | No |
| /tours/:id | TourDetailPage | No |
| /booking/:id | BookingPage | User |
| /my-bookings | MyBookingsPage | User |
| /flight-booking | FlightBookingPage | User |
| /login | LoginPage | No |
| /register | RegisterPage | No |
| /admin | AdminDashboard | Admin |
| /admin/tours | AdminTours | Admin |
| /admin/users | AdminUsers | Admin |
| /admin/bookings | AdminBookings | Admin |
| /admin/reviews | AdminReviews | Admin |

---

## Công nghệ & packages

### Backend
`express`, `mssql` (SQL Server), `mongodb` (MongoDB driver), `jsonwebtoken`, `bcrypt`, `cors`, `dotenv`, `multer`, `@google/generative-ai`, `nodemon`

### Frontend
`react` 19, `react-dom` 19, `react-router-dom` 7, `axios`, `tailwindcss` 4, `@tailwindcss/vite`, `vite` 8, `leaflet` + `react-leaflet` (bản đồ)

---

## Các vấn đề đã biết (technical debt)

1. **Hardcoded SQL credentials** — `backend/src/config/db.js` chứa user/password cứng. Cần chuyển vào `.env`.
2. **Duplicate route `/flights`** — Được định nghĩa trong cả `tours.js` và `bookings.js`. Express sẽ ghi đè, chỉ endpoint load sau hoạt động.
3. **Routes mount trùng** — `tours`, `bookings`, `users` mount vào cả `/api/tours` và `/api/admin/tours`. Admin endpoints (POST/PUT/DELETE) cũng khả dụng tại public path nếu có token admin.
4. **`.gitignore` lỗi chính tả** — dòng 4 bị dính 2 dòng: `/UPDATE-ADMIN-PASSWORD.sqlbackend/.env`.
5. **Thiếu file** — `generate-admin-password.js` và `UPDATE-ADMIN-PASSWORD.sql` được nhắc trong `ADMIN-SETUP.md` nhưng không tồn tại.
6. **Thiếu `GEMINI_API_KEY`** — `.env` chưa có key, AI chatbot sẽ fallback về text tĩnh.
7. **`bookings.js` dùng `new Date()`** thay vì `GETDATE()` cho booking date, có thể lệch múi giờ giữa Node và SQL Server.

---

## Quy ước code

- **Backend**: CommonJS (`require`/`module.exports`), không có controller/model layer tách biệt — logic nằm trong route handler.
- **Frontend**: ES Modules, React functional components + hooks, Tailwind CSS utility classes, `createBrowserRouter` (React Router v7).
- **Tên file**: PascalCase cho components/pages, camelCase cho utils/services.
- **API response structure**: 
  - GET list: `{ items: [...] }` hoặc `{ data: [...], total, page, pages }`
  - GET one: `{ ...tour }` (trực tiếp object)
  - POST/PUT: `{ id, ...fields }`
  - Error: `{ message: "..." }` hoặc `{ error: "..." }`
- **Auth token**: `travel_token` (localStorage key), gửi qua `Authorization: Bearer <token>` header.

---

## Để thêm tính năng mới

1. **Backend**: Thêm route file mới trong `src/routes/`, `require` và `app.use` trong `app.js`
2. **Frontend API**: Thêm service function trong `src/api/`, dùng `apiClient` (đã có sẵn interceptor auth)
3. **Frontend UI**: Thêm page trong `src/pages/` (public) hoặc `src/pages/admin/` (admin), đăng ký route trong `AppRoutes.jsx`
4. **Database**: Thêm bảng qua migration SQL, chạy trực tiếp trên SQL Server
