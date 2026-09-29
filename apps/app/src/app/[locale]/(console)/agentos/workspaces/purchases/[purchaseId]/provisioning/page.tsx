import { AgentOSWorkspacePurchaseProvisioningPage } from "@/features/pages/AgentOSWorkspacePurchaseProvisioningPage"

/** Dynamic route values for resuming one purchase-bound provisioning surface. */
type AgentOSWorkspacePurchaseProvisioningRouteProps = { readonly params: Promise<{ readonly purchaseId: string }> }

/** Mount the declared provisioning surface of one purchase identity. */
const Page = (props: AgentOSWorkspacePurchaseProvisioningRouteProps) => <AgentOSWorkspacePurchaseProvisioningPage params={props.params} />

export default Page
