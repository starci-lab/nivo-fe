import { AgentOSWorkspaceControlCenter } from "@/components/blocks/agentos/AgentOSWorkspaceControlCenter";

/** Page-owned route and tab axis; aggregate state and data remain in the child block. */
export type AgentOSWorkspacePageState = "overview" | "solutions" | "ai-knowledge" | "applications" | "infrastructure" | "operations" | "access";

/** Public API role for AgentOSWorkspacePageBaseProps. */
export type AgentOSWorkspacePageBaseProps = {
  readonly props: AgentOSWorkspacePageViewProps;
  readonly on: AgentOSWorkspacePageViewActions;
};
/** Route identity and the selected workspace tab the pure page draws from. */
export type AgentOSWorkspacePageViewProps = {
  readonly workspaceId: string;
  readonly pageState: AgentOSWorkspacePageState;
};
/** The tab-selection command the connected page exposes to its drawing half. */
export type AgentOSWorkspacePageViewActions = {
  readonly onSelectPageState: (pageState: AgentOSWorkspacePageState) => void;
};

/** Compose the real connected control-center child without proxying its request state or data. */
export const AgentOSWorkspacePageBase = (props: AgentOSWorkspacePageBaseProps) => {
  const {
    workspaceId,
    pageState
  }: AgentOSWorkspacePageViewProps = props.props;
  const {
    onSelectPageState
  }: AgentOSWorkspacePageViewActions = props.on;
  return <AgentOSWorkspaceControlCenter workspaceId={workspaceId} pageState={pageState} onSelectPageState={onSelectPageState} />;
};
