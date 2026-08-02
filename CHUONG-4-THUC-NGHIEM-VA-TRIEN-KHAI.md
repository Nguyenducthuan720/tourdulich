# Chương 4: Thực nghiệm và Triển khai Hệ thống

## 4.1. Mục đích của chương

Chương 4 trình bày quá trình thực nghiệm và triển khai hệ thống đặt tour du lịch được xây dựng trên nền tảng ReactJS, Node.js/Express, SQL Server và MongoDB. Mục tiêu của chương là kiểm tra tính hoạt động của từng module trong hệ thống, đánh giá mức độ hoàn thiện của các chức năng chính và đề xuất quy trình triển khai thực tế để hệ thống có thể vận hành ổn định trong môi trường sử dụng thật.

Thông qua chương này, người đọc sẽ thấy được hệ thống không chỉ dừng lại ở giai đoạn thiết kế mà đã được triển khai và thử nghiệm thực tế với các chức năng như đăng ký/đăng nhập, quản lý tour, đặt chỗ, quản trị hệ thống và hỗ trợ bằng trí tuệ nhân tạo.

---

## 4.2. Môi trường thực nghiệm

Để tiến hành thử nghiệm, hệ thống được cài đặt và chạy trên môi trường phát triển với các thành phần chính sau:

### 4.2.1. Môi trường Frontend
- Frontend được xây dựng bằng ReactJS kết hợp Vite, nhằm tạo giao diện người dùng hiện đại, phản hồi nhanh và dễ mở rộng.
- Giao diện được chia thành các component như Navbar, SearchBox, CategoryFilter, TourCard, AdminLayout, giúp việc phát triển và bảo trì trở nên thuận tiện hơn.
- Trình duyệt được sử dụng để kiểm tra trải nghiệm người dùng trên các tác vụ như tìm kiếm tour, xem chi tiết, đăng nhập và quản lý dữ liệu.

### 4.2.2. Môi trường Backend
- Backend được xây dựng bằng Node.js và Express.js, đóng vai trò xử lý yêu cầu API, xác thực người dùng và tương tác với cơ sở dữ liệu.
- Các API được tổ chức theo các module như auth, tours, bookings, users, admin và ai.
- Hệ thống sử dụng JWT để xác thực người dùng và bảo vệ các API cần quyền truy cập đặc biệt.

### 4.2.3. Môi trường Cơ sở dữ liệu
- Hệ thống sử dụng SQL Server làm cơ sở dữ liệu chính để lưu trữ thông tin người dùng, tour du lịch, đặt chỗ và các dữ liệu quản trị.
- MongoDB được sử dụng bổ sung cho một số dữ liệu hoặc mục đích mở rộng liên quan đến AI, lưu trữ linh hoạt hơn.
- Các kết nối được cấu hình thông qua file cấu hình và biến môi trường, giúp hệ thống dễ triển khai ở nhiều môi trường khác nhau.

---

## 4.3. Các bước thực nghiệm hệ thống

### 4.3.1. Bước 1: Cài đặt môi trường phát triển
Trước khi thực hiện kiểm thử, cần cài đặt các công cụ hỗ trợ như:
- Node.js
- npm hoặc pnpm
- SQL Server
- MongoDB
- Một trình duyệt hiện đại để test giao diện

Sau đó, cài đặt các dependencies cho cả frontend và backend bằng các lệnh như:

```bash
cd backend
npm install

cd ../travel-client
npm install
```

Quá trình này giúp đảm bảo hệ thống có đầy đủ thư viện cần thiết để chạy đúng chức năng.

### 4.3.2. Bước 2: Cấu hình biến môi trường
Hệ thống cần khai báo các biến môi trường quan trọng trong file .env của backend như:
- PORT: cổng chạy backend
- JWT_SECRET: khóa bí mật cho token xác thực
- MONGO_URI: đường dẫn kết nối MongoDB
- MONGO_DB_NAME: tên database MongoDB

Việc cấu hình đúng các biến môi trường là bước nền tảng để hệ thống kết nối được với database và hoạt động ổn định.

### 4.3.3. Bước 3: Khởi động backend và frontend
Sau khi cài đặt xong, tiến hành chạy hệ thống theo hai luồng riêng biệt:

- Backend chạy ở cổng 5000 theo cấu hình mặc định.
- Frontend chạy bằng Vite, thường ở cổng 5173.

Các lệnh chạy như sau:

```bash
cd backend
npm start
```

```bash
cd travel-client
npm run dev
```

Sau khi chạy thành công, hệ thống có thể được truy cập thông qua giao diện người dùng và các API backend.

### 4.3.4. Bước 4: Kiểm thử chức năng đăng ký và đăng nhập
Đây là chức năng nền tảng của hệ thống. Quá trình thực nghiệm được thực hiện bằng cách:
1. Truy cập trang đăng ký.
2. Nhập họ tên, email và mật khẩu.
3. Gửi yêu cầu đăng ký.
4. Kiểm tra hệ thống tạo tài khoản mới và tự động cấp token đăng nhập.
5. Thực hiện đăng nhập bằng tài khoản vừa tạo để xác nhận tính hợp lệ.

