import { AgentOSWorkspacePage } from "@/components/pages/AgentOSWorkspacePage"

/** Dynamic identity supplied by the locale-aware workspace route. */
export type AgentOSWorkspaceRouteProps = { readonly params: Promise<{ readonly workspaceId: string }> }

/** Mount one exact owner-scoped AgentOS workspace control center. */
const AgentOSWorkspaceRoute = async ({ params }: AgentOSWorkspaceRouteProps) => {
    const { workspaceId } = await params
    return <AgentOSWorkspacePage workspaceId={workspaceId} />
}

export default AgentOSWorkspaceRoute