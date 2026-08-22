import { AgentOSSolutionModulePageBase } from "./component"

/** Exact workspace and installation route identities connected by the page. */
export type AgentOSSolutionModulePageProps = { readonly workspaceId: string; readonly installationId: string }

/** Connect the exact nested route; the child block owns its request lifecycle. */
export const AgentOSSolutionModulePage = (props: AgentOSSolutionModulePageProps) => (
    <AgentOSSolutionModulePageBase {...props} />
)

/** Source-level tier marker for the connected module page. */
export const meta = { shape: "page", world: "connected" } as const
