import { OperationActionRail, SurfaceCard, Text } from "@nivo/ui";

/** Resolved lifecycle labels consumed by the operations block. */
export type AgentOSWorkspaceOperationsProps = {
  readonly labels: {
    readonly section: string;
    readonly note: string;
    readonly update: string;
    readonly plan: string;
    readonly backup: string;
    readonly reset: string;
    readonly rebuild: string;
  };
};

/** Expose the approved lifecycle vocabulary without inventing mutations the public API does not own yet. */
export const AgentOSWorkspaceOperations = (props: AgentOSWorkspaceOperationsProps) => {
  const {
    labels
  }: AgentOSWorkspaceOperationsProps = props;
  return <SurfaceCard props={{
    label: labels.section
  }}><div>



    <OperationActionRail props={{
        id: "workspace-operations",
        actions: [labels.update, labels.plan, labels.backup, labels.reset, labels.rebuild].map(label => ({
          id: label,
          label,
          disabled: true
        }))
      }} />


    <Text props={{
        content: labels.note,
        size: "sm",
        tone: "muted"
      }} /></div></SurfaceCard>;
};
