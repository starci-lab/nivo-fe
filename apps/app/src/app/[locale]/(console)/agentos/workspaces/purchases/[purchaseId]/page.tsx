import PurchaseStatusFlow from "@/components/blocks/agentos/PurchaseStatusFlow"

/** Payment and provisioning status must be read from the authoritative owner-scoped snapshot. */
export const dynamic = "force-dynamic"

/** Dynamic route values for resuming one purchase-bound status surface. */
type AgentOSWorkspacePurchaseRouteProps = { readonly params: Promise<{ readonly purchaseId: string }> }

/** Mount the payment-pending and provisioning states of one purchase identity. */
const AgentOSWorkspacePurchaseRoute = async ({ params }: AgentOSWorkspacePurchaseRouteProps) => {
    const { purchaseId } = await params
    return <PurchaseStatusFlow purchaseId={purchaseId} />
}

export default AgentOSWorkspacePurchaseRoute
