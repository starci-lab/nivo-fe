import { AgentOSWorkspaceControlCenter } from "@/components/blocks/agentos/AgentOSWorkspaceControlCenter";
import type { AgentOSWorkspacePageState } from "@/components/blocks/agentos/AgentOSWorkspaceControlCenter/component";

/** Page-owned route and tab axis; aggregate state and data remain in the child block. */
export type AgentOSWorkspacePageProps = AgentOSWorkspacePageViewProps;
/** Public API role for AgentOSWorkspacePageViewProps. */
export type AgentOSWorkspacePageViewProps = {
  readonly workspaceId: string;
  readonly pageState: AgentOSWorkspacePageState;
  readonly onSelectPageState: (pageState: AgentOSWorkspacePageState) => void;
};

/** Compose the real connected control-center child without proxying its request state or data. */
export const AgentOSWorkspacePageBase = (props: AgentOSWorkspacePageProps) => {
  const {
    workspaceId,
    pageState,
    onSelectPageState
  }: AgentOSWorkspacePageViewProps = props;
  return <AgentOSWorkspaceControlCenter workspaceId={workspaceId} pageState={pageState} onSelectPageState={onSelectPageState} />;
};
export type { AgentOSWorkspacePageState };
