import {
    Badge,
    SurfaceCard,
    Text,
    TextLink,
    TileIcon,
    Tree,
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type BadgeTone,
} from "@nivo/ui"
import { EmptyNotice } from "@nivo/ui/composites/EmptyNotice"
import type { FleetStatus } from "@/components/blocks/provisioning/FleetRow"

const STATUS_TONE: Readonly<Record<FleetStatus, BadgeTone>> = {
    not_provisioned: "neutral",
    provisioning: "accent",
    awaiting_dns: "warning",
    ready: "success",
    failed: "danger",
    active: "success",
    suspended: "neutral",
}

/** One resolved AgentOS management row. */
export type AgentOSWorkspaceView = {
    readonly id: string
    readonly name: string
    readonly detail: string
    readonly kindLabel: string
    readonly status: FleetStatus
    readonly statusLabel: string
}

/** Copy for the three measured dashboard signals. */
export type AgentOSWorkspaceSummaryLabels = {
    readonly workspaces: string
    readonly workspacesCaption: string
    readonly running: string
    readonly runningCaption: string
    readonly attention: string
    readonly attentionCaption: string
}

type AgentOSWorkspaceListCommonProps = {
    readonly label: string
    readonly summary?: AgentOSWorkspaceSummaryLabels
}

/** Every settled state of the independently connected AgentOS workspace list. */
export type AgentOSWorkspaceListViewProps =
    | { readonly state: "resting"; readonly props: AgentOSWorkspaceListCommonProps }
    | { readonly state: "empty"; readonly props: AgentOSWorkspaceListCommonProps & { readonly message: string; readonly actionLabel: string }; readonly on: { readonly create: () => void } }
    | { readonly state: "refused"; readonly props: AgentOSWorkspaceListCommonProps & { readonly message: string } }
    | { readonly state: "answered"; readonly props: AgentOSWorkspaceListCommonProps & { readonly rows: ReadonlyArray<AgentOSWorkspaceView> }; readonly on: { readonly openWorkspace: (id: string) => void } }

const workspaceRow = (row: AgentOSWorkspaceView, isLoading: boolean, openWorkspace?: (id: string) => void) => defineCompositeComponent("fleet-row", {}, () => (
    <Tree
        contract="responsive-identity-kind-status-action-row"
        render={defineContractComponent("responsive-identity-kind-status-action-row", {
            identity: defineContractComponent("name-over-handle", {
                name: defineLeafComponent("text-link", { size: "sm" }, () => (
                    <TextLink
                        props={{ label: row.name, size: "sm" }}
                        on={{ press: openWorkspace === undefined ? undefined : () => openWorkspace(row.id) }}
                    />
                )),
                handle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: row.detail, size: "xs", tone: "muted" }} isLoading={isLoading} />
                )),
            }),
            kind: defineLeafComponent("badge", { tone: "neutral" }, () => (
                <Badge props={{ content: row.kindLabel, tone: "neutral" }} isLoading={isLoading} />
            )),
            status: defineLeafComponent("badge", {}, () => (
                <Badge props={{ content: row.statusLabel, tone: STATUS_TONE[row.status] }} isLoading={isLoading} />
            )),
        })}
    />
))

/** Draw the workspace collection without owning its query or dashboard route. */
export const AgentOSWorkspaceListBase = (view: AgentOSWorkspaceListViewProps) => {
    const { state, props } = view
    const rows = state === "answered" ? props.rows : []
    const isLoading = state === "resting"
    const isRefused = state === "refused"
    const summaryLabels = props.summary ?? {
        workspaces: props.label,
        workspacesCaption: "",
        running: props.label,
        runningCaption: "",
        attention: props.label,
        attentionCaption: "",
    }
    const runningCount = rows.filter((row) => row.status === "ready" || row.status === "active").length
    const attentionCount = rows.filter((row) => row.status === "failed" || row.status === "suspended" || row.status === "awaiting_dns").length
    const totals = [
        { id: "workspaces", icon: "agentos" as const, label: summaryLabels.workspaces, value: rows.length, caption: summaryLabels.workspacesCaption, signal: "none" as const },
        { id: "running", icon: "complete" as const, label: summaryLabels.running, value: runningCount, caption: summaryLabels.runningCaption, signal: "active" as const },
        { id: "attention", icon: "notification" as const, label: summaryLabels.attention, value: attentionCount, caption: summaryLabels.attentionCaption, signal: attentionCount > 0 ? "attention" as const : "none" as const },
    ]
    const summary = (
        <Tree
            contract="agentos-summary-grid"
            render={defineContractComponent("agentos-summary-grid", {
                signal: totals.map((total) => defineContractProjection("agentos-summary-card", () => (
                    <SurfaceCard
                        contract="agentos-summary-card"
                        render={defineContractComponent("agentos-summary-card", {
                            heading: defineContractComponent("agentos-summary-heading", {
                                mark: defineLeafComponent("tile-icon", {}, () => (
                                    <TileIcon props={{ icon: total.icon, signal: total.signal }} isLoading={isLoading} />
                                )),
                                label: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                                    <Text props={{ content: total.label, size: "sm", weight: "medium" }} />
                                )),
                            }),
                            value: defineLeafComponent("text", { size: "metric-lead" }, () => (
                                <Text props={{ content: isRefused ? "—" : String(total.value), size: "metric-lead", weight: "semibold" }} isLoading={isLoading} />
                            )),
                            caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                                <Text props={{ content: total.caption, size: "xs", tone: "muted" }} />
                            )),
                        })}
                        isLoading={isLoading}
                    />
                ))),
            })}
        />
    )
    const collection = (() => {
    if (state === "empty" || state === "refused") {
        return (
            <SurfaceCard
                props={{ label: props.label }}
                contract="centred-empty-notice"
                render={defineContractComponent("centred-empty-notice", {
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice
                            props={{
                                message: props.message,
                                actionLabel: state === "empty" ? props.actionLabel : undefined,
                            }}
                            on={{ act: state === "empty" ? view.on.create : undefined }}
                        />
                    )),
                })}
            />
        )
    }
    const openWorkspace = state === "answered" ? view.on.openWorkspace : undefined
    return (
        <SurfaceCard
            props={{ label: props.label }}
            contract="fleet-resource-list"
            render={defineContractComponent("fleet-resource-list", {
                resource: state === "resting"
                    ? [workspaceRow({ id: "agentos-resting", name: "", detail: "", kindLabel: "", status: "provisioning", statusLabel: "" }, true)]
                    : rows.map((row) => workspaceRow(row, false, openWorkspace)),
            })}
            isLoading={state === "resting"}
        />
    )
    })()
    return (
        <Tree
            contract="agentos-dashboard-body"
            render={defineContractComponent("agentos-dashboard-body", {
                summary: defineContractProjection("agentos-summary-grid", () => summary),
                collection: defineContractProjection("label-row-over-card", () => collection),
            })}
        />
    )
}

/** Source-level tier marker for the pure block half. */
export const meta = { shape: "block", world: "pure" } as const
