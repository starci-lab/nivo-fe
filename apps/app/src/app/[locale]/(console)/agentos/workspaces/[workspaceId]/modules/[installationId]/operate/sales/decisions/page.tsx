import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { SalesDecisionBlock } from "@/features/pages/agentos"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.agentosModuleSalesDecisions")
    return {
        title: t("title"),
        description: t("description"),
    }
}

/** Dynamic route identities for one exact AgentOS module installation. */
type AgentOSSolutionModuleRouteProps = {
    readonly params: Promise<{ readonly workspaceId: string; readonly installationId: string }>
}

/** The decision surface's own route: it mounts the surface for the installation the route names. */
const Page = async ({ params }: AgentOSSolutionModuleRouteProps) => {
    const { workspaceId, installationId } = await params
    return <SalesDecisionBlock workspaceId={workspaceId} installationId={installationId} />
}

export default Page
