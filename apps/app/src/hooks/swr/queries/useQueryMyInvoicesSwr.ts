"use client"
import { myInvoices } from "@/modules/api/commerce"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_INVOICES_SWR_KEY } from "../swr.shared"

/** Read the signed-in viewer's invoices when the consumer needs settlement data. */
export const useQueryMyInvoicesSwr = (enabled = true) => useNivoQuery(enabled ? QUERY_INVOICES_SWR_KEY : null, myInvoices)
