"use client";

type RuntimeLabelsPriorityValues = { readonly priority: string };
type RuntimeQueueFactValueValues = { readonly value: string; readonly confidence: string; readonly source: string };
type RuntimeQueueFactsCountValues = { readonly count: number };
type RuntimeQueueItemsCountValues = { readonly count: number };
type RuntimeQueueTasksCountValues = { readonly count: number };
type RuntimeQueueTicketValueValues = { readonly summary: string; readonly count: number; readonly state: string };
type ShellUnknownStatusValues = { readonly status: string };

/** Settled display labels and typed formatters supplied by the page owner. */
export type SupportQueueWorkbenchBlockCopy = {
  readonly "labels": {
    readonly "priority": (values: RuntimeLabelsPriorityValues) => string;
  };
  readonly "priority": {
    readonly "high": string;
    readonly "low": string;
    readonly "normal": string;
    readonly "urgent": string;
  };
  readonly "queue": {
    readonly "customerQueue": string;
    readonly "factValue": (values: RuntimeQueueFactValueValues) => string;
    readonly "factsCount": (values: RuntimeQueueFactsCountValues) => string;
    readonly "information": string;
    readonly "itemsCount": (values: RuntimeQueueItemsCountValues) => string;
    readonly "loadingFacts": string;
    readonly "loadingTasks": string;
    readonly "noFacts": string;
    readonly "noTasks": string;
    readonly "notice": string;
    readonly "tasks": string;
    readonly "tasksCount": (values: RuntimeQueueTasksCountValues) => string;
    readonly "ticketValue": (values: RuntimeQueueTicketValueValues) => string;
    readonly "title": string;
  };
  readonly "shell": {
    readonly "unknownStatus": (values: ShellUnknownStatusValues) => string;
  };
};




import { SurfaceCard, SurfaceListCard, Text } from "@starci/grammar/common";
import type { SupportImportantFact, SupportTicket } from "@/modules/api/workspace-controlplane";

/** Evidence-sidecar input for one selected customer or the whole support queue. */
export type SupportQueueWorkbenchBlockProps = {
  readonly copy: SupportQueueWorkbenchBlockCopy;
  readonly tickets: ReadonlyArray<SupportTicket>;
  readonly facts: ReadonlyArray<SupportImportantFact>;
  readonly selectedConversationId: string | null;
  readonly pending: boolean;
};
type WorkbenchRow = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
};
const rowView = (row: WorkbenchRow) => <div>
  <Text size="sm">{row.label}</Text>
  <Text size="sm" weight="semibold">{row.value}</Text></div>;
const factList = (rows: ReadonlyArray<WorkbenchRow>) => <div>{rows.map(rowView)}</div>;
const ticketList = (rows: ReadonlyArray<WorkbenchRow>) => <div>{rows.map(rowView)}</div>;
const emptyRow = (id: string, label: string, value: string): WorkbenchRow => ({
  id,
  label,
  value
});

/** Evidence sidecar for durable facts and incidents extracted from channel messages. */
export const SupportQueueWorkbenchBlock = (props: SupportQueueWorkbenchBlockProps) => {
  const { copy } = props;
  const {
    tickets,
    facts,
    selectedConversationId,
    pending
  }: SupportQueueWorkbenchBlockProps = props;
  const visibleTickets = selectedConversationId === null ? tickets : tickets.filter(ticket => ticket.conversationId === selectedConversationId);
  const visibleFacts = selectedConversationId === null ? facts : facts.filter(fact => fact.conversationId === selectedConversationId);
  const factRows = visibleFacts.map(fact => ({
    id: fact.id,
    label: fact.factType,
    value: copy.queue.factValue({ value: fact.value, confidence: fact.confidence, source: fact.sourceMessageId.slice(0, 8) })
  }));
  const ticketRows = visibleTickets.map(ticket => ({
    id: ticket.id,
    label: `${priorityLabel(ticket.priority, copy)} · ${ticket.title}`,
    value: copy.queue.ticketValue({ summary: ticket.summary, count: ticket.evidenceCount, state: copy.shell.unknownStatus({ status: ticket.state }) })
  }));
  const shownFacts = factRows.length === 0 ? [emptyRow("facts", copy.queue.information, pending ? copy.queue.loadingFacts : copy.queue.noFacts)] : factRows;
  const shownTickets = ticketRows.length === 0 ? [emptyRow("tickets", copy.queue.tasks, pending ? copy.queue.loadingTasks : copy.queue.noTasks)] : ticketRows;
  const itemCount = factRows.length + ticketRows.length;
  return <SurfaceCard
    label={copy.queue.title}
    frame="frameless"
    fact={copy.queue.itemsCount({ count: itemCount })}
  ><div>



        <SurfaceListCard
        label={copy.queue.information}
        fact={copy.queue.factsCount({ count: factRows.length })}
        depth="nested"
      >

          {factList(shownFacts)}</SurfaceListCard>



        <SurfaceListCard
        label={copy.queue.customerQueue}
        fact={copy.queue.tasksCount({ count: ticketRows.length })}
        depth="nested"
      >

          {ticketList(shownTickets)}</SurfaceListCard>


        <Text size="sm" tone="muted">{copy.queue.notice}</Text></div></SurfaceCard>;
};

/** Localize known priorities while preserving unknown raw values. */
const priorityLabel = (priority: string, copy: SupportQueueWorkbenchBlockCopy): string => priority === "low" || priority === "normal" || priority === "high" || priority === "urgent" ? copy.priority[priority] : copy.labels.priority({ priority });
