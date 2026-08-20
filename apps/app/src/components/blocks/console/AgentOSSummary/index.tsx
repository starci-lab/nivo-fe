import { StatusActionCard, SurfaceCard, defineCompositeComponent, defineContractComponent } from "@nivo/ui"
import type { BadgeTone } from "@nivo/ui"
import { EmptyNotice } from "@nivo/ui/composites/EmptyNotice"

/** AgentOS workspace capability already resolved for display. */
export type AgentOSSummaryWorkspace = {
    readonly id: string
    readonly name: string
    readonly description: string
    readonly statusLabel: string
    readonly statusTone: BadgeTone
    readonly actionLabel: string
    readonly actionHref?: string
    readonly detail?: string
}

/** Settled situation drawn by the AgentOS summary. */
export type AgentOSSummaryState =
    | { readonly phase: "pending" }
    | { readonly phase: "empty", readonly message: string }
    | { readonly phase: "populated", readonly workspace: AgentOSSummaryWorkspace }
    | { readonly phase: "partial", readonly workspace: AgentOSSummaryWorkspace }
    | { readonly phase: "forbidden", readonly workspace: AgentOSSummaryWorkspace }

/** Business data, resolved copy, and safe route action consumed by the AgentOS summary. */
export type AgentOSSummaryProps = {
    readonly label: string
    readonly state: AgentOSSummaryState
    readonly onOpenService: (id: string) => void
}

/** Draw one owner-scoped AgentOS capability without requesting or resolving external state. */
export const AgentOSSummary = ({ label, state, onOpenService }: AgentOSSummaryProps) => {
    if (state.phase === "empty") {
        return (
            <SurfaceCard props={{ label }} contract="centred-empty-notice" render={defineContractComponent("centred-empty-notice", {
                notice: defineCompositeComponent("empty-notice", {}, () => <EmptyNotice props={{ message: state.message }} />),
            })} />
        )
    }
    const workspace = state.phase === "pending" ? undefined : state.workspace
    return (
        <SurfaceCard
            props={{ label }}
            contract="status-action-card-grid"
            render={defineContractComponent("status-action-card-grid", {
                item: [defineCompositeComponent("status-action-card", {}, () => (
                    <StatusActionCard
                        props={{
                            id: workspace?.id ?? "pending",
                            title: workspace?.name ?? "",
                            description: workspace?.description ?? "",
                            statusLabel: workspace?.statusLabel ?? "",
                            statusTone: workspace?.statusTone ?? "neutral",
                            actionLabel: workspace?.actionLabel ?? "",
                            actionHref: workspace?.actionHref,
                            detail: workspace?.detail,
                        }}
                        on={{ press: workspace === undefined ? undefined : () => onOpenService(workspace.id) }}
                        isLoading={workspace === undefined}
                    />
                ))],
            })}
            isLoading={workspace === undefined}
        />
    )
}

/** Source-level tier marker for the pure AgentOS summary block. */
export const meta = { shape: "block", world: "pure" } as const
