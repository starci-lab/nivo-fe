# Context lock — apply

Status: `awaiting-confirmation`. Kế thừa `context-lock.preview.json`. Chưa có dòng mã sản xuất nào
được sửa và sẽ không có, cho tới khi thầy xác nhận tường minh bốn mục ở cuối file này.

| Trường | Giá trị | Bằng chứng |
|---|---|---|
| Phase | `apply` | `starci-fe-design-apply` |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` | `CLAUDE.md` |
| Case đã duyệt | `case-d1` · `design-record.json` | lời duyệt của người dùng |
| Primary target | `nivo-fe` · `D:\Repositories\nivo-fe` | kế thừa |
| Git identity | `main` · HEAD `415300f` · không worktree riêng · không remote | git |
| Cây làm việc | 15 mục đang sửa/chưa theo dõi, **14 mục không thuộc việc này** (`apps/expert`, `packages/ui`) | `git status` |
| Reference | `starci-academy` (`mtp`, `9a1934231`) — hình học sidebar | parity |
| Reference | `nivo-backend` — schema; **đang tắt** | runtime |
| Artifact root | `design-plans\app-signin-dashboard` | kế thừa |
| Runtime | lab 8082 và 8086 còn chạy; 3014 và 3067 đã tắt | netstat |

## Drift so với lượt trước

`3014` và `3067` đều đã tắt. Không kiểm chứng được gì trên trình duyệt và không nối được truy vấn
nào cho tới khi bật lại. Chứng cứ schema trong bản ghi duyệt là bản ghi lại từ lượt Plan.

Cây làm việc `nivo-fe` đang mang 14 thay đổi **không thuộc việc này**, nằm ở `apps/expert` và
`packages/ui` — trong đó `packages/ui/src/contracts/index.ts` vừa là canon dùng chung vừa nằm trong
ranh giới ghi em đề xuất. Apply không được gom chúng vào việc này.

## Ranh giới ghi đề xuất

`apps/app/src/app/globals.css`, `layout.tsx`, `page.tsx`, `(auth)/dang-nhap/`;
`apps/app/src/components/layouts/AppSidebarChrome/`, `components/pages/DashboardPage/`,
`components/blocks/dashboard/{InstanceList,WorkNeedingYou,WalletSummary}/`,
`components/blocks/auth/SignInPanel/`; `apps/app/src/modules/api/`; `apps/app/package.json`;
`packages/ui/src/contracts/index.ts`; và thư mục artifact của việc này.

Chỉ đọc: `apps/expert`, `apps/landing`, `.artifacts`, ba repo tham chiếu, cây trust.

## Bốn mục chờ thầy xác nhận

1. Repo và nhánh: `D:\Repositories\nivo-fe`, nhánh `main`, không tách worktree.
2. Ranh giới ghi ở trên — đặc biệt `packages/ui/src/contracts/index.ts`, vốn là canon dùng chung và
   đang có thay đổi dở dang của việc khác.
3. Apply có được bật lại `3014` và `3067` không.
4. Giá trị token: bản ghi duyệt **không** duyệt màu. Thiếu giá trị nào thì Apply dừng và hỏi, chứ
   không bê bảng màu của StarCi Academy sang.
