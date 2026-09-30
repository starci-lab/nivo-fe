import { payInvoice } from "@/modules/api/commerce"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_INVOICE_PAY_SWR_KEY, QUERY_AGENT_WORKSPACES_SWR_KEY, QUERY_CATALOG_ORDERS_SWR_KEY, QUERY_INVOICES_SWR_KEY, QUERY_WALLET_SWR_KEY, QUERY_WALLET_TRANSACTIONS_SWR_KEY } from "../swr.shared"

/** Pay one invoice and refresh every account projection affected by settlement. */
export const useMutatePayInvoiceSwr = () =>
    useNivoMutation(MUTATION_INVOICE_PAY_SWR_KEY, payInvoice, {
        invalidates: [QUERY_WALLET_SWR_KEY, QUERY_WALLET_TRANSACTIONS_SWR_KEY, QUERY_INVOICES_SWR_KEY, QUERY_CATALOG_ORDERS_SWR_KEY, QUERY_AGENT_WORKSPACES_SWR_KEY],
        shouldInvalidate: (answer) => answer.ok,
    })
