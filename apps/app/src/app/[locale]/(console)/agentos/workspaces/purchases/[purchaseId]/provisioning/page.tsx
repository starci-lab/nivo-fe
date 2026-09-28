import PurchaseStatusFlow from "@/components/blocks/agentos/PurchaseStatusFlow"

/** Provisioning status must be read from the authoritative owner-scoped snapshot. */
export const dynamic = "force-dynamic"

/** Dynamic route values for resuming one purchase-bound provisioning surface. */
type AgentOSWorkspacePurchaseProvisioningRouteProps = { readonly params: Promise<{ readonly purchaseId: string }> }

/** Mount the declared provisioning surface of one purchase identity. */
const Page = async ({ params }: AgentOSWorkspacePurchaseProvisioningRouteProps) => {
    const { purchaseId } = await params
    return <PurchaseStatusFlow purchaseId={purchaseId} surface="provisioning" />
}

export default Page
