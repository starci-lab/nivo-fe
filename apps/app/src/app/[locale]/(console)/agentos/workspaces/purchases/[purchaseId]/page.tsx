import { AgentOSWorkspacePurchasePage } from "@/features/pages/AgentOSWorkspacePurchasePage"

/** Payment and provisioning status must be read from the authoritative owner-scoped snapshot. */
export const dynamic = "force-dynamic"

/** Dynamic route values for resuming one purchase-bound status surface. */
type AgentOSWorkspacePurchaseRouteProps = { readonly params: Promise<{ readonly purchaseId: string }> }

/** Mount the purchase-status page feature. */
const Page = (props: AgentOSWorkspacePurchaseRouteProps) => <AgentOSWorkspacePurchasePage params={props.params} />

export default Page
