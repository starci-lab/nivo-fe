import { Avatar } from "@nivo/ui";
import { SurfaceCard, Button, Button as CoreButton, Heading, Text, TextAction, Badge } from "@starci/grammar/common";
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

      <TextAction size="sm" isSkeleton>{""}</TextAction>
      <Text isSkeleton>{""}</Text></div>

    <Button isSkeleton>{labels.open}</Button></div>) : leads.map((lead, index) => <div key={index}>
    <Avatar props={{
      name: lead.name,
      size: "md"
    }} /><div>

      <TextAction size="sm" onPress={() => onOpenLead(lead.id)}>{lead.name}</TextAction>
      <Text size="xs" tone="muted">{lead.contact}</Text></div>

    <Badge tone={lead.status === "converted" ? "success" : "neutral"}>{lead.status}</Badge>
    <CoreButton
      size="sm"
      onPress={() => onOpenLead(lead.id)}
    >{labels.open}</CoreButton></div>);
  const refusalNote = state === "refused" ? labels.refused : undefined;
  const note = state === "empty" ? labels.empty : refusalNote;
  return <>
            {note === undefined ? <SurfaceCard
              label={labels.section}
              labelEnd={(state === "answered" ? String(leads.length) : undefined) === undefined ? null : <Text size="sm" tone="muted" isSkeleton={state === "resting"}>{state === "answered" ? String(leads.length) : undefined}</Text>}
            ><div>{rows}</div></SurfaceCard> : <SurfaceCard
      label={labels.section}
    ><div>
          <Text size="sm" tone="muted">{note}</Text></div></SurfaceCard>}
            {selected === undefined ? null : <SurfaceCard
              label={labels.detail}
            ><div>


          <Heading level={3}>{selected.name}</Heading>
          <Text size="sm" tone="muted">{draft ?? selected.message ?? selected.contact}</Text>
          <CoreButton
            variant="primary"
            isPending={pendingAction !== undefined}
            onPress={draft === undefined ? onDraftReply : onAdvance}
          >{draft === undefined ? labels.draft : labels.advance}</CoreButton></div></SurfaceCard>}
            {message === undefined ? null : <Text size="sm" tone="muted">{message}</Text>}
        </>;
};

/** Stable typed root for the Academy lead block. */
export const AcademyLeadPipelineBase = (props: AcademyLeadPipelineProps) => <AcademyLeadPipelineContent {...props} />;

