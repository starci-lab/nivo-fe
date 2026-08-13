# Plan record — nivo app: đăng nhập và bảng điều khiển

Status: `direction-selected` — `direction-d` (sidebar thu gọn được, theo `LearnSidebar`)
Delivery: `batch` · Mode: `mixed` (đăng nhập là sửa đúng bản đã duyệt; bảng điều khiển là sáng tạo)
Direction lab: `http://127.0.0.1:8082/` — `D:\Repositories\nivo-fe\design-plans\app-signin-dashboard\direction-lab`

## Vì sao hai màn này đi chung một lượt

Chúng chia nhau một điều kiện tiên quyết. `apps/app/src/app/globals.css` hiện dài đúng chín dòng:
một `@import "tailwindcss"` và một `@source` trỏ sang `packages/ui/src`. Không có
`@import "@heroui/styles/css"`, không có tầng token. Trong khi đó `packages/ui` viết `text-muted`
18 lần, `bg-default` 12 lần, `text-foreground` 6 lần và `bg-surface` 5 lần — không token nào phân
giải được. Đó là lý do mọi màn hình trong `apps/app` ra HTML trần, kể cả trang đăng nhập vốn đã
được duyệt và commit. Sửa tầng đó là việc chung; chọn hướng cho bảng điều khiển là việc riêng.

Giá trị của token thì chưa quyết. Bê nguyên 301 dòng `globals.css` của `starci-academy-fe` sang sẽ
khiến nivo mặc thương hiệu của StarCi Academy. Lab dùng một bộ trung tính để đọc được thứ bậc mà
không giả vờ câu hỏi thương hiệu đã xong.

## Chứng cứ nghiệp vụ

Đọc trực tiếp từ schema GraphQL của `nivo-backend` đang chạy ở `127.0.0.1:3067`: 59 query, 102
mutation, 0 subscription.

Đăng nhập có thật và đủ: `signIn(email, password)` trả `AuthPayload { accessToken,
requiresTwoFactor, twoFactorToken }`, kèm `verifyTwoFactor`, `exchangeOauthCode(code, codeVerifier,
redirectUri)`, `requestPasswordReset`, `resetPassword`, `signUp`, `refreshSession`.

Bảng điều khiển có thể nói thật về: `myInstances` (`name`, `product`, `plan`, `ram`, `status`,
`renewsAt`, `creditBurnUsd`), `myWallet` (`balanceVnd`), `myInvoices` (`amountVnd`, `dueAt`,
`status`, `gatewayCheckoutUrl`), `myCatalogOrders` (`status`, `renewsAt`, `autoRenew`),
`myExpertSites` (`provisionStatus`, `provisionError`, `publishedAt`, `customDomain`),
`myAgentWorkspace`, `myDomains`, `myTickets`, `myOpsTickets`.

Không có subscription nào, nên mọi tiến trình "đang dựng" chỉ có thể là polling.

## Một xung đột phải giải trước khi Preview đóng băng

`SignInPanel` hiện có state `twoFactorUnsupported` với chú thích rằng bản dựng này không hoàn tất
được yếu tố thứ hai. Nhưng backend trả `twoFactorToken` và có `verifyTwoFactor(twoFactorToken,
code)`. Hoặc màn hình hoàn tất thử thách, hoặc giữ lời từ chối trung thực — Preview phải chọn, chứ
không được để nguyên câu nói sai về năng lực của hệ thống.

## Ngữ pháp: dùng lại gì, từ chối gì

Dùng lại: `nav-over-body-page`, `centred-authentication-page`, `authentication-panel-card`,
`label-row-over-card`, `stacked-sections`, cùng các branch surface và leaf sẵn có.

Từ chối: `dashboard-main` và `dashboard-rail-then-main`. `why` của chúng nói thẳng rằng bản tổng
quan production có **tám** mục học viên theo thứ tự cố định. Bảng điều khiển của nivo là mặt cấp
phát và vận hành; mượn hai contract đó là nói dối chính `why` của chúng.

Thêm mới, chung cho mọi hướng: tầng token trong `globals.css`, provider trong `layout.tsx`, và
`AppChrome` làm chrome sống qua điều hướng.

## Bốn hướng

