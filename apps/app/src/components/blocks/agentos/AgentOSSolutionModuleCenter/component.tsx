import {
    ChoiceTabs,
    StatusActionCard,
    SurfaceCard,
    Text,
    defineCompositeComponent,
    defineContractComponent,
    defineLeafComponent,
    type BadgeTone,
} from "@nivo/ui"
import { EmptyNotice } from "@nivo/ui/composites/EmptyNotice"

/** One resolved catalog or installation card visible in the module center. */
export type AgentOSSolutionModuleCard = {
    readonly id: string
    readonly title: string
    readonly description: string
    readonly statusLabel: string
    readonly statusTone: BadgeTone
    readonly detail?: string
    readonly actionLabel: string
    readonly disabled?: boolean
    readonly actionHref?: string
}

/** Closed pure state for the solution-module catalog and installation fleet. */
export type AgentOSSolutionModuleCenterViewProps = {
    readonly state: "resting" | "refused" | "answered"
    readonly mode: "catalog" | "installed"
    readonly sectionLabel: string
    readonly modesLabel: string
    readonly modes: ReadonlyArray<{ readonly id: "catalog" | "installed"; readonly label: string }>
    readonly refusedLabel: string
    readonly emptyLabel: string
    readonly emptyActionLabel: string
    readonly cards: ReadonlyArray<AgentOSSolutionModuleCard>
    readonly pendingId?: string
    readonly outcome?: string
    readonly onSelectMode: (mode: "catalog" | "installed") => void
    readonly onPressCard: (id: string) => void
}

const loadingCards: ReadonlyArray<AgentOSSolutionModuleCard> = ["module-loading-1", "module-loading-2"].map((id) => ({
    id, title: "", description: "", statusLabel: "", statusTone: "neutral", actionLabel: "",
}))

/** Render the selected solution mode from already-resolved card projections. */
export const _AgentOSSolutionModuleCenter = ({ state, mode, sectionLabel, modesLabel, modes, refusedLabel, emptyLabel, emptyActionLabel, cards, pendingId, outcome, onSelectMode, onPressCard }: AgentOSSolutionModuleCenterViewProps) => (
    <>
        <ChoiceTabs props={{ label: modesLabel, selectedKey: mode, tabs: modes }} on={{ select: (key) => onSelectMode(key as "catalog" | "installed") }} />
        {state === "refused" ? (
            <SurfaceCard
                props={{ label: sectionLabel }}
                contract="body-with-refusal-note"
                render={defineContractComponent("body-with-refusal-note", {
                    note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: refusedLabel, size: "sm", tone: "muted" }} />),
                })}
            />
        ) : state === "answered" && cards.length === 0 ? (
            <EmptyNotice props={{ message: emptyLabel, actionLabel: emptyActionLabel }} on={{ act: () => onSelectMode("catalog") }} />
        ) : (
            <SurfaceCard
                props={{ label: sectionLabel, isFrameless: true }}
                contract="status-action-card-grid"
                render={defineContractComponent("status-action-card-grid", {
                    item: (state === "resting" ? loadingCards : cards).map((card) => defineCompositeComponent("status-action-card", {}, () => (
                        <StatusActionCard
                            key={card.id}
                            props={{ ...card, isPending: pendingId === card.id, disabled: card.disabled === true || pendingId !== undefined, actionTarget: card.actionHref === undefined ? undefined : "_self" }}
                            on={{ press: () => onPressCard(card.id) }}
                            isLoading={state === "resting"}
                        />
                    ))),
                })}
            />
        )}
        {outcome === undefined ? null : <Text props={{ content: outcome, size: "sm", tone: "muted", live: "polite" }} />}
    </>
)

/** Source-level tier marker for the pure solution-module center. */
export const meta = { shape: "block", world: "pure" } as const
