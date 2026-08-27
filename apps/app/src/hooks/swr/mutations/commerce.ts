"use client"

import { createWalletTopUpPayLink, payInvoice } from "@/modules/api/console"
import { useNivoMutation } from "../use-nivo-mutation"

type WalletTopUpInput = {
    readonly amountVnd: number
    readonly returnUrl: string
    readonly cancelUrl: string
}

/** Create a wallet checkout without leaking payment transport into the Wallet component. */
export const useMutateCreateWalletTopUpPayLinkSwr = () => useNivoMutation(
    ["wallet-top-up-pay-link"],
    (input: WalletTopUpInput) => createWalletTopUpPayLink(input.amountVnd, input.returnUrl, input.cancelUrl),
)

/** Pay one invoice and refresh every account projection affected by settlement. */
export const useMutatePayInvoiceSwr = () => useNivoMutation(
    ["invoice-pay"],
    payInvoice,
    {
        invalidates: [["wallet"], ["wallet-transactions"], ["invoices"], ["catalog-orders"], ["agent-workspaces"]],
        shouldInvalidate: (answer) => answer.ok,
    },
)