| Hướng | Luận điểm | CTA chính | Cấu trúc | Backend | Mạnh nhất | Đánh đổi |
|---|---|---|---|---|---|---|
| `direction-a` Đội hệ thống dẫn trang | Người đọc mở trang để biết thứ mình đang chạy còn sống không | Mở một hệ thống | Rail 288px + cột chính; danh sách hệ thống dẫn, việc cần làm thứ hai | Không cần thêm | Đúng với câu app tự mô tả: cấp phát và vận hành | Tài khoản ngày đầu thấy mục dẫn rỗng |
| `direction-b` Nghĩa vụ dẫn trang | Thứ duy nhất giết một hệ thống đang chạy là quên trả tiền | Thanh toán / nạp ví | Một cột; việc có hạn trên cùng, hệ thống thành lưới 2 cột | Đề xuất `myDueWork` (additive) | Mở đúng vào thứ thật sự làm hỏng sản phẩm | Đọc như bảng công nợ; ngày lành mạnh thì mục dẫn rỗng |
| `direction-c` Cấp phát dẫn trang | nivo bán việc dựng hệ thống, nên mở bằng cái đang dựng và cái dựng tiếp | Cấp phát sản phẩm | Tiến trình trên cùng, kệ sản phẩm, rồi phần đã bàn giao | Không cần thêm | Tài khoản mới không có trạng thái rỗng nào phải giải thích | Yếu nhất với người đã chạy ba hệ thống; chi tiết tiến trình chưa có field |
| `direction-d` Sidebar thu gọn được | Như A, nhưng điều hướng nằm ở sidebar trái thu gọn được | Mở một hệ thống | `CollapsibleSidebar` 16rem ↔ 4rem + thân một cột | Không cần thêm | Tám đích đến luôn thấy, một lần bấm là tới | Dưới `lg` cần drawer và thanh tab đáy — nivo chưa có cả hai |

`direction-d` được thêm sau khi người dùng hỏi về sidebar trái. Tham chiếu là **sidebar của trang
học** — `starci-academy/src/components/blocks/navigation/CollapsibleSidebar` cùng `LearnSidebar`
trong `/courses/[courseId]/learn` — chứ không phải rail 288px của dashboard StarCi, vốn là
`IdentityRail` + `QuickActions` do trang vẽ dưới một navbar trên. Số đo lấy từ chính nguồn đó:
mở 16rem, thu 4rem, thu tại chỗ không phủ lên, cờ thu gọn nhớ trong `localStorage`, các mục chia
cụm ngăn bằng đường kẻ ngang, badge cuối hàng hai tông. Vì sidebar đã chiếm mép trái, thân giữ một
cột: sidebar cộng rail là ba cột, ở 1280px cột giữa hết đọc được.

Khuyến nghị: `direction-a`. Nó là hướng duy nhất khớp với câu mà chính app đang tự nói về mình
("Bảng điều khiển cấp phát và vận hành"), và nó không cần thêm gì ở backend. Điểm yếu ngày đầu của
nó có thể vá bằng đúng trạng thái rỗng đã dựng trong lab, trong khi điểm yếu của `direction-b` —
mục dẫn rỗng vào mọi ngày lành mạnh — nằm ở chính luận điểm.

`direction-d` không cạnh tranh luận điểm với A: nó **là** A với chrome khác. Chọn giữa hai cái là
chọn giữa thanh trên và sidebar trái, và cái giá của sidebar là phần dưới `lg`: tham chiếu ẩn
sidebar rồi thay bằng drawer cộng thanh tab đáy, mà nivo chưa có cái nào.

## Trạng thái đã dựng và phần để lại cho Preview

Lab dựng ba trạng thái cho mỗi hướng: bảng điều khiển có dữ liệu, bảng điều khiển tài khoản mới, và
màn đăng nhập (giống hệt nhau ở cả bốn hướng, vì câu hỏi hướng đi nằm ở bảng điều khiển).
`direction-d` có thêm trạng thái thứ tư — sidebar thu gọn 4rem — vì chính khả năng thu gọn là thứ
định nghĩa tham chiếu đó.

Preview còn nợ: loading và partial của bảng điều khiển, block thất bại, chrome hẹp và chrome tối,
và sáu trạng thái còn lại của đăng nhập (`resetLinkSent`, `handingOff`, `exchanging`,
`exchangeFailed`, từ chối đăng nhập, đang gửi) cộng quyết định về yếu tố thứ hai.

## Chưa biết

Bảng màu của nivo. Từ vựng `status` của `MyInstance` (đang là `String` tự do). Không có subscription
nên "bước 3/5" trong `direction-c` là fixture không có field đỡ. `creditBurnUsd` là USD trong khi ví
và hoá đơn là VND. `apps/app` chưa có GraphQL client và chưa có catalogue i18n.

## Hướng đã chọn

`direction-d`. Bằng chứng chọn: thầy hỏi "bảng điều kiển kiểu dashboard có cái sidebar bên trái như
starci được không?", làm rõ "cái trong course learn ấy", rồi chốt "ok chốt d". Khuyến nghị của em là
`direction-a`; thầy chọn `direction-d`, vốn mang cùng luận điểm nhưng đổi chrome.

Preview nhận: luận điểm đội hệ thống dẫn trang, chrome là `CollapsibleSidebar` chuyển thể từ
`/courses/[courseId]/learn`, thân một cột, và toàn bộ nghĩa vụ trạng thái còn nợ ở mục trên.
