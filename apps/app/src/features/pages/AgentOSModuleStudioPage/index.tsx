import { AgentOSModuleStudioPage as AgentOSModuleStudioPageBlock } from "@/components/blocks/agentos/AgentOSModuleStudioPage"

/** Route identities supplied by the workspace module studio segment. */
type AgentOSModuleStudioPageProps = {
    readonly workspaceId: string
    readonly moduleId: string
}

/** Compose the interactive module studio block for one workspace module. */
export const AgentOSModuleStudioPage = (props: AgentOSModuleStudioPageProps) => (
    <AgentOSModuleStudioPageBlock workspaceId={props.workspaceId} moduleId={props.moduleId} />
)

export default AgentOSModuleStudioPage