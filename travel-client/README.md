# Phân tích Công nghệ dự án Tour Du Lịch

Dưới đây là chi tiết các công nghệ được sử dụng trong dự án, được trình bày theo cấu trúc yêu cầu để phục vụ việc viết báo cáo/đồ án:

## 2.1. Công nghệ Frontend (Giao diện người dùng)

Frontend của dự án được xây dựng dưới dạng một ứng dụng Single Page Application (SPA) nhằm mang lại trải nghiệm mượt mà và tốc độ phản hồi nhanh cho người dùng.

### 2.1.1. React.js & Vite
* **React.js (v19):** Là thư viện JavaScript cốt lõi được sử dụng để xây dựng giao diện người dùng. React cho phép chia nhỏ giao diện thành các component độc lập, dễ tái sử dụng (như `CategoryFilter`, các trang Layout). Cơ chế Virtual DOM của React giúp tối ưu hóa việc cập nhật giao diện mà không cần tải lại toàn bộ trang.
* **Vite:** Được sử dụng làm công cụ build (build tool) và server phát triển. Vite cung cấp tốc độ khởi động server cực nhanh và tính năng Hot Module Replacement (HMR) tức thời, giúp quá trình phát triển frontend trở nên hiệu quả hơn rất nhiều so với Webpack truyền thống.

### 2.1.2. Tailwind CSS
* Tailwind CSS là một framework CSS theo hướng tiện ích (utility-first). Thay vì viết các file CSS riêng lẻ, dự án sử dụng trực tiếp các class của Tailwind vào các thẻ HTML/JSX để tạo kiểu nhanh chóng. Điều này giúp mã nguồn gọn gàng hơn, dễ dàng tùy biến giao diện theo thiết kế hệ thống và đảm bảo tính nhất quán (responsive, màu sắc, khoảng cách) trên toàn bộ ứng dụng.

### 2.1.3. Các thư viện hỗ trợ chính
* **React Router DOM:** Quản lý điều hướng và định tuyến (routing) trong ứng dụng. Cho phép chuyển đổi giữa các trang (như trang chủ, trang đăng nhập, trang quản trị `AdminLayout`) mà không cần tải lại trình duyệt.
* **Axios:** Thư viện HTTP client dựa trên Promise, được sử dụng để gọi API từ frontend tới backend một cách dễ dàng, hỗ trợ tự động chuyển đổi dữ liệu JSON và xử lý các interceptor cho request/response.
* **Leaflet & React-Leaflet:** Thư viện bản đồ mã nguồn mở được tích hợp để hiển thị các bản đồ tương tác (như vị trí địa điểm du lịch, khách sạn), giúp tăng tính trực quan cho hệ thống đặt tour.

## 2.2. Công nghệ Backend (Máy chủ & API)

Backend đóng vai trò xử lý logic nghiệp vụ, xác thực người dùng và giao tiếp với cơ sở dữ liệu, cung cấp các API RESTful cho Frontend.

### 2.2.1. Node.js & Express.js
* **Node.js:** Môi trường chạy JavaScript trên server, cho phép sử dụng cùng một ngôn ngữ (JavaScript) cho cả Frontend và Backend, giúp đồng bộ hệ thống và dễ dàng chia sẻ mã nguồn. Node.js hoạt động theo mô hình non-blocking I/O, rất phù hợp cho các ứng dụng xử lý nhiều request đồng thời.
* **Express.js:** Là một framework web tối giản và linh hoạt chạy trên nền Node.js. Express cung cấp các bộ định tuyến (router) mạnh mẽ và hệ thống middleware để xử lý các request HTTP, quản lý luồng dữ liệu API một cách có hệ thống và dễ bảo trì.

### 2.2.2. Các thành phần và thư viện hỗ trợ
* **Bảo mật và Xác thực:** Dự án sử dụng `jsonwebtoken` (JWT) để tạo token xác thực người dùng sau khi đăng nhập thành công, duy trì phiên làm việc an toàn. Thư viện `bcrypt` được dùng để mã hóa mật khẩu người dùng trước khi lưu vào cơ sở dữ liệu, đảm bảo an toàn thông tin.
* **Quản lý Tệp tin:** Sử dụng `multer` làm middleware để xử lý dữ liệu dạng multipart/form-data, hỗ trợ chức năng upload hình ảnh/tập tin (ví dụ: ảnh đại diện, ảnh tour du lịch) từ phía người dùng lên server.
* **Tích hợp AI:** Dự án có tích hợp API `@google/generative-ai` (Gemini API) nhằm hỗ trợ các tính năng thông minh, có thể là gợi ý tour du lịch, AI chatbot hoặc tự động tạo nội dung mô tả chuyến đi.

## 2.3. Công nghệ Cơ sở dữ liệu (Database)

Cơ sở dữ liệu là nơi lưu trữ toàn bộ thông tin của hệ thống như danh sách người dùng, thông tin tour, địa điểm, lịch trình và các giao dịch đặt chỗ.

