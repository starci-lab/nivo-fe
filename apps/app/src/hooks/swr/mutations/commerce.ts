"use client"

import { createWalletTopUpPayLink, payInvoice } from "@/modules/api/commerce"
import { useNivoMutation } from "../useNivoMutation"
import {
    MUTATION_INVOICE_PAY_SWR_KEY,
    MUTATION_WALLET_TOP_UP_PAY_LINK_SWR_KEY,
    QUERY_AGENT_WORKSPACES_SWR_KEY,
    QUERY_CATALOG_ORDERS_SWR_KEY,
    QUERY_INVOICES_SWR_KEY,
    QUERY_WALLET_SWR_KEY,
    QUERY_WALLET_TRANSACTIONS_SWR_KEY,
} from "../swr.shared"
type WalletTopUpInput = {
    readonly amountVnd: number
    readonly returnUrl: string
    readonly cancelUrl: string
}

/** Create a wallet checkout without leaking payment transport into the Wallet component. */
export const useMutateCreateWalletTopUpPayLinkSwr = () =>
    useNivoMutation(MUTATION_WALLET_TOP_UP_PAY_LINK_SWR_KEY, (input: WalletTopUpInput) =>
        createWalletTopUpPayLink(input.amountVnd, input.returnUrl, input.cancelUrl),
    )

/** Pay one invoice and refresh every account projection affected by settlement. */
export const useMutatePayInvoiceSwr = () =>
    useNivoMutation(MUTATION_INVOICE_PAY_SWR_KEY, payInvoice, {
        invalidates: [QUERY_WALLET_SWR_KEY, QUERY_WALLET_TRANSACTIONS_SWR_KEY, QUERY_INVOICES_SWR_KEY, QUERY_CATALOG_ORDERS_SWR_KEY, QUERY_AGENT_WORKSPACES_SWR_KEY],
        shouldInvalidate: (answer) => answer.ok,
    })
