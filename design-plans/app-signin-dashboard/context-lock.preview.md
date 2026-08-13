# Context lock — preview

Status: `relocked`. Kế thừa `context-lock.plan.json`.

| Trường | Giá trị | Bằng chứng |
|---|---|---|
| Phase | `preview` | `starci-fe-design-preview` |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` | `CLAUDE.md` |
| Skill | `starci-fe-design-preview` · `.claude\skills\starci-fe-design-preview\SKILL.md` | skill discovery |
| Primary target | `nivo-fe` · `D:\Repositories\nivo-fe` | kế thừa từ Plan |
| Git identity | `main` · HEAD `415300f` · không remote | git |
| Reference | `D:\Repositories\starci-academy` (`mtp`, `9a1934231`) | nguồn parity của sidebar |
| Reference | `D:\Repositories\starci-academy-fe`, `D:\Repositories\nivo-backend` | tầng token, chứng cứ nghiệp vụ |
| Artifact root | `D:\Repositories\nivo-fe\design-plans\app-signin-dashboard` | kế thừa |
| Write boundary | `preview-lab\`, `design-record.*`, `context-lock.preview.*` | CONTEXT-LOCK-6 |
| Read-only boundary | `apps`, `packages`, `.artifacts` của nivo-fe; ba repo tham chiếu; cây trust | vai trò chứng cứ |
| Runtime | lab plan `8082` giữ nguyên; lab preview lấy cổng trống đầu tiên từ `8080` | netstat |
| Context record | `context-lock.preview.json` · kế thừa `context-lock.plan.json` | quy ước artifact |

## Drift đã báo trước khi ghi bất cứ artifact nào

1. Không có bản khoá plan để kế thừa — đã ghi bù, đánh dấu `backfilled`.
2. `nivo-fe` nhảy HEAD `5a78e89` → `415300f` ngay trong phiên. Commit
   `docs(academy): persist the approved landing and student-entry records` đặt artifact của StarCi
   Academy vào `nivo-fe/.artifacts/preview-academy/` và
   `nivo-fe/design-plans/academy-landing-student-entry/`. Một phiên khác đang ghi vào repo này.
3. Cổng `3067` và `3014` đã tắt. Chứng cứ schema trong `plan-record.json` được ghi lúc `3067` còn
   sống và không kiểm chứng lại được trong lượt này.
4. `nivo-fe` không có remote.

Thầy chọn relock và chạy tiếp trong phiên này.
