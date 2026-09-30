import { readAccountingRoutineResult, type AccountingInstallationScope, type AccountingRoutineResultInput } from "@/modules/api/accounting"
import { operationReadIdentity } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { accountingRoutineResultQueryKey } from "./queries.shared"

/**
 * Read the stable state of one routine intent, the only read an uncertain routine is reconciled by.
 *
 * @param enabled - False while the installation scope or the intent is not yet known.
 */
export const useQueryAccountingRoutineResultSwr = (
    scope: AccountingInstallationScope,
    input: AccountingRoutineResultInput,
    enabled = true,
) => {
    const accessToken = useAccessToken()
    return useNivoQuery(enabled && accessToken !== null ? accountingRoutineResultQueryKey(scope, input) : null, () =>
        readAccountingRoutineResult(
            accessToken,
            scope,
            input,
            operationReadIdentity("accounting.routineResult@1", scope.installationId, input.intentId),
        ),
    )
}
