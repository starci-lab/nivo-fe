import { AgentOSModuleRoutePage } from "@/components/blocks/agentos/AgentOSModuleRoutePage"

/** Exact workspace and installation route identities. */
export type AgentOSSolutionModulePageProps = {
    readonly workspaceId: string
    readonly installationId: string
    readonly view?: "setup" | "operate" | "test" | "settings" | "diagnostics"
}

/** Compose the interactive module route block for one installed module. */
export const AgentOSSolutionModulePage = (props: AgentOSSolutionModulePageProps) => (
    <AgentOSModuleRoutePage {...props} />
)

export default AgentOSSolutionModulePage