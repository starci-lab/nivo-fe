import {
    Badge,
    Button,
    Heading,
    SurfaceCard,
    Text,
    Tree,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type BadgeTone,
} from "@nivo/ui"

/** Source-owned launch phases rendered independently from workspace readiness. */
export type OpenClawLaunchBlockState = "issuing" | "connected" | "blocked" | "expired" | "disconnected"

/** Resolved copy for the credential-free launch bridge. */
export type AgentOSOpenClawLaunchLabels = {
    readonly title: string
    readonly workspaceLabel: string
    readonly securityNote: string
    readonly returnToWorkspace: string
    readonly retry: string
    readonly states: Readonly<Record<OpenClawLaunchBlockState, { readonly label: string, readonly detail: string }>>
}

/** Fixed launch page anatomy with an independently settled launch block. */
export type AgentOSOpenClawLaunchViewProps = {
    readonly launchState: OpenClawLaunchBlockState
    readonly workspaceId: string
    readonly detail?: string
    readonly labels: AgentOSOpenClawLaunchLabels
    readonly onRetry: () => void
    readonly onReturn: () => void
}

const toneOf: Readonly<Record<OpenClawLaunchBlockState, BadgeTone>> = {
    issuing: "warning",
    connected: "success",
    blocked: "danger",
    expired: "warning",
    disconnected: "neutral",
}

/** Draw every launch-axis state without accepting a launch URL, token or credential-shaped value. */
export const AgentOSOpenClawLaunchBase = ({ launchState, workspaceId, detail, labels, onRetry, onReturn }: AgentOSOpenClawLaunchViewProps) => {
    const settled = labels.states[launchState]
    let actionLabel = labels.retry
    if (launchState === "connected") actionLabel = labels.returnToWorkspace
    else if (launchState === "issuing") actionLabel = settled.label
    const card = defineContractComponent("status-action-card", {
        identity: defineContractComponent("subject-over-muted-caption", {
            subject: defineLeafComponent("text", { weight: "semibold" }, () => <Text props={{ content: labels.workspaceLabel, weight: "semibold" }} />),
            caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: workspaceId, size: "xs", tone: "muted" }} />),
        }),
        state: defineLeafComponent("badge", {}, () => <Badge props={{ content: settled.label, tone: toneOf[launchState] }} />),
        detail: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: detail ?? settled.detail, size: "sm", tone: "muted" }} />),
        action: defineLeafComponent("button", {}, () => (
            <Button
                props={{ label: actionLabel, variant: "primary", disabled: launchState === "issuing", isPending: launchState === "issuing" }}
                on={{ press: launchState === "connected" ? onReturn : onRetry }}
            />
        )),
    })
    return (
        <Tree contract="secure-launch-bridge-page" render={defineContractComponent("secure-launch-bridge-page", {
            heading: defineLeafComponent("heading", {}, () => <Heading props={{ content: labels.title, level: 1 }} />),
            card: defineContractProjection("status-action-card", () => <SurfaceCard contract="status-action-card" render={card} />),
            security: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: labels.securityNote, size: "sm", tone: "muted" }} />),
        })} />
    )
}

/** Source-level tier marker for the pure OpenClaw launch block. */
export const meta = { shape: "block", world: "pure" } as const
