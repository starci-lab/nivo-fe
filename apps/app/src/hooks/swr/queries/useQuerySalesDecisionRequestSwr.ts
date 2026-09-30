"use client"

import {
    readSalesDecisionRequest,
    type SalesDecisionRequestRequest,
    type SalesInstallationScope,
} from "@/modules/api/sales"
import { operationReadIdentity } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { type NivoQueryKey } from "../swr.shared"

/*
 * One hook per file, one registered read per hook: this file names exactly one Sales operation, its
 * cache identity and the stable read identity the route echoes. This is the read a decision answer
 * is reconciled by, so an answered proposal is settled from its own committed state.
 */

/** Cache identity for one decision request inside one installation. */
export const salesDecisionRequestQueryKey = (
    scope: SalesInstallationScope,
    input: SalesDecisionRequestRequest,
): NivoQueryKey => [
    "sales",
    "decision-request",
    scope.workspaceId,
    scope.instanceId,
    scope.installationId,
    input.decisionRequestId,
]

/**
 * Read one decision request's committed state.
 *
 * @param enabled - False while the installation scope or the decision identity is not yet known; a
 *   held read addresses nothing rather than addressing a half-filled operation path.
 */
export const useQuerySalesDecisionRequestSwr = (
    scope: SalesInstallationScope,
    input: SalesDecisionRequestRequest,
    enabled = true,
) => {
    const accessToken = useAccessToken()
    return useNivoQuery(enabled && accessToken !== null ? salesDecisionRequestQueryKey(scope, input) : null, () =>
        readSalesDecisionRequest(
            accessToken,
            scope,
            input,
            operationReadIdentity("sales.decisionRequest@1", scope.installationId, input.decisionRequestId),
        ),
    )
}
