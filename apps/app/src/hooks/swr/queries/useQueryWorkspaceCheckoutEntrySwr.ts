import type { WorkspacePurchaseEntryInput } from "@/modules/api/__generated__/core"

import { resolveWorkspaceCheckoutEntry } from "@/modules/api/workspace-controlplane"
import { useNivoQuery } from "../useNivoQuery"
import { workspaceCheckoutEntryQueryKey } from "./queries.shared"

/**
 * Resolve the registered entry destination for one readiness-confirmed workspace.
 *
 * @param enabled - False while readiness is unconfirmed; a held read addresses nothing rather than
 *   addressing an identity the caller has not claimed.
 */

export const useQueryWorkspaceCheckoutEntrySwr = (request: WorkspacePurchaseEntryInput, enabled = true) =>
    useNivoQuery(enabled ? workspaceCheckoutEntryQueryKey(request) : null, () => resolveWorkspaceCheckoutEntry(request))