Kết quả thu được là hệ thống cho phép người dùng tạo tài khoản mới, lưu thông tin vào cơ sở dữ liệu và đăng nhập thành công bằng JWT. Đây là nền tảng để các chức năng khác có thể hoạt động trên một hệ thống xác thực đáng tin cậy.

### 4.3.5. Bước 5: Kiểm thử chức năng tìm kiếm và xem tour
Sau khi đăng nhập hoặc truy cập ở chế độ khách, người dùng có thể thực hiện các thao tác sau:
- Tìm kiếm tour theo tên hoặc điểm đến.
- Lọc theo danh mục.
- Xem danh sách các tour du lịch hiện có.
- Nhấn vào tour để xem chi tiết thông tin, giá, thời gian, mô tả và hình ảnh.

Kết quả thực nghiệm cho thấy giao diện hiển thị danh sách tour rõ ràng, công cụ tìm kiếm hoạt động đúng và bộ lọc danh mục giúp người dùng dễ dàng tìm được tour phù hợp. Đây là chức năng quan trọng nhất đối với trải nghiệm người dùng trên hệ thống du lịch.

### 4.3.6. Bước 6: Kiểm thử chức năng đặt chỗ
Một phần quan trọng của hệ thống là chức năng đặt tour. Quá trình kiểm thử được thực hiện như sau:
1. Chọn một tour.
2. Xem thông tin chi tiết.
3. Gửi yêu cầu đặt chỗ.
4. Kiểm tra dữ liệu booking được lưu vào hệ thống.
5. Theo dõi trạng thái đơn đặt trong giao diện quản trị hoặc trang quản lý riêng của người dùng.

Kết quả thực nghiệm cho thấy hệ thống có cơ chế lưu trữ thông tin đặt chỗ, cho phép quản lý và theo dõi các giao dịch một cách có hệ thống. Đây là bước quan trọng để hệ thống có thể vận hành như một nền tảng đặt tour thực tế.

### 4.3.7. Bước 7: Kiểm thử giao diện quản trị
Giao diện quản trị được thử nghiệm với các chức năng chính như:
- Xem thống kê tổng quan về khách hàng, tour, đơn đặt và doanh thu.
- Quản lý tour: thêm, sửa, xóa tour.
- Quản lý người dùng.
- Quản lý đặt chỗ và đánh giá.

Kết quả cho thấy admin có thể thao tác trên hệ thống một cách trực quan và thuận tiện. Giao diện admin giúp giảm khó khăn trong việc quản lý dữ liệu, đặc biệt là khi hệ thống có số lượng tour và người dùng tăng lên.

### 4.3.8. Bước 8: Kiểm thử tích hợp AI
Hệ thống có tích hợp module AI để hỗ trợ người dùng với các câu hỏi liên quan đến tour du lịch. Trong quá trình thực nghiệm, khách hàng có thể hỏi về gợi ý tour, thông tin du lịch hoặc các câu hỏi hỗ trợ nhanh.

Kết quả thực nghiệm cho thấy AI chatbot hoạt động như một công cụ hỗ trợ tích hợp tốt vào hệ thống, tăng trải nghiệm tương tác của người dùng và cung cấp phản hồi nhanh hơn trong các tình huống cần tư vấn.

---

## 4.4. Kết quả thực nghiệm

### 4.4.1. Kết quả chung
Sau khi thực hiện các bước thử nghiệm, hệ thống đã cho thấy các kết quả sau:
- Các chức năng đăng ký, đăng nhập và phân quyền hoạt động tương đối ổn định.
- Giao diện frontend phản hồi tốt, thân thiện và dễ sử dụng.
- Backend có thể xử lý các yêu cầu API chính một cách mượt mà.
- Cơ sở dữ liệu SQL Server và MongoDB có thể kết nối và lưu trữ dữ liệu đúng quy trình.
- Hệ thống có thể triển khai và chạy trên môi trường phát triển mà không gặp lỗi nghiêm trọng về cấu trúc cơ bản.

### 4.4.2. Đánh giá tính đầy đủ chức năng
Hệ thống đã hoàn thiện được các nhóm chức năng chính sau:
1. Chức năng khách hàng: xem tour, tìm kiếm, xem chi tiết, đăng nhập, đăng ký, đặt chỗ.
2. Chức năng quản trị: quản lý tour, quản lý người dùng, quản lý đặt chỗ, thống kê.
3. Chức năng hỗ trợ: tích hợp AI chatbot, tăng khả năng tương tác với người dùng.

Như vậy, hệ thống đã đáp ứng được phần lớn các yêu cầu ban đầu của đề tài, từ trải nghiệm người dùng đến quản trị hệ thống.

