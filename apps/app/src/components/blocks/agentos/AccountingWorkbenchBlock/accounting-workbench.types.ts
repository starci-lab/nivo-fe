import type { useAccountingWorkbench } from "@/hooks/agentos"
import type { WorkbenchSharedCopy } from "../WorkbenchRail"

/** The complete settled workbench view shared by its named presentation units. */
export type AccountingWorkbenchView = ReturnType<typeof useAccountingWorkbench>

/** Common values passed to each accounting surface section. */
export type AccountingWorkbenchSectionData = {
    readonly view: AccountingWorkbenchView
    readonly shared: WorkbenchSharedCopy
    readonly scopeReady: boolean
}

/** The settled data and shared workbench copy drawn by the base component. */
export type AccountingWorkbenchBlockData = {
    readonly view: AccountingWorkbenchView
    readonly shared: WorkbenchSharedCopy
}
