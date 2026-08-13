# Apply — tiến độ và điểm dừng

Case đã duyệt: `case-d1`. Lock: `context-lock.apply.json`, trạng thái `confirmed`, ranh giới ghi
thu hẹp còn **chỉ `apps/app`** theo lựa chọn của người dùng.

## Đã làm và đã kiểm trên trình duyệt

`apps/app/src/app/globals.css` — thêm `@import "@heroui/styles/css"` và khai báo biến thể `dark`
theo lớp `.dark`. Đây là toàn bộ nguyên nhân khiến mọi màn hình ra HTML trần: các leaf trong
`@nivo/ui` gọi token ngữ nghĩa của HeroUI, và không có stylesheet của vendor thì tên lớp vẫn biên
dịch nhưng phân giải ra không gì cả.

`apps/app/src/app/providers.tsx` — mới. `I18nProvider` khoá `vi` cho react-aria, `ThemeProvider`
của next-themes theo `attribute="class"`. Cố ý **không** có `NextIntlClientProvider`: app này chưa
có catalogue và bản ghi duyệt không đóng băng hình dạng nào cho i18n.

`apps/app/src/app/layout.tsx` — bọc `AppProviders`, thân trang lấy `bg-background text-foreground`.

Bằng chứng đo trên `http://127.0.0.1:3014/dang-nhap`, không lỗi console: nền thân trang
`lab(96.54 …)` thay vì trong suốt, mực `lab(8.34 …)`, nút chính nền `rgb(4,133,247)` bo 24px, ô nhập
bo 12px, cột đăng nhập rộng đúng 384px (`max-w-sm` của `authentication-panel-card`), ba nút lối tắt
cao 36px. Token đã phân giải.

**Màu vẫn chưa quyết.** File chỉ lấy bảng mặc định của HeroUI, không ghi token thương hiệu nào. Bản
ghi duyệt cấm bê `starci-academy-fe/src/app/globals.css` sang làm thương hiệu nivo.

## Điểm dừng, và việc kế tiếp chính xác là gì

**Màn đăng nhập chưa có mặt thẻ.** Route đã dựng đúng chuỗi contract
`centred-authentication-page` → `authentication-panel-card` → `centred-page-column`, nhưng
`authentication-panel-card` chỉ mang `["w-full","max-w-sm"]` — nó là khổ đọc, không phải mặt nền.
Trong StarCi phần nền do một branch vẽ. Việc kế tiếp: chiếu `SurfaceFormCard` của `packages/ui` vào
khe `panel`, đọc API projection của nó trước khi sửa. Kiểm bằng: phải tìm được một `div` rộng khoảng
384px có `background-color` khác trong suốt và có bo góc.

**`layout-app-chrome` và `page-dashboard` bị chặn trong lượt này.** Ba contract đã duyệt —
`sidebar-then-body-app`, `titled-body`, `sidebar-nav-cluster` — sống trong
`packages/ui/src/contracts/index.ts`, nằm ngoài ranh giới ghi đã thu hẹp. Không có chúng thì không
dựng được topology sidebar theo canon (LAYOUT-5: layout không tự viết class). Muốn chạy tiếp hai
owner này thì phải mở lại ranh giới ghi cho file contract đó.

**Chưa động tới:** yếu tố thứ hai của `SignInPanel` (quyết định `second-factor-completed` đã duyệt),
GraphQL client, ba block dashboard, và 15 trạng thái của ma trận kiểm chứng.

## Runtime lúc dừng

Dev server `3014` đang chạy. `nivo-backend` `3067` vẫn tắt — chưa cần, vì chưa nối truy vấn nào.
Lab plan `8082`, lab preview `8086` vẫn chạy.
