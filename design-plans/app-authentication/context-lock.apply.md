# Context Lock — apply · app-authentication

**status** `awaiting-confirmation` — no production byte is written until this is confirmed.

| row | value |
|---|---|
| trust root | `D:/Repositories/starci-academy-backend/.claude` |
| apply target | `nivo-fe` · branch `main` · HEAD `415300f` · one worktree, no detached copies |
| worktree state | dirty with this session's own uncommitted work — the same state Plan and Preview measured |
| parity baseline | `starci-academy-fe` @ `8410a74` |
| business truth | `nivo-backend` @ `e822320` |
| case / direction / revision | `case-auth` / `direction-b` / `1.0` |
| seal | `sha256:028c341b…add43` — re-verified `ok: true` |
| lint adoption | `ok: true` · 0 missing · 0 non-error · `noInlineConfig: true` |
| drift | none |

## Writable boundary

Nothing outside this list is written. `apps/expert`, `apps/landing`, `SignInPanel`, `SignInPage`,
`session.tsx` and `graphql.ts` are read-only for this phase.

**New files**

```
apps/app/src/components/blocks/auth/OtpStep/index.tsx
apps/app/src/components/blocks/auth/SignUpPanel/index.tsx
apps/app/src/components/blocks/auth/ForgotPasswordPanel/index.tsx
apps/app/src/components/pages/SignUpPage/{component,index}.tsx
apps/app/src/components/pages/ForgotPasswordPage/{component,index}.tsx
apps/app/src/app/[locale]/(auth)/sign-up/page.tsx
apps/app/src/app/[locale]/(auth)/forgot-password/page.tsx
```

**Edits to existing files**

| file | change |
|---|---|
| `apps/app/src/modules/api/auth.ts` | **append only** — six OTP operations; nothing existing changes |
| `apps/app/src/messages/vi.json` | merge two namespaces |
| `apps/app/src/messages/en.json` | the English sibling of the same two |
| `packages/ui/src/contracts/index.ts` | two one-line edits — open questions 1 and 2 |
| `packages/ui/src/index.ts` | export the new blocks if the barrel requires it |

## Deferred on purpose

`TextLink.disabled` (open question 4) was **waived at its default**, not approved as a change. It
stays out of this Apply, so the cooling-down resend ships looking pressable exactly as the sealed
screenshot shows it. Adding it here would be Apply answering a question the record deliberately left
alone. It routes to a Preview minor revision if it is wanted.

## Parity gate at handoff

All eleven states, compared at the recorded conditions: 1280×900 @1, locale `vi`, theme `light`,
persona anonymous, fixture `auth.vi.json`.
