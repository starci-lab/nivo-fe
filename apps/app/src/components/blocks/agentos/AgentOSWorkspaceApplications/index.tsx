import { StatusActionCard, SurfaceCard, defineCompositeComponent, defineContractComponent } from "@nivo/ui"
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
        readonly blocked: string
        readonly expired: string
        readonly disconnected: string
    }
    readonly launchState: "idle" | "opening" | "connected" | "blocked" | "expired" | "disconnected"
    readonly openClawLaunchHref: string
    readonly onManageOpenClaw: () => void
}

/** Render application capability only; no credential or one-time code enters this boundary. */
export const AgentOSWorkspaceApplications = ({ apps, labels, launchState, openClawLaunchHref, onManageOpenClaw }: AgentOSWorkspaceApplicationsProps) => (
    <SurfaceCard
        props={{ label: labels.section }}
        contract="status-action-card-grid"
        render={defineContractComponent("status-action-card-grid", {
            item: apps.map((app) => defineCompositeComponent("status-action-card", {}, () => {
                const openClaw = app.app === "OPENCLAW"
                return (
                    <StatusActionCard
                        key={app.app}
                        props={{
                            id: app.app,
                            title: openClaw ? labels.openclaw : labels.n8n,
                            description: openClaw ? labels.openclawDescription : labels.n8nDescription,
                            statusLabel: app.available ? labels.available : labels.unavailable,
                            statusTone: app.available ? "success" : "warning",
                            actionLabel: openClaw && launchState === "opening" ? labels.opening : openClaw ? labels.manage : labels.unavailableAction,
                            disabled: !openClaw || !app.available || launchState === "opening",
                            actionHref: openClaw ? openClawLaunchHref : undefined,
                            actionTarget: openClaw ? "_blank" : undefined,
                            detail: app.reason === "SECURITY_UPGRADE_REQUIRED"
                                ? labels.securityUpgradeRequired
                                : openClaw && launchState === "blocked"
                                    ? labels.blocked
                                    : openClaw && launchState === "expired"
                                        ? labels.expired
                                        : openClaw && launchState === "disconnected"
                                            ? labels.disconnected
                                : app.available
                                    ? app.observedVersion ?? undefined
                                    : labels.unavailableDetail,
                        }}
                        on={{ press: openClaw ? onManageOpenClaw : undefined }}
                    />
                )
            })),
        })}
    />
)

/** Source-level tier marker for the pure applications block. */
export const meta = { shape: "block", world: "pure" } as const
