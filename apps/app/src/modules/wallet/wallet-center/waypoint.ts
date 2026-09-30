import { DEFAULT_LOCALE } from "@/modules/i18n/config"
import type { InvoiceRow } from "@/modules/api/commerce"
import { isTopUpSession } from "./waypoint.guards"
import type { PaymentResultView, WalletLedgerRow } from "./types"

/** Payment evidence retained while the provider round trip is in progress. */
export type TopUpSession = {
    readonly amountVnd: number
    readonly startingBalanceVnd: number
    readonly referenceId: string
}

/** Exact invoice and order continuation encoded in the wallet route. */
export type WalletWaypoint = {
    readonly orderId: string
    readonly invoiceId: string
    readonly returnTo: string
}


/** Tone an invoice row with the status it actually reports. */
export const invoiceTone = (status: InvoiceRow["status"]): WalletLedgerRow["tone"] => {
    if (status === "paid") return "success"
    if (status === "unpaid") return "warning"
    return "neutral"
}

type PaymentResultCopy = Pick<PaymentResultView, "state" | "tone" | "note">

/** Resolve the provider result state without claiming a payment before balance reconciliation. */
export const paymentResultCopy = (
    isCancelled: boolean,
    isConfirmed: boolean,
    copy: Readonly<{
        cancelled: string
        confirmed: string
        pending: string
        cancelledNote: string
        confirmedNote: string
        pendingNote: string
    }>,
): PaymentResultCopy => {
    if (isCancelled)
        return {
            state: copy.cancelled,
            tone: "neutral",
            note: copy.cancelledNote,
        }
    if (isConfirmed)
        return {
            state: copy.confirmed,
            tone: "success",
            note: copy.confirmedNote,
        }
    return {
        state: copy.pending,
        tone: "warning",
        note: copy.pendingNote,
    }
}

/** Read an exact AgentOS Wallet continuation, while leaving an ordinary Wallet route uncorrelated. */
export const readWalletWaypoint = (search: string, locale: string): WalletWaypoint | null | undefined => {
    const params = new URLSearchParams(search)
    const hasWaypointPart = ["orderId", "invoiceId", "returnTo"].some((key) => params.has(key))
    if (!hasWaypointPart) return undefined
    const orderId = params.get("orderId")
    const invoiceId = params.get("invoiceId")
    const returnTo = params.get("returnTo")
    const route = (path: string) => (locale === DEFAULT_LOCALE ? path : `/${locale}${path}`)
    const exactReturn = orderId === null ? "" : route(`/agentos/orders/${orderId}`)
    if (
        orderId === null ||
        orderId.length === 0 ||
        invoiceId === null ||
        invoiceId.length === 0 ||
        returnTo !== exactReturn
    )
        return null
    return {
        orderId,
        invoiceId,
        returnTo,
    }
}

/** Parse one stored provider response while treating absent or malformed evidence as unknown. */
export const parseTopUpSession = (raw: string | null): TopUpSession | null => {
    try {
        if (raw === null) return null
        const stored: unknown = JSON.parse(raw)
        return isTopUpSession(stored) ? stored : null
    } catch {
        return null
    }
}
