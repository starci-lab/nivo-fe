
import { SurfaceCard, Button, Heading, Text, Badge, type BadgeTone } from "@starci/grammar/common";

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

      <Text weight="semibold">{labels.workspaceLabel}</Text>
      <Text size="xs" tone="muted">{workspaceId}</Text></div>

    <Badge tone={toneOf[launchState]}>{settled.label}</Badge>
    <Text size="sm" tone="muted">{detail ?? settled.detail}</Text>

    <Button
      variant="primary"
      isDisabled={launchState === "issuing"}
      isPending={launchState === "issuing"}
      onPress={launchState === "connected" ? onReturn : onRetry}
    >{actionLabel}</Button></div>;
  return <div>

    <Heading level={1}>{labels.title}</Heading>
    <SurfaceCard>{card}</SurfaceCard>
    <Text size="sm" tone="muted">{labels.securityNote}</Text></div>;
};

