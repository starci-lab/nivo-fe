"use client";
import { SurfaceCard, Heading, Text } from "@starci/grammar/core";

import type { ComponentType } from "react";

import type { AgentosRuntimeOperationEvent, AgentosRuntimeTask } from "@/modules/api/console";

/** Runtime data every open-registry workbench receives from the shared shell. */
export type WorkbenchProps = {
  readonly moduleId: string;
  readonly kindKey: string;
  readonly workbenchVersion: string;
  readonly tasks?: ReadonlyArray<AgentosRuntimeTask>;
  readonly events?: ReadonlyArray<AgentosRuntimeOperationEvent>;
};
const activeTasks = (props: WorkbenchProps): ReadonlyArray<AgentosRuntimeTask> => props.tasks?.filter(task => task.status === "open" || task.status === "in_progress") ?? [];
const nextTask = (props: WorkbenchProps): AgentosRuntimeTask | undefined => activeTasks(props)[0];

/** Extensible workbench table; adding a key does not edit the Module Studio shell. */
export type WorkbenchRegistry = Readonly<Record<string, ComponentType<WorkbenchProps>>>;
type WorkbenchFact = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
};
type WorkbenchContentProps = {
  readonly title: string;
  readonly caption: string;
  readonly facts: ReadonlyArray<WorkbenchFact>;
  readonly notice?: string;
};
const WorkbenchContent = ({
  title,
  caption,
  facts,
  notice
}: WorkbenchContentProps) => <div><div>


    <Heading level={3}>{title}</Heading>

    <Text size="xs" tone="muted">{caption}</Text></div><div>{facts.map((fact, index) => <div key={index}>{<Text size="sm">{fact.label}</Text>}{<Text size="sm" weight="semibold">{fact.value}</Text>}</div>)}</div>{notice === undefined ? undefined : <Text size="sm" tone="muted">{notice}</Text>}</div>;
