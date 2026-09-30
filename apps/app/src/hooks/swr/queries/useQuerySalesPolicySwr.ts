"use client"

import { readSalesPolicy, type SalesInstallationScope, type SalesPolicyRequest } from "@/modules/api/sales"
import { operationReadIdentity } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { type NivoQueryKey } from "../swr.shared"

/*
 * One hook per file, one registered read per hook: this file names exactly one Sales operation, its
 * cache identity and the stable read identity the route echoes.
 */

/** Cache identity for one installation's policy revision, current or the one a configure request stored. */
export const salesPolicyQueryKey = (scope: SalesInstallationScope, input: SalesPolicyRequest): NivoQueryKey => [
    "sales",
    "policy",
    scope.workspaceId,
    scope.instanceId,
    scope.installationId,
    input.requestId ?? "current-revision",
]

/**
 * Read one installation's operating policy, or the revision one configure request stored.
 *
 * @param enabled - False while the installation scope or the selector is not yet known; a held read
 *   addresses nothing rather than addressing a half-filled operation path.
 */
export const useQuerySalesPolicySwr = (scope: SalesInstallationScope, input: SalesPolicyRequest, enabled = true) => {
    const accessToken = useAccessToken()
    return useNivoQuery(enabled && accessToken !== null ? salesPolicyQueryKey(scope, input) : null, () =>
        readSalesPolicy(
            accessToken,
            scope,
            input,
            operationReadIdentity("sales.policy@1", scope.installationId, input.requestId),
        ),
    )
}
