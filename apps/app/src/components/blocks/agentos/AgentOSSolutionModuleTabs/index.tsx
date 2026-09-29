import { ChoiceTabs, IconSource, StatusActionCard } from "@nivo/ui"
import { EmptyNotice, Icon, SurfaceCard, Text } from "@starci/grammar/common"
import type {
    AgentOSSolutionModuleCenterProps,
    AgentOSSolutionModuleCenterViewProps,
} from "@/modules/agentos/solution-module-center"
import { SOLUTION_TABS_CARD_LIST_CLASS_NAME } from "./classNames"

/** Settled tab view plus the two controls owned by its connected parent. */
export type AgentOSSolutionModuleTabsProps = {
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
                        <StatusActionCard
                            key={card.id}
                            props={{
                                ...card,
                                isPending: view.pendingId === card.id,
                                disabled: card.disabled === true || view.pendingId !== undefined,
                                actionTarget: card.actionHref === undefined ? undefined : "_self",
                            }}
                            on={{ press: () => on.onPressCard(card.id) }}
                            isLoading={view.state === "resting"}
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
                on={{ select: (key) => on.onSelectMode(key as "catalog" | "installed") }}
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
