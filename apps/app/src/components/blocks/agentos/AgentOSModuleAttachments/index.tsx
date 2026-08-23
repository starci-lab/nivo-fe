"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { finalizeAgentosModuleAttachment, prepareAgentosModuleAttachmentUpload, removeAgentosModuleAttachment, resolveCoreApiCapabilityUrl } from "@/modules/api/console"
import { useAgentOSModuleStudioProjection } from "@/components/pages/AgentOSModuleStudioPage/component"
import { AgentOSModuleAttachmentsBase } from "./component"

type AgentOSModuleAttachmentsProps = { readonly workspaceId: string, readonly moduleId: string }
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024
const mediaTypeFor = (file: File) => {
    if (file.type) return file.type
    const lower = file.name.toLowerCase()
    if (lower.endsWith(".pdf")) return "application/pdf"
    if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    if (lower.endsWith(".md")) return "text/markdown"
    return "text/plain"
}

/** Own attachment preparation, scan polling, retry and removal over the shared studio projection. */
export const AgentOSModuleAttachments = ({ workspaceId, moduleId }: AgentOSModuleAttachmentsProps) => {
    const t = useTranslations("console.agentos.modules.studio.attachments")
    const { studio, refresh } = useAgentOSModuleStudioProjection()
    const [refused, setRefused] = useState(false)
    const [pending, setPending] = useState(false)
    useEffect(() => {
        if (!studio?.attachments.some((item) => item.status === "scanning" || item.ingestionStatus === "extracting" || item.ingestionStatus === "embedding" || item.ingestionStatus === "indexing")) return
        const timer = window.setInterval(() => void refresh(), 2_000)
        return () => window.clearInterval(timer)
    }, [refresh, studio])
    const choose = async (file: File) => {
        if (file.size < 1 || file.size > MAX_UPLOAD_BYTES) { setRefused(true); return }
        setPending(true)
        try {
            const mediaType = mediaTypeFor(file)
            const prepared = await prepareAgentosModuleAttachmentUpload({ agentWorkspaceId: workspaceId, moduleId, fileName: file.name, mediaType, sizeBytes: file.size })
            if (!prepared.ok) { setRefused(true); return }
            await refresh()
            const upload = await fetch(resolveCoreApiCapabilityUrl(prepared.data.uploadUrl), { method: prepared.data.uploadMethod, headers: { "content-type": mediaType }, body: file })
            if (!upload.ok) { setRefused(true); await refresh(); return }
            const finalized = await finalizeAgentosModuleAttachment({ agentWorkspaceId: workspaceId, moduleId, attachmentId: prepared.data.attachmentId })
            setRefused(!finalized.ok)
            await refresh()
        } catch { setRefused(true) }
        finally { setPending(false) }
    }
    const retry = async (attachmentId: string) => { setPending(true); const result = await finalizeAgentosModuleAttachment({ agentWorkspaceId: workspaceId, moduleId, attachmentId }); setRefused(!result.ok); await refresh(); setPending(false) }
    const remove = async (attachmentId: string) => { setPending(true); const result = await removeAgentosModuleAttachment({ agentWorkspaceId: workspaceId, moduleId, attachmentId }); setRefused(!result.ok); if (result.ok) await refresh(); setPending(false) }
    return <AgentOSModuleAttachmentsBase studio={studio ?? undefined} state={refused || studio === null ? "refused" : studio === undefined ? "loading" : "ready"} pending={pending} labels={{
        title: t("title"), upload: t("upload"), retry: t("retry"), remove: t("remove"), refused: t("refused"), empty: t("empty"),
        uploaded: t("uploaded"), scanning: t("scanning"), extracting: t("extracting"), embedding: t("embedding"), indexing: t("indexing"), indexed: t("indexed"),
        complete: t("complete"), current: t("current"), upcoming: t("upcoming"),
        chunks: (count) => t("chunks", { count }), refusedStatus: t("refusedStatus"), removed: t("removed"),
    }} onChoose={(file) => void choose(file)} onRetry={(id) => void retry(id)} onRemove={(id) => void remove(id)} />
}

/** Source-level tier marker for the connected attachments owner. */
export const meta = { shape: "block", world: "connected" } as const
