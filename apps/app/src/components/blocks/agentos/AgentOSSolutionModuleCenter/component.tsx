import type {
    AgentOSSolutionModuleCenterProps,
    AgentOSSolutionModuleCenterViewProps,
} from "@/modules/agentos/solution-module-center"
import { AgentOSSolutionModuleLedger } from "../AgentOSSolutionModuleLedger"
import { AgentOSSolutionModuleTabs } from "../AgentOSSolutionModuleTabs"

export type {
    AgentOSSolutionLedgerRow,
    AgentOSSolutionLedgerSectionStatus,
    AgentOSSolutionModuleCard,
    AgentOSSolutionModuleCenterProps,
    AgentOSSolutionModuleLedgerProps,
    AgentOSSolutionModuleCenterViewProps,
} from "@/modules/agentos/solution-module-center"

/** Stable typed root for the module center's tabs and ledger presentations. */
export const AgentOSSolutionModuleCenterBase = (props: AgentOSSolutionModuleCenterProps) => {
    const { ledger, ...rest } = props.props
    const view: AgentOSSolutionModuleCenterViewProps = {
        ...rest,
        state: props.state,
    }
    if (view.layout === "ledger" && ledger !== undefined)
        return (
            <AgentOSSolutionModuleLedger
                ledger={ledger}
                cards={view.cards}
                pendingId={view.pendingId}
                outcome={view.outcome}
                onPressCard={props.on.onPressCard}
            />
        )
    return <AgentOSSolutionModuleTabs view={view} on={props.on} />
}
