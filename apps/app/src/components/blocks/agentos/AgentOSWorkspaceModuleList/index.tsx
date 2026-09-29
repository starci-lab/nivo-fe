import { AgentOSSolutionModuleCenter } from "@/components/blocks/agentos/AgentOSSolutionModuleCenter"

type AgentOSWorkspaceModuleListProps = { readonly workspaceId: string }

/** Place the existing module list in a workspace page section. */
export const AgentOSWorkspaceModuleList = (props: AgentOSWorkspaceModuleListProps) => (
    <AgentOSSolutionModuleCenter workspaceId={props.workspaceId} />
)
