import type { Metadata } from "next"
import { AgentOSSolutionModulePage } from "@/features/pages/AgentOSSolutionModulePage"
import { readInstallationRoute, type InstallationRouteProps } from "@/modules/routes/installation"
import { readModuleMetadata } from "@/modules/routes/metadata"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = (): Promise<Metadata> => readModuleMetadata("metadata.agentosModuleSales")

/*
 * The Sales workbench page (ui.sales.workbench, surface opportunity-attention).
 *
 * The route discloses the workspace and the installation, and the operate view of THIS installation is
 * the surface the workbench draws in: whether an installation runs the Sales workbench is the open
 * registry's decision, not this route's, so the page does not name a workbench key of its own.
 */
const Page = async ({ params }: InstallationRouteProps) => {
    const { workspaceId, installationId } = await readInstallationRoute(params)
    return <AgentOSSolutionModulePage workspaceId={workspaceId} installationId={installationId} view="operate" />
}

export default Page
