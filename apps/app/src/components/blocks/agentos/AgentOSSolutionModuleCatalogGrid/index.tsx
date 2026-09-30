import { StatusActionCard } from "@nivo/ui"
import type { AgentOSSolutionModuleCard } from "../../../../modules/agentos/solution-module-center"
import { SOLUTION_CATALOG_GRID_CLASS_NAME } from "./classNames"

/** Props for {@link AgentOSSolutionModuleCatalogGrid}. */
type AgentOSSolutionModuleCatalogGridProps = {
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

type CatalogCardProps = {
    readonly card: AgentOSSolutionModuleCard
    readonly pendingId?: string
    readonly isLoading: boolean
    readonly onPress: (id: string) => void
}

const CatalogCard = ({ card, pendingId, isLoading, onPress }: CatalogCardProps) => (
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

/** Draw the catalogue cards and their loading placeholders. */
export const AgentOSSolutionModuleCatalogGrid = (props: AgentOSSolutionModuleCatalogGridProps) => {
    const { cards, loading, pendingId, onPressCard }: AgentOSSolutionModuleCatalogGridProps = props
    return (
        <div className={SOLUTION_CATALOG_GRID_CLASS_NAME} data-contract="GAP-4">
            {(loading ? loadingCards : cards).map((card) => (
                <CatalogCard key={card.id} card={card} pendingId={pendingId} isLoading={loading} onPress={onPressCard} />
            ))}
        </div>
    )
}
