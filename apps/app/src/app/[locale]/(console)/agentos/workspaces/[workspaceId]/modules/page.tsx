import { AgentOSModuleCollectionPage } from "@/features/pages/AgentOSModuleCollectionPage"

type AgentOSModulesRouteProps = { readonly params: Promise<{ readonly workspaceId: string }> }

const Page = async ({ params }: AgentOSModulesRouteProps) => {
    const { workspaceId } = await params
    return <AgentOSModuleCollectionPage workspaceId={workspaceId} />
}

export default Page