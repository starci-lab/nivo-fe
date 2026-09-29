import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AgentOSPage } from "@/features/pages/AgentOSPage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.agentos")
    return {
        title: t("title"),
        description: t("description"),
    }
}

/** Mount the dashboard that manages existing AgentOS workspaces. */
const Page = () => <AgentOSPage mode="dashboard" />

export default Page
