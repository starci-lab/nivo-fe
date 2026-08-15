import { ApplicationLaunchCard, SurfaceCard, defineCompositeComponent, defineContractComponent } from "@nivo/ui"
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
    }
    readonly onManageOpenClaw: () => void
}

/** Render application capability only; no credential or one-time code enters this boundary. */
export const AgentOSWorkspaceApplications = ({ apps, labels, onManageOpenClaw }: AgentOSWorkspaceApplicationsProps) => (
    <SurfaceCard
        props={{ label: labels.section }}
        contract="application-launch-grid"
        render={defineContractComponent("application-launch-grid", {
            application: apps.map((app) => defineCompositeComponent("application-launch-card", {}, () => {
                const openClaw = app.app === "OPENCLAW"
                return (
                    <ApplicationLaunchCard
                        key={app.app}
                        props={{
                            id: app.app,
                            title: openClaw ? labels.openclaw : labels.n8n,
                            description: openClaw ? labels.openclawDescription : labels.n8nDescription,
                            statusLabel: app.available ? labels.available : labels.unavailable,
                            statusTone: app.available ? "success" : "warning",
                            actionLabel: openClaw ? labels.manage : labels.unavailableAction,
                            disabled: !openClaw || !app.available,
                            detail: app.reason ?? app.observedVersion ?? undefined,
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
