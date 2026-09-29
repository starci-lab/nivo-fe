import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AgentOSModuleCreatePage } from "@/features/pages/AgentOSModuleCreatePage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.agentosModuleCreate")
    return {
        title: t("title"),
        description: t("description"),
    }
}

/** Route identity supplied by the workspace modules segment. */
type AgentOSModuleCreateRouteProps = { readonly params: Promise<{ readonly workspaceId: string }> }

/** Mount the module-create page feature with its resolved workspace. */
const Page = async ({ params }: AgentOSModuleCreateRouteProps) => {
    const { workspaceId } = await params
    return <AgentOSModuleCreatePage workspaceId={workspaceId} />
}

export default Page
