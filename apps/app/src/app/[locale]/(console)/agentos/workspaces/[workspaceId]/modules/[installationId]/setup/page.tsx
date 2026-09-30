import type { Metadata } from "next"
import { AgentOSSolutionModulePage } from "@/features/pages/AgentOSSolutionModulePage"
import { readInstallationRoute, type InstallationRouteProps } from "@/modules/routes/installation"
import { readModuleMetadata } from "@/modules/routes/metadata"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = (): Promise<Metadata> => readModuleMetadata("metadata.agentosModuleSetup")

/** Mount the installation's setup surface. */
const Page = async ({ params }: InstallationRouteProps) => {
    const { workspaceId, installationId } = await readInstallationRoute(params)
    return <AgentOSSolutionModulePage workspaceId={workspaceId} installationId={installationId} view="setup" />
}

export default Page
