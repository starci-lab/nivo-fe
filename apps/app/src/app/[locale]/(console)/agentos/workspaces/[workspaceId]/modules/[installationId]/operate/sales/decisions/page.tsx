import type { Metadata } from "next"
import { SalesDecisionBlock } from "@/features/pages/agentos"
import { readInstallationRoute, type InstallationRouteProps } from "@/modules/routes/installation"
import { readModuleMetadata } from "@/modules/routes/metadata"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = (): Promise<Metadata> => readModuleMetadata("metadata.agentosModuleSalesDecisions")

/** The decision surface's own route: it mounts the surface for the installation the route names. */
const Page = async ({ params }: InstallationRouteProps) => {
    const { workspaceId, installationId } = await readInstallationRoute(params)
    return <SalesDecisionBlock workspaceId={workspaceId} installationId={installationId} />
}

export default Page
