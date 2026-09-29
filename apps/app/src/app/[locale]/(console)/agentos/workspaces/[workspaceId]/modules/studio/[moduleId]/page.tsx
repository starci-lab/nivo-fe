import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AgentOSModuleStudioPage } from "@/features/pages/AgentOSModuleStudioPage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.agentosModuleStudio")
    return {
        title: t("title"),
        description: t("description"),
    }
}

type AgentOSModuleStudioRouteProps = {
    readonly params: Promise<{ readonly workspaceId: string; readonly moduleId: string }>
}

const Page = async ({ params }: AgentOSModuleStudioRouteProps) => {
    const { workspaceId, moduleId } = await params
    return <AgentOSModuleStudioPage workspaceId={workspaceId} moduleId={moduleId} />
}

export default Page
