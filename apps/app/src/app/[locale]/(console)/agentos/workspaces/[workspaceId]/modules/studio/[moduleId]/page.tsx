import { AgentOSModuleStudioPage } from "@/components/pages/AgentOSModuleStudioPage"

type AgentOSModuleStudioRouteProps = { readonly params: Promise<{ readonly workspaceId: string, readonly moduleId: string }> }

const AgentOSModuleStudioRoute = async ({ params }: AgentOSModuleStudioRouteProps) => {
    const { workspaceId, moduleId } = await params
    return <AgentOSModuleStudioPage workspaceId={workspaceId} moduleId={moduleId} />
}

export default AgentOSModuleStudioRoute
