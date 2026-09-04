"use client";

type RuntimeWorkbenchGenericCaptionValues = { readonly version: string };
type RuntimeWorkbenchKnowledgeCaptionValues = { readonly kind: string; readonly version: string };
type RuntimeWorkbenchPayableCaptionValues = { readonly kind: string; readonly version: string };
type RuntimeWorkbenchRegisteredValues = { readonly kind: string; readonly version: string };
type RuntimeWorkbenchScheduleCaptionValues = { readonly kind: string; readonly version: string };
type RuntimeWorkbenchSlaCaptionValues = { readonly kind: string; readonly version: string };

/** Settled display labels and typed formatters supplied by the page owner. */
export type KindWorkbenchBlockCopy = {
  readonly "workbench": {
    readonly "acceptedEvents": string;
    readonly "accounting": string;
    readonly "accountingNotice": string;
    readonly "blocked": string;
    readonly "calendar": string;
    readonly "calendarMutation": string;
    readonly "calendarNotice": string;
    readonly "channel": string;
    readonly "citations": string;
    readonly "clear": string;
    readonly "confirmation": string;
    readonly "due": string;
    readonly "evidencePack": string;
    readonly "evidenceTasks": string;
    readonly "execution": string;
    readonly "generic": string;
    readonly "genericCaption": (values: RuntimeWorkbenchGenericCaptionValues) => string;
    readonly "genericNotice": string;
    readonly "groundedAnswer": string;
    readonly "highUrgent": string;
    readonly "inbox": string;
    readonly "kind": string;
    readonly "knowledgeCaption": (values: RuntimeWorkbenchKnowledgeCaptionValues) => string;
    readonly "module": string;
    readonly "needsReview": string;
    readonly "next": string;
    readonly "noAnswer": string;
    readonly "noApprovals": string;
    readonly "noMeeting": string;
    readonly "notScheduled": string;
    readonly "open": string;
    readonly "ownerReview": string;
    readonly "payableCaption": (values: RuntimeWorkbenchPayableCaptionValues) => string;
    readonly "policy": string;
    readonly "proposals": string;
    readonly "qualified": string;
    readonly "reader": string;
    readonly "readerNotice": string;
    readonly "registered": (values: RuntimeWorkbenchRegisteredValues) => string;
    readonly "reviewOnly": string;
    readonly "sales": string;
    readonly "scheduleCaption": (values: RuntimeWorkbenchScheduleCaptionValues) => string;
    readonly "slaCaption": (values: RuntimeWorkbenchSlaCaptionValues) => string;
    readonly "support": string;
    readonly "supportNotice": string;
    readonly "title": string;
    readonly "unavailable": string;
    readonly "unavailableNotice": string;
    readonly "waitChannel": string;
    readonly "waiting": string;
  };
};



import { SurfaceCard, Heading, Text } from "@starci/grammar/common";

import type { ComponentType } from "react";

import type { AgentosRuntimeOperationEvent, AgentosRuntimeTask } from "@/modules/api/console";

