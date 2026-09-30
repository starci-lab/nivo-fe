/** The routed tabs of one workspace page, in the order the page offers them. */
const AGENT_OS_WORKSPACE_PAGE_STATES = [
    "overview",
    "solutions",
    "ai-knowledge",
    "applications",
    "infrastructure",
    "operations",
    "access",
] as const

/** One routed tab of the workspace page. */
export type AgentOSWorkspacePageState = (typeof AGENT_OS_WORKSPACE_PAGE_STATES)[number]

/** Narrow a query string to one of the workspace page's routed tabs. */
export const isAgentOSWorkspacePageState = (value: unknown): value is AgentOSWorkspacePageState =>
    typeof value === "string" && AGENT_OS_WORKSPACE_PAGE_STATES.some((state) => state === value)
