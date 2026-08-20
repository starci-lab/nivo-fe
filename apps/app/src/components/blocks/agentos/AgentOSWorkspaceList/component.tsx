import {
    Badge,
    SurfaceCard,
    Text,
    TextLink,
    Tree,
    defineCompositeComponent,
    defineContractComponent,
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

/** Every settled state of the independent AgentOS workspace list. */
export type AgentOSWorkspaceListViewProps =
    | { readonly state: "resting"; readonly props: { readonly label: string } }
    | { readonly state: "empty"; readonly props: { readonly label: string; readonly message: string } }
    | { readonly state: "refused"; readonly props: { readonly label: string; readonly message: string } }
    | { readonly state: "answered"; readonly props: { readonly label: string; readonly rows: ReadonlyArray<AgentOSWorkspaceView> }; readonly on: { readonly openWorkspace: (id: string) => void } }

/** Draw the workspace list independently from the creation flow below it. */
export const AgentOSWorkspaceListBase = (view: AgentOSWorkspaceListViewProps) => {
    const { state, props } = view
    if (state === "empty" || state === "refused") {
        return (
            <SurfaceCard
                props={{ label: props.label }}
                contract="centred-empty-notice"
                render={defineContractComponent("centred-empty-notice", {
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice props={{ message: props.message }} />
                    )),
                })}
            />
        )
    }
    const rows = state === "answered" ? props.rows : []
    const workspaceRow = (row: AgentOSWorkspaceView, isLoading = false) => defineCompositeComponent("fleet-row", {}, () => (
        <Tree
            contract="responsive-identity-kind-status-action-row"
            render={defineContractComponent("responsive-identity-kind-status-action-row", {
                identity: defineContractComponent("name-over-handle", {
                    name: defineLeafComponent("text-link", { size: "sm" }, () => (
                        <TextLink
                            props={{ label: row.name, size: "sm" }}
                            on={{ press: state === "answered" ? () => view.on.openWorkspace(row.id) : undefined }}
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
    return (
        <SurfaceCard
            props={{ label: props.label }}
            contract="fleet-resource-list"
            render={defineContractComponent("fleet-resource-list", {
                resource: state === "resting"
                    ? [workspaceRow({ id: "agentos-resting", name: "", detail: "", kindLabel: "", status: "provisioning", statusLabel: "" }, true)]
                    : rows.map((row) => workspaceRow(row)),
            })}
            isLoading={state === "resting"}
        />
    )
}

/** Source-level tier marker for the pure block half. */
export const meta = { shape: "block", world: "pure" } as const
