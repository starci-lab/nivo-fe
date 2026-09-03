import { SectionHeader as DirectionHeader, PageContainer as DirectionPage, Badge, Button, SurfaceCard, Text, type BadgeTone } from "@starci/grammar/common";
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
    readonly isRetryPending?: boolean;
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
    const { launchState, workspaceId, detail, labels, onRetry, onReturn, isRetryPending = false } = props;
    const settled = labels.states[launchState];
    const action = launchState === "issuing" && !isRetryPending ? null : <Button variant="primary" type="button" isPending={isRetryPending} onPress={launchState === "connected" ? onReturn : onRetry}>{launchState === "connected" ? labels.returnToWorkspace : labels.retry}</Button>;
    return <DirectionPage measure="product"><div className="flex min-w-0 flex-col gap-2" data-contract="GAP-2"><DirectionHeader level={1} title={labels.title}/><SurfaceCard><div className="flex min-w-0 flex-col gap-2" data-contract="GAP-2"><Text weight="semibold">{labels.workspaceLabel}: {workspaceId}</Text><Badge tone={toneOf[launchState]}>{settled.label}</Badge><Text size="sm" tone="muted" live="polite">{detail ?? settled.detail}</Text>{action}</div></SurfaceCard><Text size="sm" tone="muted">{labels.securityNote}</Text></div></DirectionPage>;
};
