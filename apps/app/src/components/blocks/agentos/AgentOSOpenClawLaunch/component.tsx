import { Badge, Button, Heading, SurfaceCard, Text, type BadgeTone } from "@nivo/ui";

/** Source-owned launch phases rendered independently from workspace readiness. */
export type AgentOSOpenClawLaunchProps = AgentOSOpenClawLaunchViewProps;
/** Public API role for OpenClawLaunchBlockState. */
export type OpenClawLaunchBlockState = "issuing" | "connected" | "blocked" | "expired" | "disconnected";

/** Resolved copy for the credential-free launch bridge. */
export type AgentOSOpenClawLaunchLabels = {
  readonly title: string;
  readonly workspaceLabel: string;
  readonly securityNote: string;
  readonly returnToWorkspace: string;
  readonly retry: string;
  readonly states: Readonly<Record<OpenClawLaunchBlockState, {
    readonly label: string;
    readonly detail: string;
  }>>;
};

/** Fixed launch page anatomy with an independently settled launch block. */
export type AgentOSOpenClawLaunchViewProps = {
  readonly launchState: OpenClawLaunchBlockState;
  readonly workspaceId: string;
  readonly detail?: string;
  readonly labels: AgentOSOpenClawLaunchLabels;
  readonly onRetry: () => void;
  readonly onReturn: () => void;
};
const toneOf: Readonly<Record<OpenClawLaunchBlockState, BadgeTone>> = {
  issuing: "warning",
  connected: "success",
  blocked: "danger",
  expired: "warning",
  disconnected: "neutral"
};

/** Draw every launch-axis state without accepting a launch URL, token or credential-shaped value. */
export const AgentOSOpenClawLaunchBase = (props: AgentOSOpenClawLaunchProps) => {
  const {
    launchState,
    workspaceId,
    detail,
    labels,
    onRetry,
    onReturn
  }: AgentOSOpenClawLaunchViewProps = props;
  const settled = labels.states[launchState];
  let actionLabel = labels.retry;
  if (launchState === "connected") actionLabel = labels.returnToWorkspace;else if (launchState === "issuing") actionLabel = settled.label;
  const card = <div><div>

      <Text props={{
        content: labels.workspaceLabel,
        weight: "semibold"
      }} />
      <Text props={{
        content: workspaceId,
        size: "xs",
        tone: "muted"
      }} /></div>

    <Badge props={{
      content: settled.label,
      tone: toneOf[launchState]
    }} />
    <Text props={{
      content: detail ?? settled.detail,
      size: "sm",
      tone: "muted"
    }} />

    <Button props={{
      label: actionLabel,
      variant: "primary",
      disabled: launchState === "issuing",
      isPending: launchState === "issuing"
    }} on={{
      press: launchState === "connected" ? onReturn : onRetry
    }} /></div>;
  return <div>

    <Heading props={{
      content: labels.title,
      level: 1
    }} />
    <SurfaceCard>{card}</SurfaceCard>
    <Text props={{
      content: labels.securityNote,
      size: "sm",
      tone: "muted"
    }} /></div>;
};

