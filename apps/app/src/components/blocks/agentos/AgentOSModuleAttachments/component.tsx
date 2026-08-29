import { useRef } from "react";
import { Button, LifecycleStep, SurfaceCard, Text, type LifecycleStepData } from "@nivo/ui";
import type { AgentosModuleStudio } from "@/modules/api/console";

/** Attachment lifecycle rows and their bounded upload/removal actions. */
export type AgentOSModuleAttachmentsProps = AgentOSModuleAttachmentsViewProps;
/** Public API role for AgentOSModuleAttachmentsViewProps. */
export type AgentOSModuleAttachmentsViewProps = {
  readonly studio?: AgentosModuleStudio;
  readonly state: "loading" | "refused" | "ready";
  readonly pending: boolean;
  readonly labels: {
    readonly title: string;
    readonly upload: string;
    readonly retry?: string;
    readonly remove: string;
    readonly refused: string;
    readonly empty: string;
    readonly uploaded: string;
    readonly scanning: string;
    readonly extracting: string;
    readonly embedding: string;
    readonly indexing: string;
    readonly indexed: string;
    readonly complete: string;
    readonly current: string;
    readonly upcoming: string;
    readonly chunks: (count: number) => string;
    readonly refusedStatus: string;
    readonly removed: string;
  };
  readonly onChoose: (file: File) => void;
  readonly onRetry?: (id: string) => void;
  readonly onRemove: (id: string) => void;
};
const lifecycleState = (index: number, active: number): LifecycleStepData["state"] => {
  if (index < active) return "done";
  return index === active ? "current" : "upcoming";
};
const lifecycleStateLabel = (index: number, active: number, labels: AgentOSModuleAttachmentsViewProps["labels"]): string => {
  if (index < active) return labels.complete;
  return index === active ? labels.current : labels.upcoming;
};

/** Draw quarantined file evidence with explicit scan outcomes. */
export const AgentOSModuleAttachmentsBase = (props: AgentOSModuleAttachmentsProps) => {
  const {
    studio,
    state,
    pending,
    labels,
    onChoose,
    onRetry,
    onRemove
  }: AgentOSModuleAttachmentsViewProps = props;
  const fileInput = useRef<HTMLInputElement>(null);
  if (state === "refused") return <SurfaceCard props={{
    label: labels.title
  }}><div><Text props={{
        content: labels.refused,
        size: "sm",
        tone: "muted"
      }} /></div></SurfaceCard>;
  const rows = state === "loading" ? [{
    id: "loading",
    fileName: labels.title,
    mediaType: "",
    sizeBytes: 0,
    status: "scanning" as const
  }] : studio?.attachments ?? [];
  const stageLabels = [labels.uploaded, labels.scanning, labels.extracting, labels.embedding, labels.indexing, labels.indexed];
  const stageOf = (file: (typeof rows)[number]) => {
    if (!("ingestionStatus" in file)) return 1;
    return ({
      pending: 0,
      scanning: 1,
      extracting: 2,
      embedding: 3,
      indexing: 4,
      indexed: 5,
      refused: 1,
      removed: 5
    } as const)[file.ingestionStatus];
  };
  return <SurfaceCard props={{
    label: labels.title
  }}><div>{rows.map(file => {
        const active = stageOf(file);
        const stages: ReadonlyArray<LifecycleStepData> = stageLabels.map((label, index) => ({
          ordinal: String(index + 1),
          label,
          state: lifecycleState(index, active),
          stateLabel: lifecycleStateLabel(index, active, labels)
        }));
        const ingestionStatus = "ingestionStatus" in file ? file.ingestionStatus : file.status;
        const refused = ingestionStatus === "refused";
        const chunkLabel = "chunkCount" in file && file.chunkCount > 0 ? labels.chunks(file.chunkCount) : "";
        const caption = [file.mediaType || "—", chunkLabel].filter(Boolean).join(" · ");
        return <div key={file.id}><div><div>


              <Text props={{
                content: file.fileName,
                size: "sm",
                weight: "semibold"
              }} isLoading={state === "loading"} />
              <Text props={{
                content: caption,
                size: "xs",
                tone: "muted"
              }} isLoading={state === "loading"} /></div>{refused && labels.retry !== undefined && onRetry !== undefined ? <Button props={{
              label: labels.retry,
              variant: "secondary",
              size: "sm",
              disabled: pending
            }} on={{
              press: () => onRetry(file.id)
            }} /> : <Button props={{
              label: labels.remove,
              variant: "ghost",
              size: "sm",
              disabled: pending
            }} on={{
              press: () => onRemove(file.id)
            }} isLoading={state === "loading"} />}</div><div>{stages.map((step, index) => <LifecycleStep key={index} props={step} isLoading={state === "loading"} />)}</div></div>;
      })}

      <>
                <input ref={fileInput} type="file" accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown" hidden disabled={pending} onChange={event => {
          const file = event.currentTarget.files?.[0];
          if (file !== undefined) onChoose(file);
          event.currentTarget.value = "";
        }} />
        
                <Button props={{
          label: labels.upload,
          variant: "secondary",
          isPending: pending
        }} on={{
          press: () => fileInput.current?.click()
        }} />
        
            </></div></SurfaceCard>;
};

