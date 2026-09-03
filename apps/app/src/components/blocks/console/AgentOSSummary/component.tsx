import { Badge, Button, EmptyNotice, SurfaceCard, Text, type BadgeTone } from "@starci/grammar/core";
import {
  AGENT_OS_SUMMARY_ACTION_CLASS_NAME,
  AGENT_OS_SUMMARY_CONTENT_CLASS_NAME,
  AGENT_OS_SUMMARY_COPY_CLASS_NAME,
  AGENT_OS_SUMMARY_DETAIL_CLASS_NAME,
  AGENT_OS_SUMMARY_ROW_CLASS_NAME,
  AGENT_OS_SUMMARY_STATUS_CLASS_NAME
} from "./classNames";

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
    composition="joined"
  ><div
      className={AGENT_OS_SUMMARY_CONTENT_CLASS_NAME}
      data-contract="GAP-4 PADDING-4"
    >
      <EmptyNotice message={state.message} />
    </div></SurfaceCard>;
  const workspace = state.phase === "pending" ? undefined : state.workspace;
  const isLoading = workspace === undefined;
  const action = workspace?.actionHref === undefined ? <Button
    isSkeleton={isLoading}
    onPress={workspace === undefined ? undefined : () => onOpenService(workspace.id)}
  >{workspace?.actionLabel ?? ""}</Button> : <Button
    href={workspace.actionHref}
    onFollow={() => onOpenService(workspace.id)}
  >{workspace.actionLabel}</Button>;
  return <SurfaceCard
    label={label}
    composition="joined"
  ><div
      className={AGENT_OS_SUMMARY_CONTENT_CLASS_NAME}
      data-contract="GAP-4 PADDING-4"
    >
      <div
        className={AGENT_OS_SUMMARY_ROW_CLASS_NAME}
        data-contract="GAP-3"
      >
        <div
          className={AGENT_OS_SUMMARY_COPY_CLASS_NAME}
          data-contract="GAP-1"
        >
          <Text weight="semibold" isSkeleton={isLoading}>{workspace?.name ?? ""}</Text>
          <Text size="xs" tone="muted" isSkeleton={isLoading}>{workspace?.description ?? ""}</Text>
        </div>
        <div className={AGENT_OS_SUMMARY_STATUS_CLASS_NAME}>
          <Badge tone={workspace?.statusTone ?? "neutral"} isSkeleton={isLoading}>{workspace?.statusLabel ?? ""}</Badge>
        </div>
      </div>
      {workspace?.detail === undefined ? null : <div className={AGENT_OS_SUMMARY_DETAIL_CLASS_NAME}>
        <Text size="sm" tone="muted">{workspace.detail}</Text>
      </div>}
      <div className={AGENT_OS_SUMMARY_ACTION_CLASS_NAME}>{action}</div>
    </div></SurfaceCard>;
};

/** Registry identity for the pure AgentOS summary twin. */
