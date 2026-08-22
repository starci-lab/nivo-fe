import { AgentOSOpenClawLaunchBridgeBase } from "./component"

/** Exact workspace route identity connected by the launch page. */
export type AgentOSOpenClawLaunchBridgeProps = { readonly workspaceId: string }

/** Connect the exact launch route; the child block owns issuing, connection, refusal, and expiry. */
export const AgentOSOpenClawLaunchBridge = ({ workspaceId }: AgentOSOpenClawLaunchBridgeProps) => (
    <AgentOSOpenClawLaunchBridgeBase workspaceId={workspaceId} />
)

/** Source-level tier marker for the connected OpenClaw launch page. */
export const meta = { shape: "page", world: "connected" } as const
