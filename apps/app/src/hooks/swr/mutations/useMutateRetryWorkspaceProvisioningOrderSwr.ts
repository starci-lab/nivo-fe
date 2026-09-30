import { retryWorkspaceProvisioningOrder } from "@/modules/api/workspace-controlplane"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_AGENTOS_WORKSPACE_PROVISIONING_RETRY_SWR_KEY, QUERY_AGENT_WORKSPACES_SWR_KEY } from "../swr.shared"
import { accepted } from "./mutations.shared"

/** Re-drive provisioning of one failed workspace; the workspace row is the fenced retry identity. */
export const useMutateRetryWorkspaceProvisioningOrderSwr = (workspaceId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_WORKSPACE_PROVISIONING_RETRY_SWR_KEY(workspaceId),
        () => retryWorkspaceProvisioningOrder(workspaceId),
        {
            invalidates: [QUERY_AGENT_WORKSPACES_SWR_KEY],
            shouldInvalidate: accepted,
        },
    )
