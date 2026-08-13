# Design record — nivo app: sidebar chrome, bảng điều khiển, đăng nhập

Duyệt: 2026-08-12, bằng lời người dùng — `ok chốt d` chọn hướng, `ok dứt /starci-fe-design-apply`
duyệt `case-d1` và chuyển sang Apply.
Delivery: `batch` · Mode: `mixed` · Case đã duyệt: `case-d1`
Plan record: `plan-record.json` · Context lock: `context-lock.preview.json`
Preview lab: `preview-lab/` — `http://127.0.0.1:8086/`

## Điều đã duyệt

Sidebar trái thu gọn được làm chrome, chuyển thể từ `CollapsibleSidebar`, `SidebarNavItem` và
`LearnSidebar` của `starci-academy` (`mtp`, `9a1934231`): mở 16rem, thu 4rem, thu tại chỗ không phủ
lên, cờ thu nhớ lại, các cụm ngăn bằng đường kẻ ngang, badge cuối hàng hai tông, dưới `lg` thì ẩn và
nhường cho drawer. Khe `topSlot` của bản gốc giữ `ResumeRail`; ở đây giữ hành động cấp phát.

Bảng điều khiển mở bằng danh sách hệ thống đang chạy; việc cần bạn và ví đứng cạnh nhau ở hàng thứ
hai; thân giữ một cột vì sidebar đã chiếm mép trái.

Đăng nhập giữ nguyên thứ tự của `case-a3` đã duyệt — lối tắt trước, đường kẻ, rồi biểu mẫu, và biểu
mẫu vẫn nằm trong DOM khi đóng để trình quản lý mật khẩu nhìn thấy.

## Ba quyết định sản phẩm nằm trong lượt duyệt này

`second-factor-completed` — màn hình **hoàn tất** yếu tố thứ hai thay vì từ chối. Backend trả
`twoFactorToken` và có `verifyTwoFactor(twoFactorToken, code)`, nên câu "bản dựng này không hoàn tất
được" trong panel đã commit là sai và phải bỏ.

`topslot-provision` — khe trên cùng của sidebar giữ hành động cấp phát.

`one-column-body` — không có rail 288px bên cạnh sidebar.

## Điều KHÔNG được duyệt

**Bảng màu.** Lab dùng bộ trung tính. Duyệt `case-d1` là duyệt thứ bậc, trạng thái và quyền sở hữu,
không phải màu của nivo. Apply không được bê `starci-academy-fe/src/app/globals.css` sang làm thương
hiệu nivo; thiếu giá trị nào thì dừng và hỏi.

Tám đích đến chia ba cụm suy ra từ các query `my*`, không phải từ một sơ đồ điều hướng đã duyệt.

## Phủ trạng thái

Ba mươi mốt mục: 25 dựng thật trong 15 kịch bản, 1 phủ nhờ kịch bản khác, 5 không áp dụng kèm lý do.
Chi tiết từng owner nằm trong `design-record.json`.

Sự thật khi tải: giữ đúng ba hàng nghỉ, nhãn mục và chú thích cột vẫn hiện, chỉ tên, phần định tính
và con số thành khung xám. Không ô nào vừa có giá trị nghỉ vừa có khung xám. Các block về lệch nhịp;
không có cờ tải chung.

## Ranh giới file cho Apply

Chrome: `apps/app/src/app/globals.css`, `apps/app/src/app/layout.tsx`,
`apps/app/src/components/layouts/AppSidebarChrome/`, `packages/ui/src/contracts/index.ts`.

Bảng điều khiển: `apps/app/src/app/page.tsx`, `apps/app/src/components/pages/DashboardPage/`,
`apps/app/src/components/blocks/dashboard/{InstanceList,WorkNeedingYou,WalletSummary}/`,
`apps/app/src/modules/api/`.

Đăng nhập: `apps/app/src/app/(auth)/dang-nhap/`,
`apps/app/src/components/blocks/auth/SignInPanel/`, `apps/app/src/modules/api/`.

## Chưa biết, mang sang Apply nguyên vẹn

Giá trị token của nivo. Từ vựng `status` của `MyInstance`. Không có subscription nên tiến trình dựng
chỉ polling được. `creditBurnUsd` là USD trong khi ví và hoá đơn là VND. `apps/app` chưa có GraphQL
client và chưa có catalogue i18n — cả hai là việc của Apply và bản ghi này không đóng băng hình dạng
nào cho chúng.

## Hướng bị loại

`direction-a` (thanh trên), `direction-b` (nghĩa vụ dẫn trang, kèm đề xuất `myDueWork`),
`direction-c` (cấp phát dẫn trang).

## Không kiểm chứng lại được trong lượt Preview

`nivo-backend` ở cổng 3067 đã tắt trước khi Preview chạy. Toàn bộ chứng cứ schema là bản ghi lại từ
lượt Plan, không dò lại. Apply nên bật lại dịch vụ và xác nhận từng trường trước khi nối truy vấn.
