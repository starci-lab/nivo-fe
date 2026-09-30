import { readWorkspaceCheckoutStatus } from "@/modules/api/workspace-controlplane"
import { useNivoQuery } from "../useNivoQuery"
import { workspaceCheckoutStatusQueryKey } from "./queries.shared"

/**
 * Read one owned purchase's composed truth.
 *
 * @param enabled - False until a purchase identity is known; a held read addresses nothing rather
 *   than addressing the empty purchase identity.
 */
export const useQueryWorkspaceCheckoutStatusSwr = (purchaseId: string, enabled = true) =>
    useNivoQuery(enabled ? workspaceCheckoutStatusQueryKey(purchaseId) : null, () =>
        readWorkspaceCheckoutStatus(purchaseId),
    )
