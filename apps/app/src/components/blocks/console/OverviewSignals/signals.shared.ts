import type { Outcome } from "@nivo/api"
import type { NivoQueryFailure } from "@/modules/query"

/** Server statuses whose public overview copy has a dedicated catalogue entry. */
export const OVERVIEW_SIGNAL_STATUS_KEY: Readonly<Record<string, string | undefined>> = {
    not_provisioned: "status.notProvisioned",
    provisioning: "status.provisioning",
    awaiting_dns: "status.awaitingDns",
    ready: "status.ready",
    failed: "status.failed",
    active: "status.active",
    suspended: "status.suspended",
}

/** Status tones used by the compact account signal cards. */
export const OVERVIEW_SIGNAL_STATUS_TONE: Readonly<Record<string, "warning" | "danger" | undefined>> = {
    awaiting_dns: "warning",
    suspended: "warning",
    failed: "danger",
}

const EXPIRY_NOTICE_DAYS = 30
const DAY_IN_MS = 86400000

/** Flag a domain inside the account's renewal notice window. */
export const expiryTone = (expiresAt: string | null, now: number | null): "warning" | undefined => {
    if (expiresAt === null || now === null) return undefined
    const remainingDays = (new Date(expiresAt).getTime() - now) / DAY_IN_MS
    return remainingDays <= EXPIRY_NOTICE_DAYS ? "warning" : undefined
}

/** Flag an overdue invoice. */
export const dueTone = (dueAt: string, now: number | null): "danger" | undefined =>
    now !== null && new Date(dueAt).getTime() < now ? "danger" : undefined

/** Preserve the difference between a read that has not settled and a failed read. */
export type SignalReading<T> =
    | { readonly status: "resting" }
    | { readonly status: "ready"; readonly data: T }
    | { readonly status: "failed"; readonly failure: NivoQueryFailure }

/** Turn a settled overview answer into a ready value or a failure that keeps its cause. */
export const signalReading = <T,>(answer: Outcome<T> | null): SignalReading<T> => {
    if (answer === null) return { status: "resting" }
    switch (answer.ok) {
        case true:
            return { status: "ready", data: answer.data }
        case false:
            return { status: "failed", failure: answer }
    }
}
