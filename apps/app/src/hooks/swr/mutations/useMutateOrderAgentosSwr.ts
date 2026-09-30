import { orderAgentOs } from "@/modules/api/commerce"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_AGENTOS_CATALOG_ORDER_SWR_KEY, QUERY_AGENT_WORKSPACES_SWR_KEY, QUERY_CATALOG_ORDERS_SWR_KEY, QUERY_INVOICES_SWR_KEY } from "../swr.shared"
import { accepted } from "./mutations.shared"

/** Create the AgentOS catalog order and refresh every owner-scoped settlement projection. */
export const useMutateOrderAgentosSwr = () =>
    useNivoMutation(
        MUTATION_AGENTOS_CATALOG_ORDER_SWR_KEY,
        ({ catalogItemSlug, catalogTierId }: OrderAgentosCommand) => orderAgentOs(catalogItemSlug, catalogTierId),
        {
            invalidates: [QUERY_CATALOG_ORDERS_SWR_KEY, QUERY_INVOICES_SWR_KEY, QUERY_AGENT_WORKSPACES_SWR_KEY],
            shouldInvalidate: accepted,
        },
    )

type OrderAgentosCommand = {
    readonly catalogItemSlug: string
    readonly catalogTierId?: string
}
