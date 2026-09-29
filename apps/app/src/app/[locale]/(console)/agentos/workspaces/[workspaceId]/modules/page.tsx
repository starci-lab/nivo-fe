import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AgentOSModuleCollectionPage } from "@/features/pages/AgentOSModuleCollectionPage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.agentosModules")
    return {
        title: t("title"),
        description: t("description"),
    }
}

type AgentOSModulesRouteProps = { readonly params: Promise<{ readonly workspaceId: string }> }

const Page = async ({ params }: AgentOSModulesRouteProps) => {
    const { workspaceId } = await params
    return <AgentOSModuleCollectionPage workspaceId={workspaceId} />
}

export default Page
