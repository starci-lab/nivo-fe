import { AgentOSReadinessComponentListBase, type AgentOSReadinessComponentListViewProps } from "./component";

/** Keep component verdict presentation independently reusable inside workspace AI surfaces. */
export type AgentOSReadinessComponentListProps = AgentOSReadinessComponentListViewProps;
/** Public API role for AgentOSReadinessComponentList. */
export const AgentOSReadinessComponentList = (props: AgentOSReadinessComponentListProps) => <AgentOSReadinessComponentListBase {...props} />;