/** Runtime data every open-registry workbench receives from the shared shell. */
export type WorkbenchProps = {
  readonly copy: KindWorkbenchBlockCopy;
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
const SalesPipelineWorkbench = (props: WorkbenchProps) => {
  const { copy } = props;
  return (<WorkbenchContent title={copy.workbench.sales} caption={copy.workbench.registered({ kind: props.kindKey, version: props.workbenchVersion })} facts={[{
  id: "qualified",
  label: copy.workbench.qualified,
  value: "12"
}, {
  id: "review",
  label: copy.workbench.needsReview,
  value: "4"
}, {
  id: "module",
  label: copy.workbench.module,
  value: props.moduleId
}]} />);
};
const ConversationInboxWorkbench = (props: WorkbenchProps) => {
  const { copy } = props;
  return (<WorkbenchContent title={copy.workbench.inbox} caption={copy.workbench.registered({ kind: props.kindKey, version: props.workbenchVersion })} facts={[{
  id: "open",
  label: copy.workbench.open,
  value: "8"
}, {
  id: "waiting",
  label: copy.workbench.waiting,
  value: "3"
}, {
  id: "module",
  label: copy.workbench.module,
  value: props.moduleId
}]} />);
};
const SupportQueueWorkbench = (props: WorkbenchProps) => {
  const { copy } = props;
  return (<WorkbenchContent key={props.moduleId} title={copy.workbench.support} caption={copy.workbench.slaCaption({ kind: props.kindKey, version: props.workbenchVersion })} facts={[{
  id: "open",
  label: copy.workbench.open,
  value: String(activeTasks(props).length)
}, {
  id: "risk",
  label: copy.workbench.highUrgent,
  value: String(activeTasks(props).filter(task => task.priority === "high" || task.priority === "urgent").length)
}, {
  id: "next",
  label: copy.workbench.next,
  value: nextTask(props)?.title ?? copy.workbench.clear
}, {
  id: "source",
  label: copy.workbench.channel,
  value: props.events?.[0]?.source ?? copy.workbench.waitChannel
}]} notice={copy.workbench.supportNotice} />);
};
const AccountingSheetWorkbench = (props: WorkbenchProps) => {
  const { copy } = props;
  return (<WorkbenchContent key={props.moduleId} title={copy.workbench.accounting} caption={copy.workbench.payableCaption({ kind: props.kindKey, version: props.workbenchVersion })} facts={[{
  id: "review",
  label: copy.workbench.ownerReview,
  value: String(activeTasks(props).length)
}, {
  id: "next",
  label: copy.workbench.evidencePack,
  value: nextTask(props)?.title ?? copy.workbench.noApprovals
}, {
  id: "state",
  label: copy.workbench.execution,
  value: copy.workbench.reviewOnly
}]} notice={copy.workbench.accountingNotice} />);
};
const CalendarWeekWorkbench = (props: WorkbenchProps) => {
  const { copy } = props;
  return (<WorkbenchContent key={props.moduleId} title={copy.workbench.calendar} caption={copy.workbench.scheduleCaption({ kind: props.kindKey, version: props.workbenchVersion })} facts={[{
  id: "proposals",
  label: copy.workbench.proposals,
  value: String(activeTasks(props).length)
}, {
  id: "next",
  label: copy.workbench.confirmation,
  value: nextTask(props)?.title ?? copy.workbench.noMeeting
}, {
  id: "due",
  label: copy.workbench.due,
  value: nextTask(props)?.dueAt === null || nextTask(props) === undefined ? copy.workbench.notScheduled : new Date(nextTask(props)?.dueAt ?? "").toLocaleString()
}, {
  id: "state",
  label: copy.workbench.calendarMutation,
  value: copy.workbench.blocked
}]} notice={copy.workbench.calendarNotice} />);
};
const DocumentReaderWorkbench = (props: WorkbenchProps) => {
  const { copy } = props;
  return (<WorkbenchContent key={props.moduleId} title={copy.workbench.reader} caption={copy.workbench.knowledgeCaption({ kind: props.kindKey, version: props.workbenchVersion })} facts={[{
  id: "answers",
  label: copy.workbench.evidenceTasks,
  value: String(activeTasks(props).length)
}, {
  id: "next",
  label: copy.workbench.groundedAnswer,
  value: nextTask(props)?.title ?? copy.workbench.noAnswer
}, {
  id: "events",
  label: copy.workbench.acceptedEvents,
  value: String(props.events?.length ?? 0)
}, {
  id: "policy",
  label: copy.workbench.policy,
  value: copy.workbench.citations
}]} notice={copy.workbench.readerNotice} />);
};
const GenericWorkbench = (props: WorkbenchProps) => {
  const { copy } = props;
  return (<WorkbenchContent title={copy.workbench.generic} caption={copy.workbench.genericCaption({ version: props.workbenchVersion })} facts={[{
  id: "kind",
  label: copy.workbench.kind,
  value: props.kindKey
}, {
  id: "module",
  label: copy.workbench.module,
  value: props.moduleId
}]} notice={copy.workbench.genericNotice} />);
};
const UnavailableWorkbench = (props: WorkbenchProps) => {
  const { copy } = props;
  return (<WorkbenchContent title={copy.workbench.unavailable} caption={`${props.kindKey}@${props.workbenchVersion}`} facts={[{
  id: "module",
  label: copy.workbench.module,
  value: props.moduleId
}]} notice={copy.workbench.unavailableNotice} />);
};

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
  const { copy } = props;
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
  const render = <Workbench copy={copy} moduleId={moduleId} kindKey={kindKey} workbenchVersion={workbenchVersion} tasks={tasks} events={events} />;
  return <SurfaceCard
    label={copy.workbench.title}
    fact={`${workbenchKey}@${workbenchVersion}`}
  >{render}</SurfaceCard>;
};
