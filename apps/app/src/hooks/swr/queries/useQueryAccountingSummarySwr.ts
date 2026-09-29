"use client"

import {
    readAccountingSummary,
    type AccountingInstallationScope,
    type AccountingSummaryQueryInput,
} from "@/modules/api/accounting"
import { operationReadIdentity } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery, type NivoQueryKey } from "../useNivoQuery"

/* One hook per file, one registered read per hook. */

/** Cache identity for one summary page inside one installation. */
export const accountingSummaryQueryKey = (
    scope: AccountingInstallationScope,
    input: AccountingSummaryQueryInput,
): NivoQueryKey => [
    "accounting",
    "summary",
    scope.workspaceId,
    scope.instanceId,
    scope.installationId,
    input.periodStart,
    input.periodEndExclusive,
    input.currency ?? "all-currencies",
    input.pageSize,
    input.cursor ?? "first-page",
]

/**
 * Read one canonical summary period with its explicit partial coverage and continuation.
 *
 * @param enabled - False until the installation scope is resolved.
 */
export const useQueryAccountingSummarySwr = (
    scope: AccountingInstallationScope,
    input: AccountingSummaryQueryInput,
    enabled = true,
) => {
    const accessToken = useAccessToken()
    return useNivoQuery(enabled && accessToken !== null ? accountingSummaryQueryKey(scope, input) : null, () =>
        readAccountingSummary(
            accessToken,
            scope,
            input,
            operationReadIdentity(
                "accounting.summary@1",
                scope.installationId,
                input.periodStart,
                input.periodEndExclusive,
                input.currency,
                input.cursor,
            ),
        ),
    )
}
