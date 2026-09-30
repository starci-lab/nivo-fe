import type { AccountingTranslation } from "@/modules/accounting/accounting-workbench"
import { useAccountingWorkbenchContext } from "./useAccountingWorkbenchContext"
import { useAccountingWorkbenchFeedback } from "./useAccountingWorkbenchFeedback"
import { useAccountingWorkbenchIntakeActions } from "./useAccountingWorkbenchIntakeActions"
import { useAccountingWorkbenchExceptionActions } from "./useAccountingWorkbenchExceptionActions"
import { useAccountingWorkbenchCorrectionActions } from "./useAccountingWorkbenchCorrectionActions"
import { useAccountingWorkbenchPrimaryRegions } from "./useAccountingWorkbenchPrimaryRegions"
import { useAccountingWorkbenchSecondaryRegions } from "./useAccountingWorkbenchSecondaryRegions"

/** The guarded Accounting handlers and shared command lifecycle consumed by its regions. */
export type AccountingWorkbenchActions = ReturnType<typeof useAccountingWorkbenchIntakeActions> &
    ReturnType<typeof useAccountingWorkbenchExceptionActions> &
    ReturnType<typeof useAccountingWorkbenchCorrectionActions> &
    Pick<ReturnType<typeof useAccountingWorkbenchFeedback>, "workbenchCommand">

/** Connect the Accounting workbench to addressed reads, guarded commands and pure region projections. */
export const useAccountingWorkbench = (moduleId: string, locale: string, t: AccountingTranslation) => {
    const context = useAccountingWorkbenchContext(moduleId, locale, t)
    const feedback = useAccountingWorkbenchFeedback(context)
    const intake = useAccountingWorkbenchIntakeActions(context, feedback)
    const exception = useAccountingWorkbenchExceptionActions(context, feedback)
    const correction = useAccountingWorkbenchCorrectionActions(context, feedback)
    const actions = { ...intake, ...exception, ...correction, workbenchCommand: feedback.workbenchCommand }
    return {
        ...useAccountingWorkbenchPrimaryRegions(context, actions),
        ...useAccountingWorkbenchSecondaryRegions(context, actions),
    }
}
