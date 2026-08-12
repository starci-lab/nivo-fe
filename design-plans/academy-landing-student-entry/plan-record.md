# Plan record — nivo học viện: landing công khai + cửa vào của học viên

> **`status: awaiting-direction-selection`.** Chưa chọn hướng, chưa duyệt gì.
> Không có `approvedCaseId`: plan không tự duyệt mình.
> Đôi cùng nội dung với `plan-record.json`.

| | |
|---|---|
| Delivery | **batch** — 3 owner |
| Mode | **mixed** — landing có render cũ ràng buộc parity; trang auth học viên chưa từng có |
| Parity baseline | `nivo/apps/expert/src/components/blocks/landing/LandingPage.tsx` (chỉ landing) |
| Khuyến nghị | **L-A**, xem lý lẽ ở cuối |

## Điều phải đọc trước

**Code em đã viết chính là L-A, và nó chưa được duyệt.** Em nhảy thẳng vào implement, trong khi luật
của skill nói không có đường tắt từ một câu chỉ đạo tới apply. Hai file
(`apps/expert/src/app/page.tsx`, `.../dang-nhap/page.tsx`) typecheck sạch nhưng phải coi là **bản
nháp**. Chọn hướng khác thì chúng phải sửa hoặc bỏ.

## Ba owner

| id | Mục tiêu | Scope |
|---|---|---|
| `layout-academy-chrome` | `academy/AcademyChrome.tsx` | **layout** |
| `page-academy-landing` | `app/page.tsx` | page |
| `page-academy-auth` | `app/dang-nhap/page.tsx` | page |

`AcademyChrome` là owner riêng chứ không phải chi tiết của trang, vì nó là **chỗ duy nhất đọc bảng
màu**. Gộp nó vào trang là mở đường cho khối khác tự đọc màu, đúng thứ BR-B02 cấm.

## Quyết định dùng chung

**Template được mount thành file lúc provision.** Mỗi học viện là một instance riêng, nên không có
tra cứu tenant lúc chạy. Hệ quả đo được: landing **không còn trạng thái *đang tải* và *lỗi*** — không
có request nào để chờ hay để hỏng. Hai trạng thái đó được đánh `not-applicable` kèm lý do, không bị
bỏ lặng.

**Màu chỉ tới màn hình qua biến CSS do một owner ghi.** Component gọi tên màu sẽ đúng với học viện
nó được viết cạnh, và sai với mọi học viện khác.

**Trang auth phục vụ HỌC VIÊN.** Chuyên gia quản trị từ control plane, nơi họ vốn đã đăng nhập.

**Ảnh là link chuyên gia dán.** nivo không giữ tệp nào, nên *chưa dán link* và *link đã chết* là
trạng thái thường ngày chứ không phải ca hiếm.

## Kiểm kê trạng thái — phân theo owner, không phải theo trang

`state-coverage.md` xếp theo **owner có thể đổi**, và đó là chỗ bản kiểm kê đầu của em hụt ba lỗ:
`AcademyChrome` không có mục nào, khối tương tác thiếu *pending / disabled / focus*, và responsive bị
bỏ trắng — mà luật cấm đánh N/A cho responsive nếu không có bằng chứng.

**`layout-academy-chrome` (7 bắt buộc)** — bảng màu đã provision · bảng màu mặc định · **bảng màu thứ
hai** · có CSS riêng · không có CSS riêng · mobile · desktop.

**`page-academy-landing` (14)** — mặc định chưa provision · đủ khối · tắt khối · đổi thứ tự · chưa có
khoá học · sáu hình thù khối tự tạo · thiếu ảnh · ảnh hỏng · bảng màu thứ hai · mobile · desktop ·
form lead đang gửi · form lead lỗi · bàn phím/tiêu điểm.

**`page-academy-auth` (14)** — đăng ký nghỉ · đăng nhập nghỉ · đang gửi · bị từ chối · đã gửi liên kết
· 2FA chưa hỗ trợ · rời trang sang provider · callback thất bại · mang màu học viện · mobile ·
desktop · **đã đăng nhập rồi** · bàn phím/tiêu điểm · nút provider bị khoá khi đang gửi.

