# Design record — nivo academy: public landing + student entry

> Approved by the user on 2026-08-12 ("ok" in reply to the preview lab, followed by a request to run
> apply). Input to `$starci-fe-design-apply`.

| | |
|---|---|
| Approved case | **`case-la`** — the ladder, in catalog order |
| Delivery | batch · 3 owners |
| Preview lab | `http://127.0.0.1:8080/` · `nivo-fe/.artifacts/preview-academy/` |
| Plan record | `nivo-fe/design-plans/academy-landing-student-entry/plan-record.json` (`direction-selected`, L-A) |
| Target repository | `D:\Repositories\nivo-fe` — app `apps/expert` |

Both records were written to a session scratchpad on 2026-08-12 and moved here unchanged the same
day, because a scratchpad is session-scoped and this record must outlive the session that approved
it. The lab bytes, the approved case and the state matrix are the originals; only the two paths
above and this note were added.

## Owners

| id | Target | Scope |
|---|---|---|
| `layout-academy-chrome` | `apps/expert/src/academy/AcademyChrome.tsx` | layout · **new owner** |
| `page-academy-landing` | `apps/expert/src/app/page.tsx` | page |
| `page-academy-auth` | `apps/expert/src/app/(auth)/…` | page |

Two new owners, no new leaf or composite: `Input`, `Field`, `Button`, `Divider`, `Heading`, `Text`
and `TextLink` already carry every state needed.

## COPY IS ENGLISH AND TRANSLATABLE — added after approval

The user's instruction on 2026-08-12: **no Vietnamese in source; English throughout, multilingual the
way starci is.**

This is not a find-and-replace. It exposes a real gap in the scaffold: **no app in `nivo-fe` has
`next-intl`**, because it was deliberately omitted to keep the initial monorepo small. Apply must
therefore:

1. add `next-intl` to `apps/expert` and wire its provider, the same way `starci-academy-fe` does;
2. move every visible string into message catalogues rather than into constants beside the markup;
3. keep the mounted template's own content — the academy's name, tagline, section text — OUT of the
   catalogues. That text belongs to one academy and is data, not product copy. Only the strings the
   product owns are translated: field labels, button text, refusals, empty states, notices.

That division matters and is easy to get backwards. "Courses" is product copy and translates. "Học
viện Minh Tuệ" is one academy's name and must never enter a catalogue.

## Deleted, deliberately

`apps/expert/src/app/page.tsx` and `.../dang-nhap/page.tsx` were written before the state inventory
existed and carried hardcoded Vietnamese. Both are removed at the user's instruction. **The expert app
currently has no root route**, so apply rebuilds it rather than editing it.

`apps/expert/src/academy/` remains and still contains hardcoded Vietnamese in `sections.tsx` and in
the default `ACADEMY` of `template.ts`. It is retained because its structure survived the review, but
its strings fall under the same instruction and apply must convert them.

## Approved state coverage — 35 owner states, 29 integrated scenarios

**`AcademyChrome`** — provisioned palette · default palette · **second palette** · custom CSS present
· custom CSS absent · mobile · desktop. N/A: dark theme, layout loading.

**`AcademyLanding`** — full ladder · unprovisioned default · sections off · sections reordered · empty
courses · six custom shapes · image missing · image broken · second palette · mobile · desktop · lead
pending · lead error · keyboard focus. N/A: loading, error, dark theme.

**`AcademyAuth`** — sign-up idle · sign-in idle · submitting with providers disabled · refused · reset
link sent · two-factor unsupported · oauth leaving · oauth failed · brand themed · already
authenticated · mobile · desktop · keyboard focus. N/A: dark theme.

**Every N/A carries evidence.** The two worth restating: the landing owns no loading or error state
because the template is mounted at build time and there is no request to await; dark theme is N/A
because the palette belongs to the ACADEMY, not the viewer, and no viewer-level toggle exists.

## Backend-fixed wording apply may not soften

| State | Rule | Source |
|---|---|---|
| refused, reset sent | Never reveal whether an email has an account | e2e `password-reset` |
| two-factor | The account neither failed nor succeeded; say so plainly | e2e `sign-up-and-sign-in` |
| oauth failed | Nothing was written; imply no half-created account | e2e `sign-up-and-sign-in` |
| already authenticated | Redirect to the academy dashboard | user decision, U-F |

## Contracts and proposals

`ordered-toggleable-section-stack` — the sections are peers in one column rather than nested, so
switching one off removes a row instead of leaving a hole, and moving one changes only its position.
Not yet in the registry; apply adds the entry with its `why` before use.

`AcademyChrome` (layout, new) — the only reader of the mounted template and the only writer of the
palette. A hook every block could call would spread one decision everywhere and leave nowhere to
prove theming works.

`StudentEntryPanel` (block, new) — the control plane's `SignInPanel` is weighted for someone who
already has an account. A student's entry leads with registration, which is a different product
sentence rather than a mode flag.

## Open unknowns, none blocking apply

| id | Unknown |
|---|---|
| U-A | An external image is a request from a student's browser to a stranger's host. `no-referrer` is set; the address is still exposed. |
| U-B | `stats`, testimonials and credentials are unverifiable claims served from nivo's infrastructure. Same family as BR-B07, different mechanism, no rule yet. |
| U-C | Is `instructor` a system section or a custom one? The first case BR-B06's two families do not cut cleanly. |
| U-D | Own domain or nivo subdomain. |
| U-E | `guarantee`, `audience`, `schedule` — three rungs the model predicts and no reference academy has. |

## Rejected directions

**L-B, proof before offer** — leads with the rung both reference academies lean on hardest, but its
three leading sections are all empty on an academy's first day, which is every academy's first day.

**L-C, one question at a time** — shortest path to a lead, but its email-first entry needs the backend
to answer whether an address has an account, and the password-reset e2e proves the product
deliberately refuses to disclose exactly that.
