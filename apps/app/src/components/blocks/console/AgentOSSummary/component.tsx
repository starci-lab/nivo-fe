import { StatusActionCard, SurfaceCard, defineCompositeComponent, defineContractComponent } from "@nivo/ui"
import type { BadgeTone } from "@nivo/ui"
import { EmptyNotice } from "@nivo/ui/composites/EmptyNotice"

/** One workspace row prepared for the pure AgentOS summary surface. */
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
/** Settled states the AgentOS summary can render independently. */
export type AgentOSSummaryState =
    | { readonly phase: "pending" }
    | { readonly phase: "empty", readonly message: string }
    | { readonly phase: "populated", readonly workspace: AgentOSSummaryWorkspace }
    | { readonly phase: "partial", readonly workspace: AgentOSSummaryWorkspace }
    | { readonly phase: "forbidden", readonly workspace: AgentOSSummaryWorkspace }
/** Pure AgentOS summary input and its legal workspace command. */
export type AgentOSSummaryProps = { readonly label: string, readonly state: AgentOSSummaryState, readonly onOpenService: (id: string) => void }

/** Draw one owner-scoped workspace and its independently answered runtime. */
export const AgentOSSummaryBase = ({ label, state, onOpenService }: AgentOSSummaryProps) => {
    if (state.phase === "empty") return <SurfaceCard props={{ label }} contract="centred-empty-notice" render={defineContractComponent("centred-empty-notice", {
        notice: defineCompositeComponent("empty-notice", {}, () => <EmptyNotice props={{ message: state.message }} />),
    })} />
    const workspace = state.phase === "pending" ? undefined : state.workspace
    return <SurfaceCard
        props={{ label }}
        contract="status-action-card-grid"
        render={defineContractComponent("status-action-card-grid", {
            item: [defineCompositeComponent("status-action-card", {}, () => <StatusActionCard
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
            />)],
        })}
        isLoading={workspace === undefined}
    />
}

/** Registry identity for the pure AgentOS summary twin. */
export const meta = { shape: "block", world: "pure" } as const
