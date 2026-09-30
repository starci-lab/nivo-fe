"use client"

import { resolveWorkspaceCheckoutEntry, type WorkspaceCheckoutEntryRequest } from "@/modules/api/workspace-controlplane"
import { useNivoQuery } from "../useNivoQuery"
import { type NivoQueryKey } from "../swr.shared"

/*
 * One hook per file, one registered read per hook: the file's basename is the hook it exports, which
 * is what the repository's source-name rule requires of a `use*` export. The entry key carries the
 * purchase and the workspace the read claims, so a read of one workspace never answers another's.
 */

/** Cache identity of one entry resolution: the purchase and the workspace the caller claims ready. */
export const workspaceCheckoutEntryQueryKey = (request: WorkspaceCheckoutEntryRequest): NivoQueryKey => [
    "workspace-checkout",
    "entry",
    request.purchaseId,
    request.workspaceId,
]

/**
 * Resolve the registered entry destination for one readiness-confirmed workspace.
 *
 * @param enabled - False while readiness is unconfirmed; a held read addresses nothing rather than
 *   addressing an identity the caller has not claimed.
 */
export const useQueryWorkspaceCheckoutEntrySwr = (request: WorkspaceCheckoutEntryRequest, enabled = true) =>
    useNivoQuery(enabled ? workspaceCheckoutEntryQueryKey(request) : null, () => resolveWorkspaceCheckoutEntry(request))
