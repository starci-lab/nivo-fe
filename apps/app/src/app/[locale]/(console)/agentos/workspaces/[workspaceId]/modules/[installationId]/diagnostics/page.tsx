import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AgentOSSolutionModulePage } from "@/features/pages/AgentOSSolutionModulePage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.agentosModuleDiagnostics")
    return {
        title: t("title"),
        description: t("description"),
    }
}

/** Dynamic route identities for one exact AgentOS module installation. */
type AgentOSSolutionModuleRouteProps = {
    readonly params: Promise<{ readonly workspaceId: string; readonly installationId: string }>
}

/** Mount the installation's diagnostics surface. */
const Page = async ({ params }: AgentOSSolutionModuleRouteProps) => {
    const { workspaceId, installationId } = await params
    return <AgentOSSolutionModulePage workspaceId={workspaceId} installationId={installationId} view="diagnostics" />
}

export default Page
