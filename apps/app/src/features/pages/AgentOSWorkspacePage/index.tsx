import { AgentOSWorkspacePage as AgentOSWorkspacePageBlock } from "@/components/blocks/agentos/AgentOSWorkspacePage"

/** Exact workspace route identity. */
type AgentOSWorkspacePageProps = {
    readonly workspaceId: string
}

/** Compose the interactive workspace page block for one persisted workspace. */
export const AgentOSWorkspacePage = (props: AgentOSWorkspacePageProps) => (
    <AgentOSWorkspacePageBlock workspaceId={props.workspaceId} />
)

export default AgentOSWorkspacePage