import { AgentOSConsolePage } from "@/components/pages/AgentOSConsolePage"

/** Dynamic identity supplied by the standalone auxiliary-window route. */
export type AgentOSConsoleRouteProps = { readonly params: Promise<{ readonly workspaceId: string }> }

/** Mount the Nivo-owned OpenClaw console without the main console shell. */
const AgentOSConsoleRoute = async ({ params }: AgentOSConsoleRouteProps) => {
    const { workspaceId } = await params
    return <AgentOSConsolePage workspaceId={workspaceId} />
}

export default AgentOSConsoleRoute
