import type {
    AccountingEvidenceInput,
    AccountingInstallationScope,
    AccountingResultDetailInput,
    AccountingRoutineResultInput,
    AccountingSummaryQueryInput,
} from "@/modules/api/accounting"
import type { NivoQueryKey } from "@/modules/swr/query-key-types"

/* One hook per file, one registered read per hook. */

/** Cache identity for one evidence identity inside one installation. */

export const accountingEvidenceQueryKey = (
    scope: AccountingInstallationScope,
    input: AccountingEvidenceInput,
): NivoQueryKey => [
    "accounting",
    "evidence",
    scope.workspaceId,
    scope.instanceId,
    scope.installationId,
    input.evidenceId,
]

/* One hook per file, one registered read per hook. */

/** Cache identity for one current or historical result detail inside one installation. */
export const accountingResultDetailQueryKey = (
    scope: AccountingInstallationScope,
    input: AccountingResultDetailInput,
): NivoQueryKey => [
    "accounting",
    "result-detail",
    scope.workspaceId,
    scope.instanceId,
    scope.installationId,
    input.action,
    input.action === "current" ? input.resultId : input.itemId,
    input.action === "current" ? "current" : input.asOf,
]

/* One hook per file, one registered read per hook. */

/** Cache identity for one routine intent inside one installation. */
export const accountingRoutineResultQueryKey = (
    scope: AccountingInstallationScope,
    input: AccountingRoutineResultInput,
): NivoQueryKey => [
    "accounting",
    "routine-result",
    scope.workspaceId,
    scope.instanceId,
    scope.installationId,
    input.intentId,
]

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
