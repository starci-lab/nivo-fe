import type { WalletTopUpPayLink } from "@/modules/api/commerce"

/** Pending status and latest refusal for the invoice payment action. */
export type InvoicePaymentState = { readonly pending: boolean; readonly error: string | null }
/** Controlled top-up form, checkout and modal state. */
export type TopUpInteractionState = {
    readonly open: boolean
    readonly amount: string
    readonly pending: boolean
    readonly error: string | undefined
    readonly checkout: WalletTopUpPayLink | undefined
}

/** Initialize the payment modal from the route currently mounted. */
export const initialTopUpInteractionState = (pathname: string): TopUpInteractionState => ({
    open: pathname.endsWith("/wallet/top-up"),
    amount: "",
    pending: false,
    error: undefined,
    checkout: undefined,
})
