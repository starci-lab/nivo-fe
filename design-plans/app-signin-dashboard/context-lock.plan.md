# Context lock — plan (ghi bù)

Status: `backfilled`. Lượt Plan đã chạy trước khi `starci-fe-design-plan` mang yêu cầu Context Lock;
bản `SKILL.md` nạp lúc đó không có bước này. Các giá trị dưới đây được dò lại chỉ-đọc sau khi việc
đã xong, nên chúng là bản ghi bù chứ không phải một khoá đã in trước khi chạy. Phần thực chất của
CONTEXT-LOCK-5 thì lượt Plan có giữ: nó chỉ ghi bên trong artifact root.

| Trường | Giá trị | Bằng chứng |
|---|---|---|
| Phase | `plan` | `starci-fe-design-plan` |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` | `CLAUDE.md` |
| Skill | `starci-fe-design-plan` · `.claude\skills\starci-fe-design-plan\SKILL.md` | skill discovery |
| Primary target | `nivo-fe` · `D:\Repositories\nivo-fe` | yêu cầu người dùng + git |
| Git identity | `main` · HEAD `5a78e89` lúc Plan, `415300f` lúc dò lại · không remote | git |
| Reference | `D:\Repositories\starci-academy` (`mtp`, `9a1934231`) — `CollapsibleSidebar`, `SidebarNavItem`, `LearnSidebar` | tham chiếu parity được đặt tên |
| Reference | `D:\Repositories\starci-academy-fe` — `src/app/globals.css` 301 dòng, để so tầng token | chứng cứ |
| Reference | `D:\Repositories\nivo-backend` — schema GraphQL qua introspection ở `127.0.0.1:3067` | chứng cứ nghiệp vụ |
| Artifact root | `D:\Repositories\nivo-fe\design-plans\app-signin-dashboard` | quy ước phase |
| Write boundary | đúng artifact root trên | CONTEXT-LOCK-5 |
| Read-only boundary | `apps`, `packages` của nivo-fe; cả ba repo tham chiếu; cây trust | vai trò chứng cứ |
| Runtime | lab `8082` PID 49408 (8080, 8081 đã bị hai lab StarCi cũ giữ) | netstat |
| Context record | `context-lock.plan.json` · kế thừa: không có | quy ước artifact |
