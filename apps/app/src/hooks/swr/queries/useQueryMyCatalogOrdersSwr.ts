import { myCatalogOrders } from "@/modules/api/commerce"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_CATALOG_ORDERS_SWR_KEY } from "../swr.shared"

/** Read the signed-in viewer's catalog orders when the consumer needs fulfillment data. */
export const useQueryMyCatalogOrdersSwr = (enabled = true) =>
    useNivoQuery(enabled ? QUERY_CATALOG_ORDERS_SWR_KEY : null, myCatalogOrders)
