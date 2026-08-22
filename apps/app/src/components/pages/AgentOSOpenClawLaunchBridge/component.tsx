import { AgentOSOpenClawLaunch } from "@/components/blocks/agentos/AgentOSOpenClawLaunch"

/** Fixed page input; the child block owns the complete launch lifecycle. */
export type AgentOSOpenClawLaunchBridgeViewProps = { readonly workspaceId: string }

/** Compose the connected launch block without proxying launch state through PageProps. */
export const AgentOSOpenClawLaunchBridgeBase = ({ workspaceId }: AgentOSOpenClawLaunchBridgeViewProps) => (
    <AgentOSOpenClawLaunch workspaceId={workspaceId} />
)

/** Source-level tier marker for the pure OpenClaw launch page compositor. */
export const meta = { shape: "page", world: "pure" } as const
