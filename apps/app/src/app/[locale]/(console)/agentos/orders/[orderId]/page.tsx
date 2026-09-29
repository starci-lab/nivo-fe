import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AgentOSPage } from "@/features/pages/AgentOSPage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.agentosOrder")
    return {
        title: t("title"),
        description: t("description"),
    }
}

/** Dynamic route values for resuming one AgentOS order. */
type AgentOSOrderRouteProps = { readonly params: Promise<{ readonly orderId: string }> }

/** Mount the AgentOS product surface for one existing order. */
const Page = async ({ params }: AgentOSOrderRouteProps) => {
    const { orderId } = await params
    return <AgentOSPage mode="resume" orderId={orderId} />
}

export default Page
