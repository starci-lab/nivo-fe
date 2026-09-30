import { useSalesWorkbenchForm } from "./useSalesWorkbenchForm"
import { useWorkbenchScope } from "./useWorkbenchScope"
import { useSalesWorkbenchData } from "./useSalesWorkbenchData"
import { useSalesWorkbenchInputs } from "./useSalesWorkbenchInputs"
import type { SalesTranslation } from "@/modules/sales/sales-workbench"

/** Connect controls, addressed reads and validated action inputs for the Sales workbench. */
export const useSalesWorkbenchContext = (moduleId: string, locale: string, t: SalesTranslation) => {
    const form = useSalesWorkbenchForm()
    const scope = useWorkbenchScope(moduleId)
    const data = useSalesWorkbenchData({ ...form, ...scope })
    const inputs = useSalesWorkbenchInputs({ ...form, ...scope, ...data })
    return { ...form, ...scope, ...data, ...inputs, locale, t }
}
