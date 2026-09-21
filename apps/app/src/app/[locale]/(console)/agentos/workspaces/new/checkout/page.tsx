import CheckoutReviewFlow from "@/components/blocks/agentos/CheckoutReviewFlow"

/** The frozen offer, purchaser admission and stable purchase identity are owner-scoped live data. */
export const dynamic = "force-dynamic"

/** Mount the checkout-review surface of the workspace purchase flow. */
const AgentOSWorkspaceCheckoutRoute = () => <CheckoutReviewFlow />

export default AgentOSWorkspaceCheckoutRoute
