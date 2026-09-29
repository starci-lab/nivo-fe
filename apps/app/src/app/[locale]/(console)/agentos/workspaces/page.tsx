import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AgentOSWorkspacesPage } from "@/features/pages/AgentOSWorkspacesPage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.agentosWorkspaces")
    return {
        title: t("title"),
        description: t("description"),
    }
}

/** Route identity supplied by the locale-aware workspaces segment. */
type AgentOSWorkspacesRouteProps = { readonly params: Promise<{ readonly locale: string }> }

/** Mount the workspaces page feature. */
const Page = ({ params }: AgentOSWorkspacesRouteProps) => <AgentOSWorkspacesPage params={params} />

export default Page
