"use client"

import { recoverWorkspacePurchase, type WorkspaceCheckoutRecoverRequest } from "@/modules/api/workspace-controlplane"
import { useNivoMutation } from "../useNivoMutation"
import { workspaceCheckoutStatusQueryKey } from "../queries/useQueryWorkspaceCheckoutStatusSwr"

/*
 * One hook per file, one registered command per hook: the file's basename is the hook it exports,
 * which is what the repository's source-name rule requires of a `use*` export. The command reconciles
 * against the request's own purchase identity, so the read it refreshes is the one it names.
 */

/**
 * Reconcile and advance one owned purchase through its original identities only.
 *
 * This is the safe retry: an uncertain attempt is reconciled rather than charged again, and an exact
 * repeat addresses the same purchase, so only that purchase's status read is refreshed.
 */
export const useMutateRecoverWorkspacePurchaseSwr = () =>
    useNivoMutation(
        ["workspace-checkout", "recover"],
        (request: WorkspaceCheckoutRecoverRequest) => recoverWorkspacePurchase(request),
        {
            invalidates: (request) => [workspaceCheckoutStatusQueryKey(request.purchaseId)],
        },
    )
