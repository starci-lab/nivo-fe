import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AgentOSOpenClawLaunchBridge } from "@/features/pages/AgentOSOpenClawLaunchBridge"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.openclawLaunch")
    return {
        title: t("title"),
        description: t("description"),
    }
}

/** Dynamic identity supplied by the native OpenClaw launch bridge route. */
type AgentOSOpenClawLaunchRouteProps = { readonly params: Promise<{ readonly workspaceId: string }> }

/** Mount the credential-free bridge in the browser-created tab. */
const Page = async ({ params }: AgentOSOpenClawLaunchRouteProps) => {
    const { workspaceId } = await params
    return <AgentOSOpenClawLaunchBridge workspaceId={workspaceId} />
}

export default Page
