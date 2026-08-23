"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { finalizeAgentosModuleAttachment, myAgentosCustomModuleStudio, prepareAgentosModuleAttachmentUpload, removeAgentosModuleAttachment, resolveCoreApiCapabilityUrl, type AgentosModuleStudio } from "@/modules/api/console"
import { useSession } from "@/modules/auth/session"
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

/** Own attachment preparation, scan handoff and removal for one module. */
export const AgentOSModuleAttachments = ({ workspaceId, moduleId }: AgentOSModuleAttachmentsProps) => {
    const t = useTranslations("console.agentos.modules.studio.attachments")
    const session = useSession()
    const [studio, setStudio] = useState<AgentosModuleStudio | null | undefined>()
    const [pending, setPending] = useState(false)
    const load = useCallback(async () => { const result = await myAgentosCustomModuleStudio(workspaceId, moduleId); setStudio(result.ok ? result.data : null) }, [moduleId, workspaceId])
    useEffect(() => { if (session.state.status === "signed-in") void load() }, [load, session.state.status])
    useEffect(() => {
        if (!studio?.attachments.some((item) => item.status === "scanning" || item.ingestionStatus === "extracting" || item.ingestionStatus === "embedding" || item.ingestionStatus === "indexing")) return
        const timer = window.setInterval(() => void load(), 2_000)
        return () => window.clearInterval(timer)
    }, [load, studio])
    const choose = async (file: File) => {
        if (file.size < 1 || file.size > MAX_UPLOAD_BYTES) { setStudio(null); return }
        setPending(true)
        try {
            const mediaType = mediaTypeFor(file)
            const prepared = await prepareAgentosModuleAttachmentUpload({ agentWorkspaceId: workspaceId, moduleId, fileName: file.name, mediaType, sizeBytes: file.size })
            if (!prepared.ok) { setStudio(null); return }
            setStudio(prepared.data)
            const upload = await fetch(resolveCoreApiCapabilityUrl(prepared.data.uploadUrl), { method: prepared.data.uploadMethod, headers: { "content-type": mediaType }, body: file })
            if (!upload.ok) { await load(); return }
            const finalized = await finalizeAgentosModuleAttachment({ agentWorkspaceId: workspaceId, moduleId, attachmentId: prepared.data.attachmentId })
            setStudio(finalized.ok ? finalized.data : null)
        } catch { setStudio(null) }
        finally { setPending(false) }
    }
    const remove = async (attachmentId: string) => { setPending(true); const result = await removeAgentosModuleAttachment({ agentWorkspaceId: workspaceId, moduleId, attachmentId }); if (result.ok) await load(); setPending(false) }
    return <AgentOSModuleAttachmentsBase studio={studio ?? undefined} state={studio === undefined ? "loading" : studio === null ? "refused" : "ready"} pending={pending} labels={{
        title: t("title"), upload: t("upload"), remove: t("remove"), refused: t("refused"), empty: t("empty"),
        uploaded: t("uploaded"), scanning: t("scanning"), extracting: t("extracting"), embedding: t("embedding"), indexing: t("indexing"), indexed: t("indexed"),
        complete: t("complete"), current: t("current"), upcoming: t("upcoming"),
        chunks: (count) => t("chunks", { count }), refusedStatus: t("refusedStatus"), removed: t("removed"),
    }} onChoose={(file) => void choose(file)} onRemove={(id) => void remove(id)} />
}

/** Source-level tier marker for the connected attachments owner. */
export const meta = { shape: "block", world: "connected" } as const
