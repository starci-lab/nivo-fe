"use client";
import { SurfaceCard, SurfaceListCard, Text } from "@starci/grammar/common";
import type { SupportImportantFact, SupportTicket } from "@/modules/api/workspace-controlplane";

/** Evidence-sidecar input for one selected customer or the whole support queue. */
export type SupportQueueWorkbenchBlockProps = {
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
    value: `${fact.value} · Confidence ${fact.confidence} · source ${fact.sourceMessageId.slice(0, 8)}`
  }));
  const ticketRows = visibleTickets.map(ticket => ({
    id: ticket.id,
    label: `${ticket.priority.toUpperCase()} · ${ticket.title}`,
    value: `${ticket.summary} · Evidence ${ticket.evidenceCount} · ${ticket.state}`
  }));
  const shownFacts = factRows.length === 0 ? [emptyRow("facts", "Important information", pending ? "Loading customer facts…" : "No extracted fact for this customer")] : factRows;
  const shownTickets = ticketRows.length === 0 ? [emptyRow("tickets", "Task queue", pending ? "Loading queued tasks…" : "No queued task for this customer")] : ticketRows;
  const itemCount = factRows.length + ticketRows.length;
  return <SurfaceCard
    label="Support workbench"
    frame="frameless"
    fact={`${itemCount} important items`}
  ><div>



        <SurfaceListCard
        label="Important information"
        fact={`${factRows.length} facts`}
        depth="nested"
      >

          {factList(shownFacts)}</SurfaceListCard>



        <SurfaceListCard
        label="Customer queue"
        fact={`${ticketRows.length} tasks`}
        depth="nested"
      >

          {ticketList(shownTickets)}</SurfaceListCard>


        <Text size="sm" tone="muted">{"Queue entries keep their source conversation and evidence count; they do not rewrite customer history."}</Text></div></SurfaceCard>;
};
