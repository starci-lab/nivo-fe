import OfferSelectionFlow from "@/components/blocks/agentos/OfferSelectionFlow"

/** Current eligible offers and purchaser admission are owner-scoped live data. */
export const dynamic = "force-dynamic"

/** Mount the offer-selection surface of the workspace purchase flow. */
const AgentOSWorkspaceNewRoute = () => <OfferSelectionFlow />

export default AgentOSWorkspaceNewRoute