### 2.3.1. Microsoft SQL Server
* Dự án sử dụng **SQL Server (TravelBookingDB)** làm hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) chính. SQL Server cung cấp tính toàn vẹn dữ liệu cao, khả năng xử lý các giao dịch phức tạp (ACID) cực kì tốt và hiệu suất truy vấn mạnh mẽ, rất phù hợp cho một hệ thống đặt tour du lịch có nhiều ràng buộc dữ liệu (liên kết giữa tour, khách hàng, thanh toán).
* **Kết nối Node.js với SQL Server:** Sử dụng thư viện `mssql` kết hợp với `msnodesqlv8` để thực hiện các truy vấn từ backend Node.js đến SQL Server. Cơ chế này cho phép thực thi các lệnh T-SQL, gọi Stored Procedure an toàn và hỗ trợ kết nối bảo mật (trustServerCertificate).

---

## Chương 3: Phân tích và Thiết kế hệ thống

### 3.1. Phân tích yêu cầu
Hệ thống quản lý đặt tour du lịch được chia thành hai nhóm đối tượng người dùng chính: Khách hàng (người dùng cuối) và Quản trị viên (Admin).

#### 3.1.1. Yêu cầu chức năng dành cho Khách hàng
* **Xác thực người dùng:** Đăng ký, đăng nhập tài khoản.
* **Tra cứu & Tìm kiếm:** Xem danh sách các tour du lịch, tìm kiếm và lọc tour theo danh mục, điểm đến hoặc mức giá.
* **Xem chi tiết:** Xem thông tin chi tiết về tour, lộ trình, giá cả, đánh giá từ những người dùng khác.
* **Đặt tour:** Thực hiện đặt chỗ cho tour mong muốn.
* **Quản lý cá nhân:** Xem lịch sử đặt tour, cập nhật thông tin cá nhân.
* **Hỗ trợ thông minh:** Tích hợp trợ lý AI để tư vấn, gợi ý tour du lịch phù hợp với nhu cầu.

#### 3.1.2. Yêu cầu chức năng dành cho Quản trị viên (Admin)
* **Quản lý Tour (AdminTours):** Thêm mới, cập nhật, xóa thông tin các tour du lịch.
* **Quản lý Điểm đến & Danh mục (Destinations/Categories):** Thêm, sửa, xóa các danh mục và điểm đến du lịch.
* **Quản lý Đặt chỗ (AdminBookings):** Xem danh sách đặt tour, cập nhật trạng thái đơn đặt (ví dụ: đã xác nhận, đã hoàn thành).
* **Quản lý Người dùng (AdminUsers):** Quản lý tài khoản khách hàng, theo dõi hoạt động.
* **Quản lý Đánh giá (AdminReviews):** Xem và kiểm duyệt các đánh giá của khách hàng.
* **Thống kê tổng quan (AdminDashboard):** Xem báo cáo số liệu, doanh thu, lượng người dùng và tour phổ biến.

### 3.2. Thiết kế Kiến trúc Hệ thống

Hệ thống được thiết kế theo mô hình **Client-Server** thông qua giao tiếp bằng **RESTful API**:
* **Lớp Client (Frontend):** Đóng vai trò hiển thị giao diện, nhận tương tác từ người dùng và gửi các HTTP Request. Kiến trúc Component của React giúp giao diện dễ dàng tái sử dụng và quản lý luồng dữ liệu (State) hiệu quả.
* **Lớp Server (Backend):** Đóng vai trò là trung tâm xử lý logic nghiệp vụ. Tiếp nhận Request từ Client, tiến hành xác thực JWT, thực thi logic (đặt tour, thanh toán) và truy xuất thông tin từ Cơ sở dữ liệu. 
* **Lớp Data (Cơ sở dữ liệu):** Lưu trữ tập trung và an toàn mọi dữ liệu của hệ thống, cung cấp dữ liệu khi Server có yêu cầu truy vấn.

### 3.3. Thiết kế Cơ sở dữ liệu (Mô hình Dữ liệu)
Dựa vào các chức năng đã phân tích, cơ sở dữ liệu (SQL Server) bao gồm các thực thể chính sau:
1. **Bảng Users (Người dùng):** Lưu trữ thông tin tài khoản (ID, Họ tên, Email, Mật khẩu đã mã hóa, Role).
2. **Bảng Tours (Tour du lịch):** Lưu trữ chi tiết tour (ID, Tên tour, Mô tả, Giá, Hình ảnh, ID Danh mục, ID Điểm đến...).
3. **Bảng Bookings (Đặt chỗ):** Lưu thông tin giao dịch (ID, ID_User, ID_Tour, Số lượng khách, Tổng tiền, Trạng thái).
4. **Bảng Categories (Danh mục) & Destinations (Điểm đến):** Quản lý phân loại để tối ưu hóa việc tìm kiếm.
5. **Bảng Reviews (Đánh giá):** (Nếu có) Lưu trữ nhận xét và điểm số đánh giá của khách hàng.

### 3.4. Thiết kế Giao diện (UI/UX)
* **Giao diện Khách hàng:** Hướng tới sự trải nghiệm trực quan, bố cục rõ ràng với hệ thống tìm kiếm dễ sử dụng, thẻ hiển thị tour hấp dẫn và bản đồ vị trí (tích hợp Leaflet) hỗ trợ khách hàng dễ dàng đưa ra quyết định đặt tour.
* **Giao diện Quản trị (Admin Dashboard):** Thiết kế tối giản, tập trung vào chức năng. Sử dụng các bảng biểu (Table), biểu đồ và form nhập liệu rõ ràng để hỗ trợ việc quản lý, thống kê và cập nhật dữ liệu một cách nhanh chóng.
