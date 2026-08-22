import { AgentOSSolutionModuleDetail } from "@/components/blocks/agentos/AgentOSSolutionModuleDetail"

/** Route identities only; the detail block owns loading, refusal, and answered data. */
export type AgentOSSolutionModulePageViewProps = {
    readonly workspaceId: string
    readonly installationId: string
}

/** Compose the connected module detail without proxying child state or installation data. */
export const AgentOSSolutionModulePageBase = ({ workspaceId, installationId }: AgentOSSolutionModulePageViewProps) => (
    <AgentOSSolutionModuleDetail workspaceId={workspaceId} installationId={installationId} />
)

/** Source-level tier marker for the pure module page compositor. */
export const meta = { shape: "page", world: "pure" } as const
