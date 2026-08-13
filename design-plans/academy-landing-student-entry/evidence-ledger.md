# Evidence ledger — academy landing and academy entry

Case `academy-landing-student-entry`, Plan re-run, 2026-08-13. Every row is evidence read at the
locked HEAD or from a live API, not recalled. Where the version-1 record disagrees, the row says so.

## Capability matrix — which backend owns what

Two backends exist and the version-1 record conflated them. This is the correction that reshapes the
entry page.

| Capability | control plane `:3067` (`apps/app`) | academy `:3069` (`apps/expert`) |
|---|:---:|:---:|
| `signIn` (email + password) | yes | **yes** |
| `signOut` | yes | **yes** |
| `exchangeOauthCode` (PKCE) | yes | **yes** |
| `refreshSession` | yes | **yes** |
| `signUp` | yes | **no** |
| `requestPasswordReset` / `resetPassword` | yes | **no** |
| two-factor (setup / confirm / verify / disable) | yes | **no** |

Evidence: live introspection of both schemas, plus source —
`src/features/expert/graphql/mutations/auth/` holds exactly four resolvers, while
`src/features/core/api/core/graphql/mutations/auth/` holds eleven. `SignUpInput` exists only under
`src/features/core/`.

**What this invalidates.** The version-1 record lists `sign-up-idle` (citing "SignUpInput exists"),
`reset-link-sent` and `two-factor-unsupported` as REQUIRED states for the academy entry page. None of
the three can be built against the academy API. They are reclassified `not-applicable` with this
evidence rather than dropped in silence — a state that quietly disappears is indistinguishable from
one nobody thought of.

## How an academy account comes into existence

There is no `signUp`, and that is not a gap — both entry lanes create the member themselves.

| Fact | Evidence |
|---|---|
| OAuth is *the* login | `auth.e2e-spec.ts:231` — `describe("exchangeOauthCode (the login)")` |
| A brand-new OAuth identity creates a fresh member, `role=member`, `status=active`, and sets the refresh cookie | `auth.e2e-spec.ts:233` |
| A brand-new PASSWORD identity also creates a fresh member | `auth.e2e-spec.ts:293` |
| An email matching a seeded admin row with no `keycloakUserId` migration-links onto that row | `auth.e2e-spec.ts:264`, business.md branch 2 |
| Both lanes return the identical `AuthPayload` | `sign-in.service.ts` — "the exact same `AuthPayload` shape `exchangeOauthCode` returns, so the FE handles both identically" |
| Refusal writes nothing: no cookie, no member | `auth.e2e-spec.ts:324` — "rejects invalid credentials without setting a cookie or upserting a member" |

## The password lane was designed for a modal

Two independent sources, neither of them a preference:

- `sign-in.service.ts` — "a direct (resource-owner password) Keycloak grant **so the FE can log a
  member in from a modal, with no browser redirect** through Keycloak's hosted login page".
- `auth.e2e-spec.ts:291` — `describe("signIn (modal login, direct grant)")`.

The version-1 record assumed a full route, `apps/expert/src/app/dang-nhap/page.tsx`. The backend was
built so that route is not required. **Page versus modal is therefore a real, evidence-backed product
choice**, and it is the axis the directions turn on rather than a styling question.

It is a choice and not a settled fact because the record's own state inventory names states a modal
serves badly — `already-authenticated` wants somewhere to redirect to, and `oauth-leaving` means the
browser leaves the page entirely and must come back to something.

## The landing, as it actually stands

`page-academy-landing` and `layout-academy-chrome` are live in production, built today outside this
pipeline. Plan reads them as the incumbent, never as an approved baseline.

| Fact | Evidence |
|---|---|
| The catalog is real, server-rendered | `courses` query (public) → 3 seeded courses in the first HTML response |
| The lead form writes | `submitLead` (public) → row in `leads` |
| Section order is data | `ACADEMY.layout.sections`, position IS render order; `visible:false` emits no markup |
| Content is bilingual, authored | `Localized<T>`; product copy from `messages/*.json`, academy words from the template |
| Theme overrides the vendor | template writes HeroUI's own variables as a `:root` / `.dark` block |
| Routing is `/` and `/vi` | `as-needed`; `/en` → 307 `/`, `/fr` → 404 |
| Courses carry no detail route | pressing a course leads nowhere today |

Parity baseline still on disk: `nivo/apps/expert/src/components/blocks/landing/LandingPage.tsx`
(10,000 bytes), landing only — the entry page has no legacy render.

## Unknowns carried into the directions

| Unknown | Why it is not settled here |
|---|---|
| Where a signed-in student lands | No academy dashboard route exists. `already-authenticated` can prove a redirect happens but not where it goes. |
| Whether entry needs its own route at all | The backend supports both; the states pull in opposite directions. This is the choice to make, not to guess. |
| Whether a course opens anything | No course-detail route exists in `apps/expert`. Out of this case's boundary, recorded so the landing is not designed as if one existed. |
