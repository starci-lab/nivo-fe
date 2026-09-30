import { useContext, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import {
    useMutateAgentosModuleAttachmentUploadSwr,
    useMutateFinalizeAgentosModuleAttachmentSwr,
    useMutateRemoveAgentosModuleAttachmentSwr,
    useQueryMyAgentosCustomModuleStudioSwr,
    useQueryNoticeData,
} from "@/hooks"
import { AgentOSModuleStudioProjectionContext } from "@/modules/agentos/module-studio-projection"
import { nivoQueryReading } from "@/modules/query"
import type { AgentosModuleStudio } from "@/modules/api/agentos-module-studio"
import { AgentOSModuleAttachmentsBase, type AgentOSModuleAttachmentsBaseProps } from "./component"

type IndexedAttachment = {
    readonly attachmentId: string
    readonly sha256: string
}

/** The supported attachment sources and their scope-specific identity. */
type AgentOSModuleAttachmentsProps =
    | {
          readonly scope: "studio"
          readonly workspaceId: string
          readonly moduleId: string
      }
    | {
          readonly scope: "solution"
          readonly workspaceId: string
          readonly installationId: string
          readonly onIndexedAttachmentsChange: (attachments: ReadonlyArray<IndexedAttachment>) => void
      }

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024

const mediaTypeFor = (file: File): string => {
    if (file.type) return file.type
    const lower = file.name.toLowerCase()
    if (lower.endsWith(".pdf")) return "application/pdf"
    if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    if (lower.endsWith(".md")) return "text/markdown"
    return "text/plain"
}

const useAttachmentCopy = () => {
    const t = useTranslations("console.agentos.modules.studio.attachments")
    return {
        labels: {
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
            refusedStatus: t("refusedStatus"),
            removed: t("removed"),
        },
        chunks: (count: number) => t("chunks", { count }),
    }
}

const useAttachmentActions = (
    workspaceId: string,
    moduleId: string,
    refreshAfterSuccess?: () => Promise<unknown>,
) => {
    const upload = useMutateAgentosModuleAttachmentUploadSwr(workspaceId, moduleId)
    const finalize = useMutateFinalizeAgentosModuleAttachmentSwr(workspaceId, moduleId)
    const remove = useMutateRemoveAgentosModuleAttachmentSwr(workspaceId, moduleId)
    const [refused, setRefused] = useState(false)

    const run = async (action: () => Promise<{ readonly ok: boolean }>): Promise<void> => {
        try {
            const result = await action()
            setRefused(!result.ok)
            if (result.ok) await refreshAfterSuccess?.()
        } catch {
            setRefused(true)
        }
    }
    const onChoose = (file: File) => {
        if (file.size < 1 || file.size > MAX_UPLOAD_BYTES) {
            setRefused(true)
            return
        }
        void run(() => upload.trigger({ file, mediaType: mediaTypeFor(file) }))
    }
    const onRetry = (attachmentId: string) => void run(() => finalize.trigger(attachmentId))
    const onRemove = (attachmentId: string) => void run(() => remove.trigger(attachmentId))

    return {
        refused,
        pending: upload.isMutating || finalize.isMutating || remove.isMutating,
        onChoose,
        onRetry,
        onRemove,
    }
}

/** Resolve one attachment scope into the complete props drawn by the presentational twin. */
const useAgentOSModuleAttachmentsView = (
    props: AgentOSModuleAttachmentsProps,
): AgentOSModuleAttachmentsBaseProps => {
    const projection = useContext(AgentOSModuleStudioProjectionContext)
    const workspaceId = props.workspaceId
    const moduleId = props.scope === "studio" ? props.moduleId : props.installationId
    const query = useQueryMyAgentosCustomModuleStudioSwr(workspaceId, moduleId, {
        enabled: props.scope === "solution",
        pollAttachments: props.scope === "solution",
    })
    const reading = nivoQueryReading(query.data)
    const noticeOf = useQueryNoticeData()
    const copy = useAttachmentCopy()
    const studio =
        props.scope === "studio"
            ? projection?.studio
            : reading.status === "ready"
              ? reading.data
              : undefined
    const refreshAfterSuccess = props.scope === "solution" ? () => query.mutate() : undefined
    const actions = useAttachmentActions(workspaceId, moduleId, refreshAfterSuccess)
    const onIndexedAttachmentsChange = props.scope === "solution" ? props.onIndexedAttachmentsChange : undefined

    useEffect(() => {
        if (onIndexedAttachmentsChange === undefined) return
        const indexed =
            studio?.attachments.flatMap((attachment) =>
                attachment.ingestionStatus === "indexed" && attachment.sha256 !== null
                    ? [{ attachmentId: attachment.id, sha256: attachment.sha256 }]
                    : [],
            ) ?? []
        onIndexedAttachmentsChange(indexed)
    }, [studio, onIndexedAttachmentsChange])

    if (props.scope === "studio" && projection === null) {
        throw new Error("AgentOSModuleStudioProjectionProvider is required")
    }

    const status: AgentOSModuleAttachmentsBaseProps["props"]["status"] =
        actions.refused
            ? "refused"
            : props.scope === "studio"
              ? studio === undefined
                  ? "loading"
                  : "ready"
              : reading.status === "failed"
                ? "failed"
                : reading.status === "resting"
                  ? "loading"
                  : "ready"

    return {
        state: "attachments",
        props: {
            studio,
            status,
            notice: props.scope === "solution" && reading.status === "failed" ? noticeOf(reading) : undefined,
            pending: actions.pending,
            labels: copy.labels,
        },
        on: {
            onChoose: actions.onChoose,
            onRetry: actions.onRetry,
            onRemove: actions.onRemove,
            onRetryNotice: props.scope === "solution" ? () => void query.mutate() : undefined,
            chunks: copy.chunks,
        },
    }
}

/** Upload, scan, retry, and remove module attachments from either owned module scope. */
export const AgentOSModuleAttachments = (props: AgentOSModuleAttachmentsProps) => {
    const view = useAgentOSModuleAttachmentsView(props)
    return <AgentOSModuleAttachmentsBase {...view} />
}
