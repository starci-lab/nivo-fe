import { AgentOSOpenClawLaunchBridgeBase } from "./component";

/** Exact workspace route identity connected by the launch page. */
export type AgentOSOpenClawLaunchBridgeProps = {
  readonly workspaceId: string;
};

/** Connect the exact launch route; the child block owns issuing, connection, refusal, and expiry. */
export const AgentOSOpenClawLaunchBridge = (props: AgentOSOpenClawLaunchBridgeProps) => {
  const {
    workspaceId
  }: AgentOSOpenClawLaunchBridgeProps = props;
  return <AgentOSOpenClawLaunchBridgeBase workspaceId={workspaceId} />;
};
