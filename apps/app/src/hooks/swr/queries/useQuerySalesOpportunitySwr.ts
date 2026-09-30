"use client"

import { readSalesOpportunity, type SalesInstallationScope, type SalesOpportunityRequest } from "@/modules/api/sales"
import { operationReadIdentity } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { type NivoQueryKey } from "../swr.shared"

/*
 * One hook per file, one registered read per hook: this file names exactly one Sales operation, its
 * cache identity and the stable read identity the route echoes. This is the read a close is
 * reconciled by, and a close's own identity never enters it: the read names the opportunity it
 * observes.
 */

/** Cache identity for one opportunity inside one installation. */
export const salesOpportunityQueryKey = (
    scope: SalesInstallationScope,
    input: SalesOpportunityRequest,
): NivoQueryKey => [
    "sales",
    "opportunity",
    scope.workspaceId,
    scope.instanceId,
    scope.installationId,
    input.opportunityId,
]

/**
 * Read one opportunity's committed state.
 *
 * @param enabled - False while the installation scope or the selector is not yet known; a held read
 *   addresses nothing rather than addressing a half-filled operation path.
 */
export const useQuerySalesOpportunitySwr = (
    scope: SalesInstallationScope,
    input: SalesOpportunityRequest,
    enabled = true,
) => {
    const accessToken = useAccessToken()
    return useNivoQuery(enabled && accessToken !== null ? salesOpportunityQueryKey(scope, input) : null, () =>
        readSalesOpportunity(
            accessToken,
            scope,
            input,
            operationReadIdentity("sales.opportunity@1", scope.installationId, input.opportunityId),
        ),
    )
}
