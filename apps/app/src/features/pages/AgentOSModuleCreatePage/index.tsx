import { AgentOSModuleCreatePage as AgentOSModuleCreatePageBlock } from "@/components/blocks/agentos/AgentOSModuleCreatePage"

/** Route identity supplied by the workspace modules segment. */
type AgentOSModuleCreatePageProps = {
    readonly workspaceId: string
}

/** Compose the interactive module creation block for one workspace. */
export const AgentOSModuleCreatePage = (props: AgentOSModuleCreatePageProps) => (
    <AgentOSModuleCreatePageBlock workspaceId={props.workspaceId} />
)

export default AgentOSModuleCreatePage