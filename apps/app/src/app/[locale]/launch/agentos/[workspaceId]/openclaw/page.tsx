import { AgentOSOpenClawLaunchBridge } from "@/components/pages/AgentOSOpenClawLaunchBridge"

/** Dynamic identity supplied by the native OpenClaw launch bridge route. */
export type AgentOSOpenClawLaunchRouteProps = { readonly params: Promise<{ readonly workspaceId: string }> }

/** Mount the credential-free bridge in the browser-created tab. */
const AgentOSOpenClawLaunchRoute = async ({ params }: AgentOSOpenClawLaunchRouteProps) => {
    const { workspaceId } = await params
    return <AgentOSOpenClawLaunchBridge workspaceId={workspaceId} />
}

export default AgentOSOpenClawLaunchRoute
