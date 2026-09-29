import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AgentOSWorkspaceNewPage } from "@/features/pages/AgentOSWorkspaceNewPage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.agentosWorkspaceNew")
    return {
        title: t("title"),
        description: t("description"),
    }
}

/** Mount the offer-selection surface of the workspace purchase flow. */
const Page = () => <AgentOSWorkspaceNewPage />

export default Page
