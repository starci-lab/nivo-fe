import type { SalesTranslation } from "@/modules/sales/sales-workbench"
import { useSalesWorkbenchContext } from "./useSalesWorkbenchContext"
import { useSalesWorkbenchActions } from "./useSalesWorkbenchActions"
import { useSalesWorkbenchPrimaryRegions } from "./useSalesWorkbenchPrimaryRegions"
import { useSalesWorkbenchSecondaryRegions } from "./useSalesWorkbenchSecondaryRegions"

/** Connect the Sales workbench to addressed reads, guarded commands and pure region projections. */
export const useSalesWorkbench = (moduleId: string, locale: string, t: SalesTranslation) => {
    const context = useSalesWorkbenchContext(moduleId, locale, t)
    const actions = useSalesWorkbenchActions(context)
    const view = { ...context, ...actions }
    return { ...useSalesWorkbenchPrimaryRegions(view), ...useSalesWorkbenchSecondaryRegions(view) }
}