const SalesPipelineWorkbench = (props: WorkbenchProps) => <WorkbenchContent title="Sales pipeline" caption={`Registered for ${props.kindKey}@${props.workbenchVersion}`} facts={[{
  id: "qualified",
  label: "Qualified",
  value: "12"
}, {
  id: "review",
  label: "Needs review",
  value: "4"
}, {
  id: "module",
  label: "Module",
  value: props.moduleId
}]} />;
const ConversationInboxWorkbench = (props: WorkbenchProps) => <WorkbenchContent title="Conversation inbox" caption={`Registered for ${props.kindKey}@${props.workbenchVersion}`} facts={[{
  id: "open",
  label: "Open",
  value: "8"
}, {
  id: "waiting",
  label: "Waiting",
  value: "3"
}, {
  id: "module",
  label: "Module",
  value: props.moduleId
}]} />;
const SupportQueueWorkbench = (props: WorkbenchProps) => <WorkbenchContent key={props.moduleId} title="Support queue" caption={`SLA queue for ${props.kindKey}@${props.workbenchVersion}`} facts={[{
  id: "open",
  label: "Open",
  value: String(activeTasks(props).length)
}, {
  id: "risk",
  label: "High / urgent",
  value: String(activeTasks(props).filter(task => task.priority === "high" || task.priority === "urgent").length)
}, {
  id: "next",
  label: "Next",
  value: nextTask(props)?.title ?? "Queue clear"
}, {
  id: "source",
  label: "Latest channel",
  value: props.events?.[0]?.source ?? "Waiting for channel events"
}]} notice="Tickets remain in the kind-owned queue while Setup context and Execute chat stay in the shared module shell." />;
const AccountingSheetWorkbench = (props: WorkbenchProps) => <WorkbenchContent key={props.moduleId} title="Accounting sheet" caption={`Payable review for ${props.kindKey}@${props.workbenchVersion}`} facts={[{
  id: "review",
  label: "Needs owner review",
  value: String(activeTasks(props).length)
}, {
  id: "next",
  label: "Next evidence pack",
  value: nextTask(props)?.title ?? "No pending approvals"
}, {
  id: "state",
  label: "Execution",
  value: "Review only · no self-approval"
}]} notice="Approval remains explicit; the assistant prepares evidence but does not authorize payment." />;
const CalendarWeekWorkbench = (props: WorkbenchProps) => <WorkbenchContent key={props.moduleId} title="Calendar week" caption={`Collaborative schedule for ${props.kindKey}@${props.workbenchVersion}`} facts={[{
  id: "proposals",
  label: "Pending proposals",
  value: String(activeTasks(props).length)
}, {
  id: "next",
  label: "Next confirmation",
  value: nextTask(props)?.title ?? "No meeting awaiting confirmation"
}, {
  id: "due",
  label: "Due",
  value: nextTask(props)?.dueAt === null || nextTask(props) === undefined ? "Not scheduled" : new Date(nextTask(props)?.dueAt ?? "").toLocaleString()
}, {
  id: "state",
  label: "Calendar mutation",
  value: "Blocked until confirmation"
}]} notice="Proposals do not overwrite events until a participant confirms them." />;
const DocumentReaderWorkbench = (props: WorkbenchProps) => <WorkbenchContent key={props.moduleId} title="Document reader" caption={`Cited workspace knowledge for ${props.kindKey}@${props.workbenchVersion}`} facts={[{
  id: "answers",
  label: "Evidence tasks",
  value: String(activeTasks(props).length)
}, {
  id: "next",
  label: "Latest grounded answer",
  value: nextTask(props)?.title ?? "No answer awaiting review"
}, {
  id: "events",
  label: "Accepted source events",
  value: String(props.events?.length ?? 0)
}, {
  id: "policy",
  label: "Policy",
  value: "Citations + conflict disclosure"
}]} notice="Nivo bootstrap knowledge is generated from the mounted package and every important answer keeps a source reference." />;
const GenericWorkbench = (props: WorkbenchProps) => <WorkbenchContent title="Module workbench" caption={`Generic registry surface ${props.workbenchVersion}`} facts={[{
  id: "kind",
  label: "Kind",
  value: props.kindKey
}, {
  id: "module",
  label: "Module",
  value: props.moduleId
}]} notice="Register another trusted ComponentType under the workbench key to extend this surface without editing the shell." />;
const UnavailableWorkbench = (props: WorkbenchProps) => <WorkbenchContent title="No registered workbench" caption={`${props.kindKey}@${props.workbenchVersion}`} facts={[{
  id: "module",
  label: "Module",
  value: props.moduleId
}]} notice="Chat remains available. The workbench failed closed because this key has no trusted ComponentType registration." />;

/** Built-in open registry aligned with backend workbench identities. */
export const DEFAULT_WORKBENCH_REGISTRY: WorkbenchRegistry = {
  "support-queue": SupportQueueWorkbench,
  "accounting-sheet": AccountingSheetWorkbench,
  "calendar-week": CalendarWeekWorkbench,
  "document-reader": DocumentReaderWorkbench,
  "sales-pipeline": SalesPipelineWorkbench,
  "conversation-inbox": ConversationInboxWorkbench,
  "generic-workbench": GenericWorkbench
};

/** Exact registry lookup input for one kind-owned companion surface. */
export type KindWorkbenchBlockProps = WorkbenchProps & {
  readonly workbenchKey: string;
  readonly registry: WorkbenchRegistry;
};

/** Resolve one kind-owned ComponentType while Chat and the shared shell remain unchanged. */
export const KindWorkbenchBlock = (props: KindWorkbenchBlockProps) => {
  const {
    moduleId,
    kindKey,
    workbenchKey,
    workbenchVersion,
    tasks,
    events,
    registry
  }: KindWorkbenchBlockProps = props;
  const Workbench = registry[workbenchKey] ?? UnavailableWorkbench;
  const render = <Workbench moduleId={moduleId} kindKey={kindKey} workbenchVersion={workbenchVersion} tasks={tasks} events={events} />;
  return <SurfaceCard
    label="Workbench"
    fact={`${workbenchKey}@${workbenchVersion}`}
  >{render}</SurfaceCard>;
};
