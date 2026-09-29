import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AgentOSWorkspacePurchaseProvisioningPage } from "@/features/pages/AgentOSWorkspacePurchaseProvisioningPage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.agentosPurchaseProvisioning")
    return {
        title: t("title"),
        description: t("description"),
    }
}

/** Dynamic route values for resuming one purchase-bound provisioning surface. */
type AgentOSWorkspacePurchaseProvisioningRouteProps = { readonly params: Promise<{ readonly purchaseId: string }> }

/** Mount the declared provisioning surface of one purchase identity. */
const Page = (props: AgentOSWorkspacePurchaseProvisioningRouteProps) => (
    <AgentOSWorkspacePurchaseProvisioningPage params={props.params} />
)

export default Page
