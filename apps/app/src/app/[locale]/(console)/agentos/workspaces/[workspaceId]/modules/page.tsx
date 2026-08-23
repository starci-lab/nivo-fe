import { AgentOSModuleCollectionPage } from "@/components/pages/AgentOSModuleCollectionPage"

type AgentOSModulesRouteProps = { readonly params: Promise<{ readonly workspaceId: string }> }

const AgentOSModulesRoute = async ({ params }: AgentOSModulesRouteProps) => {
    const { workspaceId } = await params
    return <AgentOSModuleCollectionPage workspaceId={workspaceId} />
}

export default AgentOSModulesRoute
