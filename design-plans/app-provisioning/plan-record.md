# Plan record — trang cấp phát (`case-prov`)

Status `direction-selected` · mode `creative` · deliveryMode `single` ·
renderStatus `directional-not-apply-baseline` · lock
[`context-lock.plan.json`](context-lock.plan.json)

**Hướng được chọn: `dir-c-fleet` — Một hạm đội, lọc theo loại.** Người dùng trả lời đúng một chữ:
`C`. `selectionKind: explicit`.

## Phạm vi

Một work item: `page-provisioning`, scope `page`, target `nivo-fe/apps/app`. Một trang giữ cả hai
loại tài nguyên, do người dùng chốt.

Authentication và dashboard của control plane **không** nằm trong case này. Chúng đã thuộc `case-d1`
(`design-plans/app-signin-dashboard`) với Apply lock `confirmed`; phần còn lại ở đó là sửa chữa đã
biết đích, thuộc `starci-fe-fidelity-fix`. "Dashboard expert" chưa xếp được chỗ và cố ý để ngoài.

## Vì sao ba hướng khác nhau thật

`ExpertProvisionStatus.AwaitingDns` mang chú thích của chính nó: *"Not an error and not retryable by
us"* — khách phải tự thêm bản ghi DNS. Nó **trông như lỗi mà không phải lỗi**. Xếp vào nhóm sự cố thì
mời người ta bấm "thử lại" cho thứ không thử lại được; xếp vào nhóm khoẻ mạnh thì giấu mất thứ duy
nhất đang chặn site lên sóng. Ba hướng là ba chỗ đứng cho nó.

C trả lời: trạng thái là một **cột** trong hạm đội, và dải đếm phía trên là chỗ nó được nhìn thấy
mà không phải xáo trộn thứ tự danh sách.

## Cây owner của hướng đã chọn

```
PageProvisioning
├── FleetStatusStrip        (block MỚI, chiếu StatRow qua stacked-stat-rows)
├── FleetKindFilter         (underlined-tab-strip -> leaf extended-tabs)
└── FleetList               (SurfaceListCard qua label-row-over-card)
    └── FleetRow            (block MỚI)
```

## Một `unknown` đã đóng trong lúc chốt, và nó không ngả về phía tiện

Lab ghi ngờ vực `DualTabsToolbar` có dùng lại được cho bộ lọc không. Đọc nguồn: nó **bắt buộc cả
`leading` lẫn `trailing`** `ChoiceTabsData` — một toolbar hai trục đóng. C chỉ có một trục. Nhét một
trục giả vào để "dùng lại được" chính là cái canon cấm: đổi tên một dữ kiện nghiệp vụ thành prop
trông chung chung nhưng sai.

Owner đúng là contract `underlined-tab-strip`, mở đúng một khe `tabs` cho leaf `extended-tabs`.
Bản ghi mang owner đó, không mang `DualTabsToolbar`.

## Owner mới phải khai (packages/ui hiện **chưa có block nào**)

| owner | path | vì sao không tái sử dụng được |
|---|---|---|
| `FleetRow` | `packages/ui/src/blocks/FleetRow` | `glyph-title-fact-row` không có khe cho loại tài nguyên |
| `FleetStatusStrip` | `packages/ui/src/blocks/FleetStatusStrip` | đếm theo trạng thái cấp phát là nghĩa nghiệp vụ, composite thuần không được sở hữu |
| `PageProvisioning` | `apps/app/src/app/cap-phat/page.tsx` | `apps/app` chưa có route cấp phát |

## Enabler backend, có ranh giới

`counts-by-status` — additive-read, cùng phạm vi viewer với hai query danh sách. Không có nó thì dải
đếm phải tính ở client và **sai ngay khi danh sách phân trang**. Đó là điều kiện leo thang, không
phải điều mong muốn.

## Đánh đổi đã nhận khi chọn C

Chuẩn hoá hai loại về một hàng chung **xoá mất khác biệt thật**: `suspend`/`resume` chỉ có ở
workspace, `awaiting_dns` chỉ có ở site. Một hàng chung dễ hứa những hành động không tồn tại cho loại
đó. Preview phải chứng minh hành động theo hàng được suy ra từ trạng thái **và** loại, không phải chỉ
từ trạng thái.

## Trạng thái còn nợ Preview

`loading` và `error` của trang ghi `deferred-to-preview` — hình dạng skeleton không phải quyết định
sản phẩm, và `error` (query hỏng) phải phân biệt với một tài nguyên đang ở trạng thái `failed`.

## Handoff

Preview **dựng lại** C thành candidate chạy được từ owner, contract, token và fixture thật của
StarCi. Không được bê HTML của lab này sang rồi đánh bóng — làm thế là biến một bản mô phỏng định
hướng thành lời hứa hiện thực mà nó chưa từng chứng minh.
