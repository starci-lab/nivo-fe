import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AgentOSWorkspacePage } from "@/features/pages/AgentOSWorkspacePage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.agentosWorkspace")
    return {
        title: t("title"),
        description: t("description"),
    }
}

/** Dynamic identity supplied by the locale-aware workspace route. */
type AgentOSWorkspaceRouteProps = { readonly params: Promise<{ readonly workspaceId: string }> }

/** Mount one exact owner-scoped AgentOS workspace control center. */
const Page = async ({ params }: AgentOSWorkspaceRouteProps) => {
    const { workspaceId } = await params
    return <AgentOSWorkspacePage workspaceId={workspaceId} />
}

export default Page
