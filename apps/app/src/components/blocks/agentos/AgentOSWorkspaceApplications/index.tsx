import { StatusActionCard, SurfaceCard, defineCompositeComponent, defineContractComponent } from "@nivo/ui"
import type { StatusActionCardData } from "@nivo/ui"
import type { AgentWorkspaceAppCapability } from "@/modules/api/console"

/** Workspace capabilities and resolved copy consumed by the application block. */
export type AgentOSWorkspaceApplicationsProps = {
    readonly apps: ReadonlyArray<AgentWorkspaceAppCapability>
    readonly labels: {
        readonly section: string
        readonly openclaw: string
        readonly n8n: string
        readonly openclawDescription: string
        readonly n8nDescription: string
        readonly available: string
        readonly unavailable: string
        readonly manage: string
        readonly unavailableAction: string
        readonly securityUpgradeRequired: string
        readonly unavailableDetail: string
        readonly opening: string
        readonly openAgain: string
        readonly blocked: string
        readonly expired: string
        readonly disconnected: string
    }
    readonly launchState: "idle" | "opening" | "connected" | "blocked" | "expired" | "disconnected"
    readonly openClawLaunchHref: string
    readonly onManageOpenClaw: () => void
}

/** The resolved copy this block draws with. */
type ApplicationLabels = AgentOSWorkspaceApplicationsProps["labels"]

/** How far the OpenClaw launch has got. */
type LaunchState = AgentOSWorkspaceApplicationsProps["launchState"]

/**
 * The launch states that speak for themselves on the card's detail line.
 *
 * `idle`, `opening` and `connected` are deliberately absent: they are reported by the action label
 * rather than the detail line, and a missing entry here means "the detail line has nothing to add".
 */
const LAUNCH_DETAIL_LABEL: Partial<Record<LaunchState, keyof ApplicationLabels>> = {
    blocked: "blocked",
    expired: "expired",
    disconnected: "disconnected",
}

/**
 * What the card's detail line says, in the order the reasons outrank each other.
 *
 * A refused capability outranks a stalled launch, which outranks the version an available app
 * reports, which outranks the generic unavailable note.
 *
 * @param app - The capability the card is drawn for.
 * @param labels - Resolved copy.
 * @param launchState - How far the OpenClaw launch has got.
 * @param openClaw - Whether this card is the OpenClaw one.
 * @returns The detail line, or `undefined` when there is nothing to say.
 */
const detailFor = (
    app: AgentWorkspaceAppCapability,
    labels: ApplicationLabels,
    launchState: LaunchState,
    openClaw: boolean,
): string | undefined => {
    if (app.reason === "SECURITY_UPGRADE_REQUIRED") {
        return labels.securityUpgradeRequired
    }
    const launchLabel = openClaw ? LAUNCH_DETAIL_LABEL[launchState] : undefined
    if (launchLabel !== undefined) {
        return labels[launchLabel]
    }
    return app.available ? app.observedVersion ?? undefined : labels.unavailableDetail
}

/**
 * What the card's action reads.
 *
 * Only OpenClaw has an action at all; the other card names its own absence rather than offering a
 * control that would refuse.
 *
 * @param labels - Resolved copy.
 * @param launchState - How far the OpenClaw launch has got.
 * @param openClaw - Whether this card is the OpenClaw one.
 * @returns The action label.
 */
const actionLabelFor = (labels: ApplicationLabels, launchState: LaunchState, openClaw: boolean): string => {
    if (!openClaw) {
        return labels.unavailableAction
    }
    if (launchState === "opening") {
        return labels.opening
    }
    return launchState === "expired" ? labels.openAgain : labels.manage
}

/**
 * Everything one capability card says, resolved before any of it is drawn.
 *
 * It is assembled here rather than inline in the render callback so that each decision is a
 * statement a reader can check on its own, and so the callback below is left doing one thing:
 * handing settled copy to the card.
 *
 * @param app - The capability the card is drawn for.
 * @param labels - Resolved copy.
 * @param launchState - How far the OpenClaw launch has got.
 * @param openClawLaunchHref - Where the OpenClaw action points.
 * @returns The card's settled data.
 */
const cardDataFor = (
    app: AgentWorkspaceAppCapability,
    labels: ApplicationLabels,
    launchState: LaunchState,
    openClawLaunchHref: string,
): StatusActionCardData => {
    const openClaw = app.app === "OPENCLAW"
    return {
        id: app.app,
        title: openClaw ? labels.openclaw : labels.n8n,
        description: openClaw ? labels.openclawDescription : labels.n8nDescription,
        statusLabel: app.available ? labels.available : labels.unavailable,
        statusTone: app.available ? "success" : "warning",
        actionLabel: actionLabelFor(labels, launchState, openClaw),
        disabled: !openClaw || !app.available || launchState === "opening",
        actionHref: openClaw ? openClawLaunchHref : undefined,
        actionTarget: openClaw ? "_blank" : undefined,
        detail: detailFor(app, labels, launchState, openClaw),
    }
}

/** Render application capability only; no credential or one-time code enters this boundary. */
export const AgentOSWorkspaceApplications = ({ apps, labels, launchState, openClawLaunchHref, onManageOpenClaw }: AgentOSWorkspaceApplicationsProps) => (
    <SurfaceCard
        props={{ label: labels.section }}
        contract="status-action-card-grid"
        render={defineContractComponent("status-action-card-grid", {
            item: apps.map((app) => defineCompositeComponent("status-action-card", {}, () => (
                <StatusActionCard
                    key={app.app}
                    props={cardDataFor(app, labels, launchState, openClawLaunchHref)}
                    on={{ press: app.app === "OPENCLAW" ? onManageOpenClaw : undefined }}
                />
            ))),
        })}
    />
)

/** Source-level tier marker for the pure applications block. */
export const meta = { shape: "block", world: "pure" } as const
