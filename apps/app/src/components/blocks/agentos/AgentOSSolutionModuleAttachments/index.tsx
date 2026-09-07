"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useMutateAgentosModuleAttachmentUploadSwr, useMutateFinalizeAgentosModuleAttachmentSwr, useMutateRemoveAgentosModuleAttachmentSwr, useQueryMyAgentosCustomModuleStudioSwr } from "@/hooks";
import { nivoQueryData } from "@/modules/query";
import { AgentOSSolutionModuleAttachmentsBase } from "./component";

type IndexedAttachment = {
  readonly attachmentId: string;
  readonly sha256: string;
};
type AgentOSSolutionModuleAttachmentsProps = {
  readonly workspaceId: string;
  readonly installationId: string;
  readonly onIndexedAttachmentsChange: (attachments: ReadonlyArray<IndexedAttachment>) => void;
};
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const mediaTypeFor = (file: File): string => {
  if (file.type) return file.type;
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (lower.endsWith(".md")) return "text/markdown";
  return "text/plain";
};

/** Upload and poll indexed evidence directly against one ready built-in installation. */
export const AgentOSSolutionModuleAttachments = (props: AgentOSSolutionModuleAttachmentsProps) => {
  const { workspaceId, installationId, onIndexedAttachmentsChange } = props;
  const t = useTranslations("console.agentos.modules.studio.attachments");
  const query = useQueryMyAgentosCustomModuleStudioSwr(workspaceId, installationId);
  const studio = nivoQueryData(query.data);
  const upload = useMutateAgentosModuleAttachmentUploadSwr(workspaceId, installationId);
  const finalize = useMutateFinalizeAgentosModuleAttachmentSwr(workspaceId, installationId);
  const remove = useMutateRemoveAgentosModuleAttachmentSwr(workspaceId, installationId);
  const [refused, setRefused] = useState(false);
  const indexed = useMemo(() => studio?.attachments.flatMap(attachment => attachment.ingestionStatus === "indexed" && attachment.sha256 !== null
    ? [{ attachmentId: attachment.id, sha256: attachment.sha256 }]
    : []) ?? [], [studio]);
  useEffect(() => onIndexedAttachmentsChange(indexed), [indexed, onIndexedAttachmentsChange]);
  useEffect(() => {
    if (!studio?.attachments.some(attachment => ["scanning", "extracting", "embedding", "indexing"].includes(attachment.ingestionStatus))) return;
    const timer = window.setInterval(() => void query.mutate(), 2_000);
    return () => window.clearInterval(timer);
  }, [query, studio]);
  const choose = async (file: File) => {
    if (file.size < 1 || file.size > MAX_UPLOAD_BYTES) {
      setRefused(true);
      return;
    }
    try {
      const result = await upload.trigger({ file, mediaType: mediaTypeFor(file) });
      setRefused(!result.ok);
      if (result.ok) await query.mutate();
    } catch {
      setRefused(true);
    }
  };
  const retry = async (attachmentId: string) => {
    try {
      const result = await finalize.trigger(attachmentId);
      setRefused(!result.ok);
      if (result.ok) await query.mutate();
    } catch {
      setRefused(true);
    }
  };
  const removeAttachment = async (attachmentId: string) => {
    try {
      const result = await remove.trigger(attachmentId);
      setRefused(!result.ok);
      if (result.ok) await query.mutate();
    } catch {
      setRefused(true);
    }
  };
  const pending = upload.isMutating || finalize.isMutating || remove.isMutating;
  return <AgentOSSolutionModuleAttachmentsBase
    studio={studio ?? undefined}
    state={refused ? "refused" : query.data === undefined ? "loading" : "ready"}
    pending={pending}
    labels={{
      title: t("title"), upload: t("upload"), retry: t("retry"), remove: t("remove"), refused: t("refused"), empty: t("empty"),
      uploaded: t("uploaded"), scanning: t("scanning"), extracting: t("extracting"), embedding: t("embedding"), indexing: t("indexing"), indexed: t("indexed"),
      complete: t("complete"), current: t("current"), upcoming: t("upcoming"), chunks: count => t("chunks", { count }), refusedStatus: t("refusedStatus"), removed: t("removed")
    }}
    onChoose={file => void choose(file)}
    onRetry={attachmentId => void retry(attachmentId)}
    onRemove={attachmentId => void removeAttachment(attachmentId)}
  />;
};
