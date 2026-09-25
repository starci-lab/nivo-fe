import { AgentOSSolutionModulePage } from "@/components/pages/AgentOSSolutionModulePage"
import type { AgentOSSolutionModuleRouteProps } from "../../page"

/*
 * The Sales workbench page (ui.sales.workbench, surface opportunity-attention).
 *
 * The route discloses the workspace and the installation, and the operate view of THIS installation is
 * the surface the workbench draws in: whether an installation runs the Sales workbench is the open
 * registry's decision, not this route's, so the page does not name a workbench key of its own.
 */
const AgentOSModuleOperateSalesRoute = async ({ params }: AgentOSSolutionModuleRouteProps) => {
    const { workspaceId, installationId } = await params
    return <AgentOSSolutionModulePage workspaceId={workspaceId} installationId={installationId} view="operate" />
}

export default AgentOSModuleOperateSalesRoute