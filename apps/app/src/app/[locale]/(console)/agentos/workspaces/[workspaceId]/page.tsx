import { AgentOSWorkspacePage } from "@/features/pages/AgentOSWorkspacePage"

/** Dynamic identity supplied by the locale-aware workspace route. */
type AgentOSWorkspaceRouteProps = { readonly params: Promise<{ readonly workspaceId: string }> }

/** Mount one exact owner-scoped AgentOS workspace control center. */
const Page = async ({ params }: AgentOSWorkspaceRouteProps) => {
    const { workspaceId } = await params
    return <AgentOSWorkspacePage workspaceId={workspaceId} />
}

export default Page
