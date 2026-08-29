import { Avatar, Badge, Button, Heading, SurfaceCard, Text, TextLink } from "@nivo/ui";
import type { ExpertSiteLead } from "@/modules/api/console";

/** Resolved copy for the lead pipeline. */
export type AcademyLeadPipelineProps = AcademyLeadPipelineViewProps;
/** Public API role for AcademyLeadPipelineLabels. */
export type AcademyLeadPipelineLabels = {
  readonly section: string;
  readonly empty: string;
  readonly refused: string;
  readonly open: string;
  readonly detail: string;
  readonly advance: string;
  readonly draft: string;
  readonly saved: string;
  readonly actionFailed: string;
};

/** Pure lead pipeline state. */
export type AcademyLeadPipelineViewProps = {
  readonly state: "resting" | "empty" | "refused" | "answered";
  readonly leads: ReadonlyArray<ExpertSiteLead>;
  readonly selected?: ExpertSiteLead;
  readonly draft?: string;
  readonly pendingAction?: "advance" | "draft";
  readonly message?: string;
  readonly labels: AcademyLeadPipelineLabels;
  readonly onOpenLead: (leadId: string) => void;
  readonly onAdvance: () => void;
  readonly onDraftReply: () => void;
};

/** Render leads as a joined identity scan with one selected follow-up. */
const AcademyLeadPipelineContent = ({
  state,
  leads,
  selected,
  draft,
  pendingAction,
  message,
  labels,
  onOpenLead,
  onAdvance,
  onDraftReply
}: AcademyLeadPipelineViewProps) => {
  const rows = state === "resting" ? [0, 1, 2].map((item, index) => <div key={index}>
    <Avatar props={{
      size: "md"
    }} isLoading /><div>

      <TextLink props={{
        label: "",
        size: "sm"
      }} isLoading />
      <Text props={{
        content: ""
      }} isLoading /></div>

    <Button props={{
      label: labels.open
    }} isLoading /></div>) : leads.map((lead, index) => <div key={index}>
    <Avatar props={{
      name: lead.name,
      size: "md"
    }} /><div>

      <TextLink props={{
        label: lead.name,
        size: "sm"
      }} on={{
        press: () => onOpenLead(lead.id)
      }} />
      <Text props={{
        content: lead.contact,
        size: "xs",
        tone: "muted"
      }} /></div>

    <Badge props={{
      content: lead.status,
      tone: lead.status === "converted" ? "success" : "neutral"
    }} />
    <Button props={{
      label: labels.open,
      size: "sm"
    }} on={{
      press: () => onOpenLead(lead.id)
    }} /></div>);
  const refusalNote = state === "refused" ? labels.refused : undefined;
  const note = state === "empty" ? labels.empty : refusalNote;
  return <>
            {note === undefined ? <SurfaceCard props={{
      label: labels.section,
      fact: state === "answered" ? String(leads.length) : undefined
    }} isLoading={state === "resting"}><div>{rows}</div></SurfaceCard> : <SurfaceCard props={{
      label: labels.section
    }}><div>
          <Text props={{
          content: note,
          size: "sm",
          tone: "muted"
        }} /></div></SurfaceCard>}
            {selected === undefined ? null : <SurfaceCard props={{
      label: labels.detail
    }}><div>


          <Heading props={{
          content: selected.name,
          level: 3
        }} />
          <Text props={{
          content: draft ?? selected.message ?? selected.contact,
          size: "sm",
          tone: "muted"
        }} />
          <Button props={{
          label: draft === undefined ? labels.draft : labels.advance,
          variant: "primary",
          isPending: pendingAction !== undefined
        }} on={{
          press: draft === undefined ? onDraftReply : onAdvance
        }} /></div></SurfaceCard>}
            {message === undefined ? null : <Text props={{
      content: message,
      size: "sm",
      tone: "muted"
    }} />}
        </>;
};

/** Stable typed root for the Academy lead block. */
export const AcademyLeadPipelineBase = (props: AcademyLeadPipelineProps) => <AcademyLeadPipelineContent {...props} />;

