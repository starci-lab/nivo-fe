import { redirect } from "next/navigation"

type AgentOSCreateRouteProps = {
    readonly params: Promise<{ readonly locale: string }>
}

/** Preserve old bookmarks while keeping `/agentos/workspaces/new` canonical. */
const AgentOSCreateRoute = async ({ params }: AgentOSCreateRouteProps) => {
    const { locale } = await params
    const localeSegment = locale === "vi" ? "" : `/${locale}`
    redirect(`${localeSegment}/agentos/workspaces/new`)
}

export default AgentOSCreateRoute
