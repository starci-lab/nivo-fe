import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AgentOSWorkspaceCheckoutPage } from "@/features/pages/AgentOSWorkspaceCheckoutPage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const metadata = await getTranslations("metadata.agentosWorkspaceCheckout")
    const page = await getTranslations("console.agentos.checkoutReview")
    return {
        title: metadata("title"),
        description: page("description"),
    }
}

/** Mount the checkout-review page feature. */
const Page = () => <AgentOSWorkspaceCheckoutPage />

export default Page
