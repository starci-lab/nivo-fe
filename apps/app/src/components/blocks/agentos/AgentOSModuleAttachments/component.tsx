import { useState } from "react"
import { Button, FileDropzone, SurfaceCard, Text } from "@starci/grammar/common"
import { LifecycleStep, QueryNoticeView, type LifecycleStepData, type QueryNoticeViewData } from "@nivo/ui"
import type { AgentosModuleStudio } from "@/modules/api/agentos-module-studio"

/** Resolved copy for the shared attachment lifecycle. */
export type AgentOSModuleAttachmentsLabels = {
    readonly title: string
    readonly upload: string
    readonly retry?: string
    readonly remove: string
    readonly refused: string
    readonly empty?: string
    readonly uploaded: string
    readonly scanning: string
    readonly extracting: string
    readonly embedding: string
    readonly indexing: string
    readonly indexed: string
    readonly complete: string
    readonly current: string
    readonly upcoming: string
    readonly refusedStatus: string
    readonly removed: string
}

/** Data and actions drawn by the one studio and solution attachment surface. */
export type AgentOSModuleAttachmentsViewProps = {
    readonly state: "attachments"
    readonly props: {
        readonly studio?: Pick<AgentosModuleStudio, "attachments">
        readonly status: "loading" | "refused" | "failed" | "ready"
        readonly notice?: QueryNoticeViewData
        readonly pending: boolean
        readonly labels: AgentOSModuleAttachmentsLabels
    }
    readonly on: {
        readonly onChoose: (file: File) => void
        readonly onRetry?: (id: string) => void
        readonly onRemove: (id: string) => void
        readonly onRetryNotice?: () => void
        readonly chunks: (count: number) => string
    }
}

const lifecycleState = (index: number, active: number): LifecycleStepData["state"] => {
    if (index < active) return "done"
    return index === active ? "current" : "upcoming"
}

const lifecycleStateLabel = (index: number, active: number, labels: AgentOSModuleAttachmentsLabels): string => {
    if (index < active) return labels.complete
    return index === active ? labels.current : labels.upcoming
}

/** Draw quarantined file evidence with explicit scan outcomes for both module scopes. */
export const AgentOSModuleAttachmentsBase = (props: AgentOSModuleAttachmentsViewProps) => {
    const { studio, status, notice, pending, labels } = props.props
    const { onChoose, onRetry, onRemove, onRetryNotice, chunks } = props.on
    const [filePickerRevision, setFilePickerRevision] = useState(0)
    if (status === "failed")
        return (
            <SurfaceCard label={labels.title}>
                <div>
                    {notice === undefined || onRetryNotice === undefined ? null : (
                        <QueryNoticeView props={notice} on={{ retry: onRetryNotice }} />
                    )}
                </div>
            </SurfaceCard>
        )
    if (status === "refused")
        return (
            <SurfaceCard label={labels.title}>
                <div>
                    <Text size="sm" tone="muted">
                        {labels.refused}
                    </Text>
                </div>
            </SurfaceCard>
        )
    const rows =
        status === "loading"
            ? [
                  {
                      id: "loading",
                      fileName: labels.title,
                      mediaType: "",
                      sizeBytes: 0,
                      status: "scanning" as const,
                  },
              ]
            : (studio?.attachments ?? [])
    const stageLabels = [
        labels.uploaded,
        labels.scanning,
        labels.extracting,
        labels.embedding,
        labels.indexing,
        labels.indexed,
    ]
    const stageOf = (file: (typeof rows)[number]) => {
        if (!("ingestionStatus" in file)) return 1
        return (
            {
                pending: 0,
                scanning: 1,
                extracting: 2,
                embedding: 3,
                indexing: 4,
                indexed: 5,
                refused: 1,
                removed: 5,
            } as const
        )[file.ingestionStatus]
    }
    return (
        <SurfaceCard label={labels.title}>
            <div>
                {rows.map((file) => {
                    const active = stageOf(file)
                    const stages: ReadonlyArray<LifecycleStepData> = stageLabels.map((label, index) => ({
                        ordinal: String(index + 1),
                        label,
                        state: lifecycleState(index, active),
                        stateLabel: lifecycleStateLabel(index, active, labels),
                    }))
                    const ingestionStatus = "ingestionStatus" in file ? file.ingestionStatus : file.status
                    const refused = ingestionStatus === "refused"
                    const chunkLabel = "chunkCount" in file && file.chunkCount > 0 ? chunks(file.chunkCount) : ""
                    const caption = [file.mediaType || "—", chunkLabel].filter(Boolean).join(" · ")
                    return (
                        <div key={file.id}>
                            <div>
                                <div>
                                    <Text size="sm" weight="semibold" isSkeleton={status === "loading"}>
                                        {file.fileName}
                                    </Text>
                                    <Text size="xs" tone="muted" isSkeleton={status === "loading"}>
                                        {caption}
                                    </Text>
                                </div>
                                {refused && labels.retry !== undefined && onRetry !== undefined ? (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        isDisabled={pending}
                                        onPress={() => onRetry(file.id)}
                                    >
                                        {labels.retry}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        isDisabled={pending}
                                        isSkeleton={status === "loading"}
                                        onPress={() => onRemove(file.id)}
                                    >
                                        {labels.remove}
                                    </Button>
                                )}
                            </div>
                            <div>
                                {stages.map((step) => (
                                    <LifecycleStep key={step.ordinal} props={step} isLoading={status === "loading"} />
                                ))}
                            </div>
                        </div>
                    )
                })}
                <FileDropzone
                    key={filePickerRevision}
                    accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                    label={labels.upload}
                    isLabelHidden
                    prompt={labels.upload}
                    hideFileList
                    isDisabled={pending}
                    onFilesChange={(files) => {
                        const file = files[0]
                        if (file !== undefined) onChoose(file)
                        setFilePickerRevision((revision) => revision + 1)
                    }}
                />
            </div>
        </SurfaceCard>
    )
}
