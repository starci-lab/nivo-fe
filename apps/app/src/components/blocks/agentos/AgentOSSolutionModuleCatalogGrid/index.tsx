import { StatusActionCard } from "@nivo/ui"
import type { AgentOSSolutionModuleCard } from "../../../../modules/agentos/solution-module-center"
import { SOLUTION_CATALOG_GRID_CLASS_NAME } from "./classNames"

export type AgentOSSolutionModuleCatalogGridProps = {
    readonly cards: ReadonlyArray<AgentOSSolutionModuleCard>
    readonly loading: boolean
    readonly pendingId?: string
    readonly onPressCard: (id: string) => void
}

const loadingCards: ReadonlyArray<AgentOSSolutionModuleCard> = ["module-loading-1", "module-loading-2"].map((id) => ({
    id,
    title: "",
    description: "",
    statusLabel: "",
    statusTone: "neutral",
    actionLabel: "",
}))

/** Draw the catalogue cards and their loading placeholders. */
export const AgentOSSolutionModuleCatalogGrid = ({
    cards,
    loading,
    pendingId,
    onPressCard,
}: AgentOSSolutionModuleCatalogGridProps) => (
    <div className={SOLUTION_CATALOG_GRID_CLASS_NAME} data-contract="GAP-4">
        {(loading ? loadingCards : cards).map((card) => (
            <StatusActionCard
                key={card.id}
                props={{
                    ...card,
                    isPending: pendingId === card.id,
                    disabled: card.disabled === true || pendingId !== undefined,
                    actionTarget: card.actionHref === undefined ? undefined : "_self",
                }}
                on={{ press: () => onPressCard(card.id) }}
                isLoading={loading}
            />
        ))}
    </div>
)
