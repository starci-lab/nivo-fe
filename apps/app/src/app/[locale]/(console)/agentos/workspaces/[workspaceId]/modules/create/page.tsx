import { AgentOSModuleCreatePage } from "@/components/pages/AgentOSModuleCreatePage"

type AgentOSModuleCreateRouteProps = { readonly params: Promise<{ readonly workspaceId: string }> }

const AgentOSModuleCreateRoute = async ({ params }: AgentOSModuleCreateRouteProps) => {
    const { workspaceId } = await params
    return <AgentOSModuleCreatePage workspaceId={workspaceId} />
}

export default AgentOSModuleCreateRoute
