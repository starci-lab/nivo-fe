import { AgentOSSolutionModulePage } from "@/components/pages/AgentOSSolutionModulePage"
import type { AgentOSSolutionModuleRouteProps } from "../page"

const AgentOSModuleDiagnosticsRoute = async ({ params }: AgentOSSolutionModuleRouteProps) => {
    const { workspaceId, installationId } = await params
    return <AgentOSSolutionModulePage workspaceId={workspaceId} installationId={installationId} view="diagnostics" />
}

export default AgentOSModuleDiagnosticsRoute