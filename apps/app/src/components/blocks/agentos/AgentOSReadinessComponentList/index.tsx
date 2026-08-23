import { AgentOSReadinessComponentListBase, type AgentOSReadinessComponentListViewProps } from "./component"

/** Keep component verdict presentation independently reusable inside workspace AI surfaces. */
export const AgentOSReadinessComponentList = (props: AgentOSReadinessComponentListViewProps) => <AgentOSReadinessComponentListBase {...props} />

/** Source-level tier marker for the connected readiness evidence block. */
export const meta = { shape: "block", world: "connected" } as const
