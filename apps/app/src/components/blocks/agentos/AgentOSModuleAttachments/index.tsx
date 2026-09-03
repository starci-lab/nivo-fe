"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useMutateAgentosModuleAttachmentUploadSwr, useMutateFinalizeAgentosModuleAttachmentSwr, useMutateRemoveAgentosModuleAttachmentSwr } from "@/hooks";
import { useAgentOSModuleStudioProjection } from "@/components/pages/AgentOSModuleStudioPage/component";
import { AgentOSModuleAttachmentsBase } from "./component";
type AgentOSModuleAttachmentsProps = {
  readonly workspaceId: string;
  readonly moduleId: string;
};
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const projectionState = (refused: boolean, studio: ReturnType<typeof useAgentOSModuleStudioProjection>["studio"]) => {
  if (refused || studio === null) return "refused";
  return studio === undefined ? "loading" : "ready";
};
const mediaTypeFor = (file: File) => {
  if (file.type) return file.type;
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (lower.endsWith(".md")) return "text/markdown";
  return "text/plain";
};

/** Own attachment preparation, scan polling, retry and removal over the shared studio projection. */
export const AgentOSModuleAttachments = (props: AgentOSModuleAttachmentsProps) => {
  const {
    workspaceId,
    moduleId
  }: AgentOSModuleAttachmentsProps = props;
  const t = useTranslations("console.agentos.modules.studio.attachments");
  const {
    studio,
    refresh
  } = useAgentOSModuleStudioProjection();
  const uploadAttachment = useMutateAgentosModuleAttachmentUploadSwr(workspaceId, moduleId);
  const finalizeAttachment = useMutateFinalizeAgentosModuleAttachmentSwr(workspaceId, moduleId);
  const removeAttachment = useMutateRemoveAgentosModuleAttachmentSwr(workspaceId, moduleId);
  const [refused, setRefused] = useState(false);
  useEffect(() => {
    if (!studio?.attachments.some(item => item.status === "scanning" || item.ingestionStatus === "extracting" || item.ingestionStatus === "embedding" || item.ingestionStatus === "indexing")) return;
    const timer = window.setInterval(() => void refresh(), 2_000);
    return () => window.clearInterval(timer);
  }, [refresh, studio]);
  const choose = async (file: File) => {
    if (file.size < 1 || file.size > MAX_UPLOAD_BYTES) {
      setRefused(true);
      return;
    }
    try {
      const mediaType = mediaTypeFor(file);
      const result = await uploadAttachment.trigger({
        file,
        mediaType
      });
      setRefused(!result.ok);
    } catch {
      setRefused(true);
    }
  };
  const retry = async (attachmentId: string) => {
    try {
      const result = await finalizeAttachment.trigger(attachmentId);
      setRefused(!result.ok);
    } catch {
      setRefused(true);
    }
  };
  const remove = async (attachmentId: string) => {
    try {
      const result = await removeAttachment.trigger(attachmentId);
      setRefused(!result.ok);
    } catch {
      setRefused(true);
    }
  };
  const pending = uploadAttachment.isMutating || finalizeAttachment.isMutating || removeAttachment.isMutating;
  return <AgentOSModuleAttachmentsBase studio={studio ?? undefined} state={projectionState(refused, studio)} pending={pending} labels={{
    title: t("title"),
    upload: t("upload"),
    retry: t("retry"),
    remove: t("remove"),
    refused: t("refused"),
    empty: t("empty"),
    uploaded: t("uploaded"),
    scanning: t("scanning"),
    extracting: t("extracting"),
    embedding: t("embedding"),
    indexing: t("indexing"),
    indexed: t("indexed"),
    complete: t("complete"),
    current: t("current"),
    upcoming: t("upcoming"),
    chunks: count => t("chunks", {
      count
    }),
    refusedStatus: t("refusedStatus"),
    removed: t("removed")
  }} onChoose={file => void choose(file)} onRetry={id => void retry(id)} onRemove={id => void remove(id)} />;
};
