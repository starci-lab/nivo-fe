import type { SalesCloseRequest } from "@/modules/api/sales"
import type { useSalesWorkbench } from "@/hooks/agentos"
import type { Formatter } from "@/modules/i18n/formatter"
import type { WorkbenchSharedCopy } from "../WorkbenchRail"

/** Settled controller data and localized shared copy for the Sales workbench. */
export type SalesWorkbenchBlockData = {
    readonly view: ReturnType<typeof useSalesWorkbench>
    readonly format: Formatter
    readonly shared: WorkbenchSharedCopy
}

/** Commands the Sales workbench presentation sends back to its connected owner. */
export type SalesWorkbenchBlockActions = {
    readonly selectOpportunity: (opportunityId: string) => void
    readonly setFactKind: (kind: "customerRef" | "opportunityId") => void
    readonly setOutcome: (outcome: SalesCloseRequest["outcome"]) => void
}

/** Complete data and action contract for each named Sales workbench presentation unit. */
export type SalesWorkbenchSectionProps = {
    readonly props: SalesWorkbenchBlockData
    readonly on: SalesWorkbenchBlockActions
}
