import { AgentOSModuleCreatePage } from "@/features/pages/AgentOSModuleCreatePage"

/** Route identity supplied by the workspace modules segment. */
type AgentOSModuleCreateRouteProps = { readonly params: Promise<{ readonly workspaceId: string }> }

/** Mount the module-create page feature with its resolved workspace. */
const Page = async ({ params }: AgentOSModuleCreateRouteProps) => {
    const { workspaceId } = await params
    return <AgentOSModuleCreatePage workspaceId={workspaceId} />
}

export default Page
