import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AgentOSWorkspaceCheckoutPage } from "@/features/pages/AgentOSWorkspaceCheckoutPage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.agentosWorkspaceCheckout")
    return {
        title: t("title"),
        description: t("description"),
    }
}

/** Mount the checkout-review page feature. */
const Page = () => <AgentOSWorkspaceCheckoutPage />

export default Page
