# Context lock — apply · nivo academy public landing and student entry

`status: awaiting-confirmation`. No further production edit, dependency change, commit, agent
dispatch or service mutation happens until the user confirms every value below and this status
becomes `confirmed`.

Detected 2026-08-12, read-only, from the workspace, the user's request and git.

## Lock

| Field | Locked value | Evidence |
|---|---|---|
| Phase | `apply` | Invoked skill `starci-fe-design-apply` |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` | Root `CLAUDE.md` router |
| Skill | `starci-fe-design-apply` · `D:\Repositories\starci-academy-backend\.claude\skills\starci-fe-design-apply\SKILL.md` | Skill discovery |
| Primary target | `D:\Repositories\nivo-fe` — the app under change, git root `D:\Repositories\nivo-fe` | Design record target line + user's "chuẩn cho nivo đấy" + git |
| Reference | `D:\Repositories\nivo` (read-only) — parity baseline `apps/expert/src/components/blocks/landing/LandingPage.tsx` | Plan record `parityBaseline` |
| Reference | `D:\Repositories\starci-academy-fe` (read-only) — the convention the code must follow, and the next-intl wiring being copied | Design record decision D-4 + user's "chạy lại code theo chuẩn starci-academy-fe" |
| Git identity — target | branch `main`, worktree `D:\Repositories\nivo-fe`, HEAD `415300f`, **no remote configured** | `git branch --show-current`, `git rev-parse`, `git remote -v` |
| Git identity — nivo | branch `main`, worktree `D:\Repositories\nivo`, HEAD `cc9a41f`, remote `origin https://github.com/starci-lab/nivo.git` | git |
| Git identity — starci-academy-fe | branch `main`, worktree `D:\Repositories\starci-academy-fe`, HEAD `8af51ee`, remote `origin https://github.com/starci-lab/starci-academy-fe.git` | git |
| Artifact root | `D:\Repositories\nivo-fe\.artifacts\preview-academy` | Preview record location |
| Write boundary | `apps/expert/package.json`, `apps/expert/next.config.ts`, `apps/expert/src/i18n/`, `apps/expert/src/messages/`, `apps/expert/src/app/layout.tsx`, `apps/expert/src/app/page.tsx`, `apps/expert/src/app/(auth)/sign-in/`, `apps/expert/src/academy/` — all under `D:\Repositories\nivo-fe` | Design record `fileBoundary` per work item |
| Read-only boundary | `D:\Repositories\nivo`, `D:\Repositories\starci-academy-fe`, `D:\Repositories\starci-academy-backend` (including the trust tree), and `packages/ui` inside the target | Evidence roles; no approved change to the shared kit |
| Runtime | Review lab `http://127.0.0.1:8080` from the artifact root, PID `52228`, started by this session; expert dev server (port 3013) not running | `netstat`, `Get-NetTCPConnection`, this session's start command |
| Context record | This file and `context-lock.apply.json` in the artifact root; **no inherited `context-lock.preview.*` exists** | Directory listing of the artifact root |

## Drift and open items — every one needs the user's ruling

| # | Item | Detected state | Why it stops the phase |
|---|---|---|---|
| D-1 | Inherited preview lock | Missing. The approved design record was written before the Context Lock rule existed, so there is no `context-lock.preview.md/json` to verify against. | Apply is required to inherit and verify a preview record rather than reconstruct one. The lock above is a fresh detection, not an inheritance. |
| D-2 | Production edits already made this session | Before the skill was re-invoked with the Context Lock requirement, this session edited `apps/expert/package.json` (added `next-intl`), `apps/expert/next.config.ts` (intl plugin), `apps/expert/src/app/layout.tsx` (provider, metadata from the template), created `apps/expert/src/i18n/config.ts`, `apps/expert/src/i18n/request.ts`, `apps/expert/src/messages/en.json`, `apps/expert/src/messages/vi.json`, and partially converted `apps/expert/src/academy/sections.tsx` to catalogue copy. | Those writes happened without the confirmation this rule now requires. They are inside the approved write boundary, but the user has not confirmed the boundary. |
| D-3 | `sections.tsx` is mid-conversion | `Hero` and `Problems` read from the catalogue; `Outcomes`, `Roadmap`, `Testimonials`, `Gallery`, `Courses`, `Community`, `Offer`, `Faq` and `Lead` still hold hardcoded Vietnamese. The file parses. It is untracked in git, so there is no baseline to revert to. | The target is neither the approved state nor its previous state. |
| D-4 | Auth route segment (U-G) | Resolved this turn by the user: `/sign-in` under the `(auth)` group. The plan record still names `apps/expert/src/app/dang-nhap/page.tsx`. | Recorded so the plan/preview and the built route do not silently disagree. |
| D-5 | Approved contract `ordered-toggleable-section-stack` | The registry in `packages/ui/src/contracts/index.ts` requires every entry to fix its children by naming another contract or leaf, and closes the layout classes to a typed union. The academy bands are app-level markup with no registry node, so the entry cannot be added as approved without also approving a band contract. | Adding it anyway would invent an unapproved contract; skipping it silently would drop an approved item. |
| D-6 | Plan record status disagreement | `plan-record.json` says `direction-selected`; the prose `plan-record.md` still says `awaiting-direction-selection`. | Documentation drift only — the design record and the user's approval govern — but it is recorded rather than tidied. |
| D-7 | Target repository has no remote | `git remote -v` is empty for `D:\Repositories\nivo-fe`, while `D:\Repositories\nivo` has `origin`. | Remote identity cannot be verified for the target, and the two repositories both contain `apps/expert`. |
| D-8 | Lead and credential submission have no wired endpoint | `apps/expert` has no lead mutation and no auth call. The approved states `lead pending`, `lead error`, `submitting with providers disabled` and `refused` therefore have no production path to enter. | Building one would invent backend behavior the record does not approve; the four states would otherwise be unverifiable in the browser. |

## Awaiting explicit confirmation

- target repository: `D:\Repositories\nivo-fe`
- branch and worktree: `main` / `D:\Repositories\nivo-fe`, HEAD `415300f`, no remote
- write boundary: the `apps/expert` paths listed above, and nothing in `packages/ui`
- read-only: `D:\Repositories\nivo`, `D:\Repositories\starci-academy-fe`, the trust tree
- disposition of D-1, D-2, D-3, D-5 and D-8
