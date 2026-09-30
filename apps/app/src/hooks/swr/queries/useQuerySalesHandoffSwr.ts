"use client"

import { readSalesHandoff, type SalesHandoffRequest, type SalesInstallationScope } from "@/modules/api/sales"
import { operationReadIdentity } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { type NivoQueryKey } from "../swr.shared"

/*
 * One hook per file, one registered read per hook: this file names exactly one Sales operation, its
 * cache identity and the stable read identity the route echoes. This is the read a prepared or
 * submitted handoff is reconciled by, and it discloses only the sender's own state - the Accounting
 * intake receipt is Accounting's to disclose.
 */

/** Cache identity for one Accounting handoff inside one installation. */
export const salesHandoffQueryKey = (scope: SalesInstallationScope, input: SalesHandoffRequest): NivoQueryKey => [
    "sales",
    "handoff",
    scope.workspaceId,
    scope.instanceId,
    scope.installationId,
    input.handoffId,
]

/**
 * Read one Accounting handoff's sender-side state.
 *
 * @param enabled - False while the installation scope or the handoff identity is not yet known; a
 *   held read addresses nothing rather than addressing a half-filled operation path.
 */
export const useQuerySalesHandoffSwr = (scope: SalesInstallationScope, input: SalesHandoffRequest, enabled = true) => {
    const accessToken = useAccessToken()
    return useNivoQuery(enabled && accessToken !== null ? salesHandoffQueryKey(scope, input) : null, () =>
        readSalesHandoff(
            accessToken,
            scope,
            input,
            operationReadIdentity("sales.handoff@1", scope.installationId, input.handoffId),
        ),
    )
}
