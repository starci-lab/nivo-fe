import { AgentOSSolutionModulePage } from "@/components/pages/AgentOSSolutionModulePage"
import type { AgentOSSolutionModuleRouteProps } from "../page"

const AgentOSModuleOperateRoute = async ({ params }: AgentOSSolutionModuleRouteProps) => {
    const { workspaceId, installationId } = await params
    return <AgentOSSolutionModulePage workspaceId={workspaceId} installationId={installationId} view="operate" />
}

export default AgentOSModuleOperateRoute
