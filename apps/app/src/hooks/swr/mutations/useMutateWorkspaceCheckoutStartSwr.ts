"use client"

import type { Outcome } from "@/modules/api/outcome"
import {
    startWorkspaceCheckoutPurchase,
    type WorkspaceCheckoutAnswer,
    type WorkspaceCheckoutStartRequest,
} from "@/modules/api/workspace-controlplane"
import { useNivoMutation } from "../useNivoMutation"
import { workspaceCheckoutStatusQueryKey } from "../queries/useQueryWorkspaceCheckoutStatusSwr"

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
        ["workspace-checkout", "start"],
        (request: WorkspaceCheckoutStartRequest) => startWorkspaceCheckoutPurchase(request),
        {
            invalidates: (_request, answer) => {
                const purchaseId = admittedPurchaseId(answer)
                return purchaseId === null ? [] : [workspaceCheckoutStatusQueryKey(purchaseId)]
            },
        },
    )
