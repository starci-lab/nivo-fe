import { StatusActionCard } from "@nivo/ui";
import { EmptyNotice, SurfaceCard, type BadgeTone } from "@starci/grammar/core";

/** One workspace row prepared for the pure AgentOS summary surface. */
export type AgentOSSummaryWorkspace = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly statusLabel: string;
  readonly statusTone: BadgeTone;
  readonly actionLabel: string;
  readonly actionHref?: string;
  readonly detail?: string;
};
/** Settled states the AgentOS summary can render independently. */
export type AgentOSSummaryState = {
  readonly phase: "pending";
} | {
  readonly phase: "empty";
  readonly message: string;
} | {
  readonly phase: "populated";
  readonly workspace: AgentOSSummaryWorkspace;
} | {
  readonly phase: "partial";
  readonly workspace: AgentOSSummaryWorkspace;
} | {
  readonly phase: "forbidden";
  readonly workspace: AgentOSSummaryWorkspace;
};
/** Pure AgentOS summary input and its legal workspace command. */
export type AgentOSSummaryProps = {
  readonly label: string;
  readonly state: AgentOSSummaryState;
  readonly onOpenService: (id: string) => void;
};

/** Draw one owner-scoped workspace and its independently answered runtime. */
export const AgentOSSummaryBase = (props: AgentOSSummaryProps) => {
  const {
    label,
    state,
    onOpenService
  }: AgentOSSummaryProps = props;
  if (state.phase === "empty") return <SurfaceCard
    label={label}
  ><div>
      <EmptyNotice message={state.message} /></div></SurfaceCard>;
  const workspace = state.phase === "pending" ? undefined : state.workspace;
  return <SurfaceCard
    label={label}
  ><div><><StatusActionCard props={{
          id: workspace?.id ?? "pending",
          title: workspace?.name ?? "",
          description: workspace?.description ?? "",
          statusLabel: workspace?.statusLabel ?? "",
          statusTone: workspace?.statusTone ?? "neutral",
          actionLabel: workspace?.actionLabel ?? "",
          actionHref: workspace?.actionHref,
          detail: workspace?.detail
        }} on={{
          press: workspace === undefined ? undefined : () => onOpenService(workspace.id)
        }} isLoading={workspace === undefined} /></></div></SurfaceCard>;
};

/** Registry identity for the pure AgentOS summary twin. */
