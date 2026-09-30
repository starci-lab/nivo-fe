import { AgentOSModuleCollectionPage as AgentOSModuleCollectionPageBlock } from "@/components/blocks/agentos/AgentOSModuleCollectionPage"

/** Route identity supplied by the workspace modules segment. */
type AgentOSModuleCollectionPageProps = {
    readonly workspaceId: string
}

/** Compose the interactive module collection block for one workspace. */
export const AgentOSModuleCollectionPage = (props: AgentOSModuleCollectionPageProps) => (
    <AgentOSModuleCollectionPageBlock workspaceId={props.workspaceId} />
)

export default AgentOSModuleCollectionPage