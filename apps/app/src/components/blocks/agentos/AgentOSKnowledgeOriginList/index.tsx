import { AgentOSKnowledgeOriginListBase, type AgentOSKnowledgeOriginListViewProps } from "./component"

/** Keep provenance presentation independently reusable inside workspace AI surfaces. */
export const AgentOSKnowledgeOriginList = (props: AgentOSKnowledgeOriginListViewProps) => <AgentOSKnowledgeOriginListBase {...props} />

/** Source-level tier marker for the connected provenance block. */
export const meta = { shape: "block", world: "connected" } as const
