import type { AgentOSWorkspacePageState } from "./component"

const AGENT_OS_WORKSPACE_PAGE_STATES = [
    "overview",
    "solutions",
    "ai-knowledge",
    "applications",
    "infrastructure",
    "operations",
    "access",
] as const

/** Narrow a query string to one of the workspace page's routed tabs. */
export const isAgentOSWorkspacePageState = (value: unknown): value is AgentOSWorkspacePageState =>
    typeof value === "string" && AGENT_OS_WORKSPACE_PAGE_STATES.some((state) => state === value)
