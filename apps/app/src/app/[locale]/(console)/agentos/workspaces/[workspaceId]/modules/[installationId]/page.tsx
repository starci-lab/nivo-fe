import { AgentOSSolutionModulePage } from "@/features/pages/AgentOSSolutionModulePage"

/** Dynamic route identities for one exact AgentOS module installation. */
type AgentOSSolutionModuleRouteProps = {
    readonly params: Promise<{ readonly workspaceId: string; readonly installationId: string }>
}

/** Mount the owner-scoped module detail page under its workspace identity. */
const Page = async ({ params }: AgentOSSolutionModuleRouteProps) => {
    const { workspaceId, installationId } = await params
    return <AgentOSSolutionModulePage workspaceId={workspaceId} installationId={installationId} view="setup" />
}

export default Page
