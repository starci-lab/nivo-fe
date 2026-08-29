import { AgentOSKnowledgeOriginListBase, type AgentOSKnowledgeOriginListViewProps } from "./component";

/** Keep provenance presentation independently reusable inside workspace AI surfaces. */
export type AgentOSKnowledgeOriginListProps = AgentOSKnowledgeOriginListViewProps;
/** Public API role for AgentOSKnowledgeOriginList. */
export const AgentOSKnowledgeOriginList = (props: AgentOSKnowledgeOriginListProps) => <AgentOSKnowledgeOriginListBase {...props} />;

