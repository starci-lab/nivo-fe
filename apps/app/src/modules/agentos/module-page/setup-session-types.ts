/** One setup action owned by the selected runtime revision. */
export type SetupAction =
    | { readonly kind: "send" | "apply" | "confirm"; readonly sessionId: string }
    | { readonly kind: "start" }

/** Inline feedback retained for the currently selected setup revision. */
export type SetupFeedback = { readonly refused?: "send" | "apply"; readonly unconfirmed?: boolean }
