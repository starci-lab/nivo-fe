import {
    SurfaceCard,
    defineCompositeComponent,
    defineContractComponent,
} from "@nivo/ui"
import { EmptyNotice } from "@nivo/ui/composites/EmptyNotice"
import { FleetRow, type FleetStatus } from "@/components/blocks/provisioning/FleetRow"

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
export const _AgentOSWorkspaceList = (view: AgentOSWorkspaceListViewProps) => {
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
    return (
        <SurfaceCard
            props={{ label: props.label }}
            contract="fleet-resource-list"
            render={defineContractComponent("fleet-resource-list", {
                resource: state === "resting"
                    ? [defineCompositeComponent("fleet-row", {}, () => (
                        <FleetRow props={{ id: "agentos-resting", kind: "workspace", kindLabel: "", status: "provisioning" }} isLoading />
                    ))]
                    : rows.map((row) => defineCompositeComponent("fleet-row", {}, () => (
                        <FleetRow props={{ ...row, kind: "workspace" }} on={{ open: () => view.on.openWorkspace(row.id) }} />
                    ))),
            })}
            isLoading={state === "resting"}
        />
    )
}

/** Source-level tier marker for the pure block half. */
export const meta = { shape: "block", world: "pure" } as const
