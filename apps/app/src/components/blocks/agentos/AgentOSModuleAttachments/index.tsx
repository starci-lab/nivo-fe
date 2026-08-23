"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { finalizeAgentosModuleAttachment, myAgentosCustomModuleStudio, prepareAgentosModuleAttachmentUpload, removeAgentosModuleAttachment, type AgentosModuleStudio } from "@/modules/api/console"
import { useSession } from "@/modules/auth/session"
import { AgentOSModuleAttachmentsBase } from "./component"

type AgentOSModuleAttachmentsProps = { readonly workspaceId: string, readonly moduleId: string }

/** Own attachment preparation, scan handoff and removal for one module. */
export const AgentOSModuleAttachments = ({ workspaceId, moduleId }: AgentOSModuleAttachmentsProps) => {
    const t = useTranslations("console.agentos.modules.studio.attachments")
    const session = useSession()
    const [studio, setStudio] = useState<AgentosModuleStudio | null | undefined>()
    const [pending, setPending] = useState(false)
    const load = useCallback(async () => { const result = await myAgentosCustomModuleStudio(workspaceId, moduleId); setStudio(result.ok ? result.data : null) }, [moduleId, workspaceId])
    useEffect(() => { if (session.state.status === "signed-in") void load() }, [load, session.state.status])
    const choose = async (file: File) => {
        setPending(true)
        const prepared = await prepareAgentosModuleAttachmentUpload({ agentWorkspaceId: workspaceId, moduleId, fileName: file.name, mediaType: file.type || "application/octet-stream", sizeBytes: file.size })
        if (prepared.ok) {
            const row = prepared.data.attachments.find((item) => item.fileName === file.name && item.status === "uploading")
            if (row !== undefined) { const finalized = await finalizeAgentosModuleAttachment({ agentWorkspaceId: workspaceId, moduleId, attachmentId: row.id }); setStudio(finalized.ok ? finalized.data : null) }
        } else setStudio(null)
        setPending(false)
    }
    const remove = async (attachmentId: string) => { setPending(true); const result = await removeAgentosModuleAttachment({ agentWorkspaceId: workspaceId, moduleId, attachmentId }); if (result.ok) await load(); setPending(false) }
    return <AgentOSModuleAttachmentsBase studio={studio ?? undefined} state={studio === undefined ? "loading" : studio === null ? "refused" : "ready"} pending={pending} labels={{ title: t("title"), upload: t("upload"), remove: t("remove"), refused: t("refused"), empty: t("empty"), scanning: t("scanning") }} onChoose={(file) => void choose(file)} onRemove={(id) => void remove(id)} />
}

/** Source-level tier marker for the connected attachments owner. */
export const meta = { shape: "block", world: "connected" } as const
