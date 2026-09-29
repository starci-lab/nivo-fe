import type { AgentOSModuleView } from "./index"

const AGENT_OS_MODULE_VIEWS = ["setup", "test", "operate", "settings", "diagnostics"] as const

/** Narrow a tabs callback value to a route the installed-module shell actually owns. */
export const isAgentOSModuleView = (value: unknown): value is AgentOSModuleView =>
    typeof value === "string" && AGENT_OS_MODULE_VIEWS.some((view) => view === value)
