import { SalesHandoffBlock } from "@/features/pages/agentos"

/** Dynamic route identities for one exact AgentOS module installation. */
type AgentOSSolutionModuleRouteProps = {
    readonly params: Promise<{ readonly workspaceId: string; readonly installationId: string }>
}

/** The handoff surface's own route: it mounts the surface for the installation the route names. */
const Page = async ({ params }: AgentOSSolutionModuleRouteProps) => {
    const { workspaceId, installationId } = await params
    return <SalesHandoffBlock workspaceId={workspaceId} installationId={installationId} />
}

export default Page
