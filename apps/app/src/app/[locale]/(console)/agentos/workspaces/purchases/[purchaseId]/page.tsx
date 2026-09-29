import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AgentOSWorkspacePurchasePage } from "@/features/pages/AgentOSWorkspacePurchasePage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.agentosPurchase")
    return {
        title: t("title"),
        description: t("description"),
    }
}

/** Dynamic route values for resuming one purchase-bound status surface. */
type AgentOSWorkspacePurchaseRouteProps = { readonly params: Promise<{ readonly purchaseId: string }> }

/** Mount the purchase-status page feature. */
const Page = (props: AgentOSWorkspacePurchaseRouteProps) => <AgentOSWorkspacePurchasePage params={props.params} />

export default Page
