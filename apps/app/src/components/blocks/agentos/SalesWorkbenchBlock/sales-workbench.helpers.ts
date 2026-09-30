import type { SalesCloseRequest } from "@/modules/api/sales"
import {
    salesActionStatusKey,
    salesLifecycleKey,
    salesWording,
    salesWorkReasonKey,
    salesWorkStateKey,
    type SalesTranslation,
} from "@/modules/sales/sales-workbench"

/** Semantic badge tones used for closed Sales states. */
export type SalesWorkbenchBadgeTone = "success" | "warning" | "neutral"

type SalesWorkbenchSubmitEvent = { readonly preventDefault: () => void }

/** Resolve a closed Sales state to its one presentation tone. */
export const salesWorkbenchToneFor = (
    tones: Readonly<Record<string, SalesWorkbenchBadgeTone>>,
    state: string,
): SalesWorkbenchBadgeTone => tones[state] ?? "neutral"

/** Tones for the pipeline's work-state vocabulary. */
export const SALES_WORK_STATE_TONES: Readonly<Record<string, SalesWorkbenchBadgeTone>> = {
    ready: "success",
    waiting: "neutral",
    attention: "warning",
}

/** Tones for accepted and held command states. */
export const SALES_COMMAND_TONES: Readonly<Record<string, SalesWorkbenchBadgeTone>> = {
    accepted: "success",
    "awaiting-clarification": "warning",
    rejected: "warning",
    withdrawn: "neutral",
}

/** Tones for durable action states. */
export const SALES_ACTION_TONES: Readonly<Record<string, SalesWorkbenchBadgeTone>> = {
    delivered: "success",
    stopped: "warning",
    "outcome-unknown": "warning",
}

/** Tones for opportunity lifecycle states. */
export const SALES_LIFECYCLE_TONES: Readonly<Record<string, SalesWorkbenchBadgeTone>> = {
    open: "neutral",
    won: "success",
    lost: "warning",
}

/** The closure outcome choices, in the order shown by the control. */
export const SALES_CLOSE_OUTCOMES: ReadonlyArray<SalesCloseRequest["outcome"]> = ["won", "lost", "attention"]

/** Keep an undeclared closure value at the control's default outcome. */
export const salesCloseOutcomeOf = (value: string): SalesCloseRequest["outcome"] =>
    SALES_CLOSE_OUTCOMES.find((outcome) => outcome === value) ?? "won"

/** Resolve the localized text for one pipeline work state. */
export const salesWorkbenchWorkStateText = (state: string, t: SalesTranslation): string =>
    salesWording(salesWorkStateKey(state), state, t)

/** Resolve a reason or the catalogue's explicit empty label. */
export const salesWorkbenchReasonText = (reason: string | null, t: SalesTranslation): string =>
    reason === null || reason.length === 0 ? t("none") : salesWording(salesWorkReasonKey(reason), reason, t)

/** Resolve the localized text for one opportunity lifecycle state. */
export const salesWorkbenchLifecycleText = (status: string, t: SalesTranslation): string =>
    salesWording(salesLifecycleKey(status), status, t)

/** Resolve the localized text for one durable action state. */
export const salesWorkbenchActionText = (status: string, t: SalesTranslation): string =>
    salesWording(salesActionStatusKey(status), status, t)

/** Prevent browser form submission and invoke the workbench's settled command action. */
export const salesWorkbenchSubmitOn = (handler: () => void) => (event: SalesWorkbenchSubmitEvent) => {
    event.preventDefault()
    handler()
}
