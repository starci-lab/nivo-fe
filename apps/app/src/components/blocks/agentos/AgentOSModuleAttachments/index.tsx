"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import {
    useAgentOSModuleStudioProjection,
    useMutateAgentosModuleAttachmentUploadSwr,
    useMutateFinalizeAgentosModuleAttachmentSwr,
    useMutateRemoveAgentosModuleAttachmentSwr,
    useQueryMyAgentosCustomModuleStudioSwr,
    useQueryNoticeData,
} from "@/hooks"
import { nivoQueryReading } from "@/modules/query"
import type { AgentosModuleStudio } from "@/modules/api/agentos-module-studio"
import { AgentOSModuleAttachmentsBase, type AgentOSModuleAttachmentsViewProps } from "./component"

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

const projectionState = (
    refused: boolean,
    studio: ReturnType<typeof useAgentOSModuleStudioProjection>["studio"],
): AgentOSModuleAttachmentsViewProps["props"]["status"] => {
    if (refused) return "refused"
    return studio === undefined ? "loading" : "ready"
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

type Attachment = AgentosModuleStudio["attachments"][number]

const studioNeedsPolling = (attachment: Attachment): boolean =>
    attachment.status === "scanning" ||
    attachment.ingestionStatus === "extracting" ||
    attachment.ingestionStatus === "embedding" ||
    attachment.ingestionStatus === "indexing"

const solutionNeedsPolling = (attachment: Attachment): boolean =>
    ["scanning", "extracting", "embedding", "indexing"].includes(attachment.ingestionStatus)

const useAttachmentPolling = (
    studio: AgentosModuleStudio | undefined,
    refresh: () => Promise<unknown>,
    shouldPoll: (attachment: Attachment) => boolean,
) => {
    useEffect(() => {
        if (!studio?.attachments.some(shouldPoll)) return
        const timer = window.setInterval(() => void refresh(), 2_000)
        return () => window.clearInterval(timer)
    }, [refresh, shouldPoll, studio])
}

type AttachmentSurfaceProps = {
    readonly props: AgentOSModuleAttachmentsViewProps["props"]
    readonly on: Omit<AgentOSModuleAttachmentsViewProps["on"], "chunks" | "onRetryNotice">
    readonly onRetryNotice?: () => void
    readonly chunks: (count: number) => string
}

const AttachmentSurface = (props: AttachmentSurfaceProps) => (
    <AgentOSModuleAttachmentsBase
        state="attachments"
        props={props.props}
        on={{
            ...props.on,
            onRetryNotice: props.onRetryNotice,
            chunks: props.chunks,
        }}
    />
)

type StudioAttachmentsProps = Extract<AgentOSModuleAttachmentsProps, { readonly scope: "studio" }>

const StudioAttachments = (props: StudioAttachmentsProps) => {
    const { studio, refresh } = useAgentOSModuleStudioProjection()
    const copy = useAttachmentCopy()
    const actions = useAttachmentActions(props.workspaceId, props.moduleId)
    useAttachmentPolling(studio, refresh, studioNeedsPolling)

    return (
        <AttachmentSurface
            props={{
                studio,
                status: projectionState(actions.refused, studio),
                pending: actions.pending,
                labels: copy.labels,
            }}
            on={{
                onChoose: actions.onChoose,
                onRetry: actions.onRetry,
                onRemove: actions.onRemove,
            }}
            chunks={copy.chunks}
        />
    )
}

type SolutionAttachmentsProps = Extract<AgentOSModuleAttachmentsProps, { readonly scope: "solution" }>

const SolutionAttachments = (props: SolutionAttachmentsProps) => {
    const noticeOf = useQueryNoticeData()
    const query = useQueryMyAgentosCustomModuleStudioSwr(props.workspaceId, props.installationId)
    const reading = nivoQueryReading(query.data)
    /* Keep the notice's source reading separate from the attachment reading used in the view. */
    const failure = nivoQueryReading(query.data)
    const studio = reading.status === "ready" ? reading.data : undefined
    const copy = useAttachmentCopy()
    const actions = useAttachmentActions(props.workspaceId, props.installationId, () => query.mutate())
    const indexed = useMemo(
        () =>
            studio?.attachments.flatMap((attachment) =>
                attachment.ingestionStatus === "indexed" && attachment.sha256 !== null
                    ? [{ attachmentId: attachment.id, sha256: attachment.sha256 }]
                    : [],
            ) ?? [],
        [studio],
    )

    useEffect(() => props.onIndexedAttachmentsChange(indexed), [indexed, props.onIndexedAttachmentsChange])
    const refresh = useCallback(() => query.mutate(), [query])
    useAttachmentPolling(studio, refresh, solutionNeedsPolling)

    return (
        <AttachmentSurface
            props={{
                studio,
                status: actions.refused
                    ? "refused"
                    : reading.status === "failed"
                      ? "failed"
                      : reading.status === "resting"
                        ? "loading"
                        : "ready",
                notice: failure.status === "failed" ? noticeOf(failure) : undefined,
                pending: actions.pending,
                labels: copy.labels,
            }}
            on={{
                onChoose: actions.onChoose,
                onRetry: actions.onRetry,
                onRemove: actions.onRemove,
            }}
            onRetryNotice={() => void query.mutate()}
            chunks={copy.chunks}
        />
    )
}

/** Upload, scan, retry, and remove module attachments from either owned module scope. */
export const AgentOSModuleAttachments = (props: AgentOSModuleAttachmentsProps) =>
    props.scope === "studio" ? <StudioAttachments {...props} /> : <SolutionAttachments {...props} />
