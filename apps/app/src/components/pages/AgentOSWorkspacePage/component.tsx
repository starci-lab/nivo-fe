import { AgentOSWorkspaceControlCenter } from "@/components/blocks/agentos/AgentOSWorkspaceControlCenter"
import type { AgentOSWorkspacePageState } from "@/components/blocks/agentos/AgentOSWorkspaceControlCenter/component"

/** Page-owned route and tab axis; aggregate state and data remain in the child block. */
export type AgentOSWorkspacePageViewProps = {
    readonly workspaceId: string
    readonly pageState: AgentOSWorkspacePageState
    readonly onSelectPageState: (pageState: AgentOSWorkspacePageState) => void
}

/** Compose the real connected control-center child without proxying its request state or data. */
export const AgentOSWorkspacePageBase = ({ workspaceId, pageState, onSelectPageState }: AgentOSWorkspacePageViewProps) => (
    <AgentOSWorkspaceControlCenter workspaceId={workspaceId} pageState={pageState} onSelectPageState={onSelectPageState} />
)

export type { AgentOSWorkspacePageState }
/** Source-level tier marker for the pure workspace page compositor. */
export const meta = { shape: "page", world: "pure" } as const
