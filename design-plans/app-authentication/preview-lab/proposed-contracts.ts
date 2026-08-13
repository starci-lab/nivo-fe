/**
 * The exact registry and leaf deltas this candidate needs, written out rather than applied.
 *
 * The registry lives in `packages/ui/`, which is outside Preview's write boundary, so the candidate
 * renders under the CURRENT entries and this file states what Apply would change. Nothing here is
 * approved until the design record is.
 *
 * TWO THINGS THE PLAN PROPOSED ARE NOT HERE, and their absence is the finding rather than an
 * omission. `otp-digit-row` and `stepped-panel-header` were both withdrawn after reading the named
 * reference's source. See the design record's consolidation verdicts.
 */

/**
 * PROPOSAL 1 - `centred-authentication-page` gains `host: "main"`.
 *
 * EXTEND, not NEW. The entry already IS the page-level surface of an authentication route; what it
 * lacks is a tag saying so. Rendered as a `div`, these routes give a screen reader nothing to skip
 * to, and the shipped `/sign-in` has the same gap today.
 *
 * `centred-viewport-main` next door in the same table already carries `host: "main"` for exactly
 * this reason, with an identical class list - which is also why a second key must NOT be minted
 * here: two entries with the same classes and the same child identity are one concept under two
 * names, and `starci-fe/no-duplicate-entry-shape` refuses it.
 *
 * BLAST RADIUS, stated because it touches an approved render. The shipped `SignInPage` uses this
 * entry, so its outer element becomes `<main>`. No class changes, so no pixel changes. That is why
 * this is open question 3 rather than a silent improvement: direction-b was chosen partly to leave
 * the sign-in screen alone, and this touches it - beneficially, but it touches it.
 */
export const CENTRED_AUTHENTICATION_PAGE_DELTA = {
    key: "centred-authentication-page",
    add: { host: "main" },
    classesUnchanged: ["flex", "min-h-screen", "w-full", "items-center", "justify-center", "p-6"],
    childrenUnchanged: { surface: { contract: "authentication-panel-card" } },
    callers: [
        "apps/app/src/components/pages/SignInPage/index.tsx (shipped)",
        "apps/app/src/components/pages/SignUpPage/index.tsx (new)",
        "apps/app/src/components/pages/ForgotPasswordPage/index.tsx (new)",
    ],
} as const

/**
 * PROPOSAL 2 - `TextLink` gains `disabled`.
 *
 * EXTEND, and it clears the bar the rule sets: the leaf already owns the semantic relationship
 * (words that press) and the visual slot; `disabled` is a condition of that control, not a new
 * concept smuggled in as a prop.
 *
 * WHY IT IS NEEDED. `OtpStep`'s resend must refuse for sixty real seconds, because the backend
 * answers `OTP_RESEND_TOO_SOON_EXCEPTION` to anything sooner. `spread-choice-row.choice` admits only
 * `checkbox` or `text-link`, so a `Text` cannot stand there, and a link that stays pressable sends a
 * request that is already known to fail.
 *
 * WHAT THE CANDIDATE DOES INSTEAD, since editing a shipped leaf would mean rendering under a
 * component nobody approved: it keeps one `TextLink` and swaps the LABEL to carry the countdown
 * while withholding `press`. The behaviour is right and the affordance is not - the words still look
 * pressable. That is the cost, and it is open question 4.
 *
 * ABSENCE AND DEFAULT: `disabled` absent behaves exactly as today. No caller changes.
 */
export const TEXT_LINK_DELTA = {
    owner: "packages/ui/src/leaves/TextLink/index.tsx",
    add: { props: { disabled: "boolean | undefined" } },
    default: "undefined, which renders and behaves exactly as today",
    precedence: "when true, `press` is not called and the element is not focusable",
    callers: ["every existing TextLink is unaffected; only OtpStep passes it"],
    tests: ["a disabled link does not call press", "a disabled link is skipped by tab order"],
} as const
