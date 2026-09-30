import { ChoiceTabs, IconSource, StatusActionCard } from "@nivo/ui"
import { EmptyNotice, Icon, SurfaceCard, Text } from "@starci/grammar/common"
import type {
    AgentOSSolutionModuleCenterProps,
    AgentOSSolutionModuleCenterViewProps,
} from "../../../../modules/agentos/solution-module-center"
import { SOLUTION_TABS_CARD_LIST_CLASS_NAME } from "./classNames"

/** Settled tab view plus the two controls owned by its connected parent. */
type AgentOSSolutionModuleTabsProps = {
    readonly view: AgentOSSolutionModuleCenterViewProps
    readonly on: AgentOSSolutionModuleCenterProps["on"]
}

const loadingCards: ReadonlyArray<AgentOSSolutionModuleCenterViewProps["cards"][number]> = ["module-loading-1", "module-loading-2"].map((id) => ({
    id,
    title: "",
    description: "",
    statusLabel: "",
    statusTone: "neutral" as const,
    actionLabel: "",
}))

type ModuleCardProps = {
    readonly card: AgentOSSolutionModuleCenterViewProps["cards"][number]
    readonly pendingId?: string
    readonly isLoading: boolean
    readonly onPress: (id: string) => void
}

const ModuleCard = ({ card, pendingId, isLoading, onPress }: ModuleCardProps) => (
    <StatusActionCard
        props={{
            ...card,
            isPending: pendingId === card.id,
            disabled: card.disabled === true || pendingId !== undefined,
            actionTarget: card.actionHref === undefined ? undefined : "_self",
        }}
        on={{ press: () => onPress(card.id) }}
        isLoading={isLoading}
    />
)

/** Draw the selected catalog or installation mode from settled projections. */
export const AgentOSSolutionModuleTabs = (props: AgentOSSolutionModuleTabsProps) => {
    const { view, on } = props
    const body = () => {
        if (view.state === "failed")
            return (
                <SurfaceCard label={view.sectionLabel}>
                    <div>{view.notice}</div>
                </SurfaceCard>
            )
        if (view.state === "answered" && view.cards.length === 0)
            return (
                <EmptyNotice
                    message={view.emptyLabel}
                    actionLabel={view.emptyActionLabel}
                    actionStartContent={<Icon source={IconSource("retry", "chip")} usage="chip" />}
                    onAction={() => on.onSelectMode("catalog")}
                />
            )
        return (
            <SurfaceCard label={view.sectionLabel} frame="frameless">
                <div className={SOLUTION_TABS_CARD_LIST_CLASS_NAME}>
                    {(view.state === "resting" ? loadingCards : view.cards).map((card) => (
                        <ModuleCard
                            key={card.id}
                            card={card}
                            pendingId={view.pendingId}
                            isLoading={view.state === "resting"}
                            onPress={on.onPressCard}
                        />
                    ))}
                </div>
            </SurfaceCard>
        )
    }
    return (
        <>
            <ChoiceTabs
                props={{ label: view.modesLabel, selectedKey: view.mode, tabs: view.modes }}
                on={{
                    select: (key) => {
                        const mode = view.modes.find((candidate) => candidate.id === key)
                        if (mode !== undefined) on.onSelectMode(mode.id)
                    },
                }}
            />
            {body()}
            {view.outcome === undefined ? null : (
                <Text size="sm" tone="muted" live="polite">
                    {view.outcome}
                </Text>
            )}
        </>
    )
}