### 4.4.3. Đánh giá về giao diện và trải nghiệm người dùng
Giao diện hệ thống có ưu điểm nổi bật là:
- Bố cục rõ ràng, dễ nhìn.
- Có các component tái sử dụng giúp giao diện thống nhất.
- Hỗ trợ tìm kiếm và lọc tour hiệu quả.
- Có giao diện admin chuyên biệt để thuận tiện cho việc quản lý.

Điểm cần cải thiện tiếp trong tương lai là nâng cấp trải nghiệm trên các thiết bị di động, tối ưu hình ảnh và tăng cường các thông báo trạng thái cho người dùng.

---

## 4.5. Quy trình triển khai hệ thống

### 4.5.1. Triển khai ở môi trường phát triển
Môi trường phát triển là môi trường đầu tiên để kiểm tra toàn bộ hệ thống trước khi đưa ra sử dụng thực tế. Trong giai đoạn này, hệ thống được chạy cục bộ trên máy chủ phát triển với các bước:
- Khởi động backend trên cổng 5000.
- Khởi động frontend trên cổng 5173.
- Kết nối với SQL Server và MongoDB.
- Kiểm tra toàn bộ API và giao diện bằng trình duyệt.

Môi trường phát triển phù hợp để phát hiện lỗi sớm, sửa lỗi nhanh và cải thiện trải nghiệm người dùng trước khi triển khai thực tế.

### 4.5.2. Triển khai ở môi trường sản xuất
Để đưa hệ thống vào sử dụng thực tế, có thể triển khai theo mô hình khách hàng-server như sau:
- Frontend có thể được deploy trên các nền tảng như Vercel, Netlify hoặc dịch vụ hosting tĩnh khác.
- Backend có thể chạy trên VPS, Render, Railway hoặc dịch vụ máy chủ chuyên dụng.
- Cơ sở dữ liệu SQL Server nên được đặt trên máy chủ có độ bảo mật và sao lưu tốt.
- MongoDB có thể triển khai trên dịch vụ đám mây hoặc máy chủ riêng.

Trong triển khai thực tế, cần đảm bảo các yếu tố sau:
- Mật khẩu và secret key được lưu an toàn.
- Cấu hình CORS đúng để frontend có thể gọi backend.
- Hệ thống có cơ chế log lỗi và giám sát hoạt động.
- Có kế hoạch backup dữ liệu định kỳ.

### 4.5.3. Bảo mật trong triển khai
Một hệ thống đặt tour du lịch cần chú trọng đến bảo mật thông tin người dùng. Các biện pháp quan trọng bao gồm:
- Mã hóa mật khẩu bằng bcrypt.
- Sử dụng JWT để xác thực người dùng.
- Không lưu trữ thông tin nhạy cảm trong frontend.
- Giới hạn quyền truy cập của admin và khách hàng thông qua middleware kiểm tra phân quyền.
- Cập nhật các thư viện và dependency thường xuyên để tránh lỗ hổng bảo mật.

---

## 4.6. Nhận xét và hướng phát triển

Hệ thống đặt tour du lịch đã được xây dựng và thử nghiệm với các chức năng cốt lõi, đạt được kết quả khá đầy đủ và có tính ứng dụng cao trong thực tế. Những chức năng như đăng ký/đăng nhập, tìm kiếm tour, xem chi tiết, đặt chỗ, quản trị hệ thống và tích hợp AI đều đã được triển khai ở mức có thể vận hành được.

Trong tương lai, hệ thống có thể tiếp tục được nâng cấp theo các hướng sau:
- Thêm chức năng thanh toán trực tuyến.
- Tích hợp bản đồ và định vị điểm đến chi tiết hơn.
- Mở rộng quản lý đánh giá và phản hồi của khách hàng.
- Tăng cường báo cáo thống kê và biểu đồ doanh thu.
- Cải thiện hiệu năng và bảo mật để đáp ứng quy mô sử dụng lớn hơn.

Nhìn chung, đây là một hệ thống có nền tảng vững chắc, phù hợp để phát triển thành sản phẩm thương mại và vận hành thực tế trong lĩnh vực du lịch.

---

## 4.7. Kết luận chương 4

Chương 4 đã trình bày đầy đủ các bước thực nghiệm và triển khai hệ thống đặt tour du lịch. Qua quá trình thử nghiệm, hệ thống cho thấy khả năng vận hành ổn định ở mức phát triển cơ bản, các chức năng quan trọng đã hoạt động đúng và giao diện có thể đáp ứng nhu cầu sử dụng cơ bản của người dùng và quản trị viên.

Việc triển khai hệ thống không chỉ dừng ở việc chạy được chương trình mà còn đòi hỏi sự kiểm tra kỹ lưỡng về bảo mật, hiệu năng và khả năng mở rộng. Với nền tảng hiện tại, hệ thống có thể tiếp tục phát triển thành một sản phẩm du lịch hoàn chỉnh, hiện đại và có tính ứng dụng cao trong thực tế.
