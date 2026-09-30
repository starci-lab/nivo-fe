
import type { WorkspaceCheckoutStartInput } from "@/modules/api/__generated__/core"

import { type Outcome } from "@nivo/api"
import { startWorkspaceCheckoutPurchase, type WorkspaceCheckoutAnswer } from "@/modules/api/workspace-controlplane"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_WORKSPACE_CHECKOUT_START_SWR_KEY } from "../swr.shared"
import { workspaceCheckoutStatusQueryKey } from "../queries/queries.shared"

/*
 * One hook per file, one registered command per hook: the file's basename is the hook it exports,
 * which is what the repository's source-name rule requires of a `use*` export. The press-local key is
 * inline rather than a module constant, and the read to refresh is taken from the command's own
 * answer, so a refused or unknown admission refreshes exactly the purchase it named.
 */

/** The purchase identity an admission answer names, or null when the answer names none. */

const admittedPurchaseId = (answer: Outcome<WorkspaceCheckoutAnswer>): string | null => {
    if (!answer.ok || answer.data.status === "offers") return null
    return answer.data.purchaseId ?? null
}

/**
 * Admit one purchase under its retry identity and request its provider attempt.
 *
 * A returned payment action is an instruction to complete, never a receipt, so this command only
 * refreshes the purchase-status read and never advances the checkout cursor itself.
 */
export const useMutateWorkspaceCheckoutStartSwr = () =>
    useNivoMutation(
        MUTATION_WORKSPACE_CHECKOUT_START_SWR_KEY,
        (request: WorkspaceCheckoutStartInput) => startWorkspaceCheckoutPurchase(request),
        {
            invalidates: (_request, answer) => {
                const purchaseId = admittedPurchaseId(answer)
                return purchaseId === null ? [] : [workspaceCheckoutStatusQueryKey(purchaseId)]
            },
        },
    )
