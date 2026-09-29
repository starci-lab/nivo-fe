/** Navigation states available inside the exact AgentOS workspace page. */
export type AgentOSWorkspacePageState =
    | "overview"
    | "solutions"
    | "ai-knowledge"
    | "applications"
    | "infrastructure"
    | "operations"
    | "access"

/** Settled state of the aggregate workspace control-center request. */
export type AgentOSWorkspaceControlCenterStatus = "loading" | "refused" | "ready"
