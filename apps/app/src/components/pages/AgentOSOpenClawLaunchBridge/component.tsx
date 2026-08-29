import { AgentOSOpenClawLaunch } from "@/components/blocks/agentos/AgentOSOpenClawLaunch";

/** Fixed page input; the child block owns the complete launch lifecycle. */
export type AgentOSOpenClawLaunchBridgeProps = AgentOSOpenClawLaunchBridgeViewProps;
/** Public API role for AgentOSOpenClawLaunchBridgeViewProps. */
export type AgentOSOpenClawLaunchBridgeViewProps = {
  readonly workspaceId: string;
};

/** Compose the connected launch block without proxying launch state through PageProps. */
export const AgentOSOpenClawLaunchBridgeBase = (props: AgentOSOpenClawLaunchBridgeProps) => {
  const {
    workspaceId
  }: AgentOSOpenClawLaunchBridgeViewProps = props;
  return <AgentOSOpenClawLaunch workspaceId={workspaceId} />;
};

