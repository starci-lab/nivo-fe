import { AgentOSWorkspacesPage } from "@/features/pages/AgentOSWorkspacesPage"

/** Route identity supplied by the locale-aware workspaces segment. */
type AgentOSWorkspacesRouteProps = { readonly params: Promise<{ readonly locale: string }> }

/** Mount the workspaces page feature. */
const Page = ({ params }: AgentOSWorkspacesRouteProps) => <AgentOSWorkspacesPage params={params} />

export default Page