**Sáu N/A, tất cả có bằng chứng.** Đáng nói nhất là **giao diện tối**: bảng màu thuộc về **học viện**,
không thuộc về người xem. Một chuyên gia có thể chọn bảng tối — lab đã có một cái — nhưng **không có
công tắc của người xem** để render một chủ đề thứ hai.

## Ba brief

Xem bảng so sánh trong tin nhắn. Tóm tắt:

**L-A · Thang bậc theo thứ tự catalog.** Không cần một tuyên bố chưa chứng minh nào. Trang dài nhất.

**L-B · Bằng chứng trước giá.** Dẫn bằng bậc mà cả ba trang tham chiếu dựa vào nặng nhất — nhưng
**sập vào ngày đầu**, khi học viện chưa có ảnh, chưa có cảm nhận, chưa có số liệu.

**L-C · Mỗi lúc một câu hỏi.** Đường ngắn nhất tới lead, nhưng **nửa auth không ship được** (BE-4).

## Đề xuất từ vựng

| Tier | Tên | Quyết định | Vì sao hẹp nhất |
|---|---|---|---|
| layout | `AcademyChrome` | **owner mới** | Người đọc duy nhất của template và người ghi duy nhất của bảng màu. Một hook mọi khối gọi được thì rải một quyết định ra khắp nơi và không còn chỗ nào để chứng minh việc phối màu chạy đúng. |
| block | `StudentEntryPanel` | **owner mới** | `SignInPanel` của control plane cân cho người **đã có** tài khoản. Cửa vào của học viên dẫn bằng đăng ký — một câu sản phẩm khác, không phải một biến thể. Thêm cờ chế độ vào `SignInPanel` là bắt một khối trả lời hai câu hỏi khác nhau tuỳ một boolean. |

Không cần leaf hay composite mới nào: `Input`, `Field`, `Button`, `Divider`, `Heading`, `Text`,
`TextLink` đã có đủ trạng thái cần.

## Đề xuất backend

**BE-4 · `backend-design`, và em nêu ra để bác bỏ chứ không phải để đề xuất.** L-C hỏi email trước
rồi mới hỏi mật khẩu, tức cần backend trả lời *"email này có tài khoản chưa"* — đúng điều e2e
`password-reset` chứng minh sản phẩm **cố ý từ chối tiết lộ**. Đây là lý do nửa auth của L-C gãy.

## Ẩn số

| id | Ẩn số | Chặn chọn hướng? |
|---|---|---|
| U-A | Ảnh ngoài lộ IP học viên cho bên thứ ba. Đã đặt `no-referrer`, nhưng nó không giấu được địa chỉ | không |
| U-B | `stats`, `testimonials`, bằng cấp là **tuyên bố không kiểm được** chạy trên hạ tầng nivo. Cùng họ với BR-B07, khác cơ chế, chưa luật nào phủ | không — nhưng **L-B dồn hết chúng lên đầu trang** |
| U-C | `instructor` là khối hệ thống hay tự tạo? Ca đầu tiên BR-B06 không cắt gọn | không |
| U-D | Học viện chạy tên miền riêng hay subdomain nivo? | không |
| U-E | Ba bậc mô hình dự đoán mà không trang tham chiếu nào có: `guarantee`, `audience`, `schedule` | không — chưa dựng |
| U-F | **Học viên đã đăng nhập rồi thì đi đâu?** Chưa có route đích nào được chứng minh; học viện chưa có trang trong | **có, với mọi hướng** |

U-F mới lộ ra khi em kiểm kê theo owner. Nó không đổi việc chọn hướng, nhưng phải giải trước khi
preview đóng băng ma trận trạng thái.

## Bước tiếp

Thầy chọn một brief, hoặc nêu bản trộn kèm nét muốn giữ. Em cập nhật record thành
`direction-selected` rồi mới sang preview. **Im lặng không phải là chọn**, và khuyến nghị của em
cũng không.
