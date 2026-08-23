import { Button, SurfaceCard, Text, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import type { AgentosModuleStudio } from "@/modules/api/console"

/** Attachment lifecycle rows and their bounded upload/removal actions. */
export type AgentOSModuleAttachmentsViewProps = {
    readonly studio?: AgentosModuleStudio
    readonly state: "loading" | "refused" | "ready"
    readonly pending: boolean
    readonly labels: { readonly title: string, readonly upload: string, readonly remove: string, readonly refused: string, readonly empty: string, readonly scanning: string }
    readonly onChoose: (file: File) => void
    readonly onRemove: (id: string) => void
}

/** Draw quarantined file evidence with explicit scan outcomes. */
export const AgentOSModuleAttachmentsBase = ({ studio, state, pending, labels, onChoose, onRemove }: AgentOSModuleAttachmentsViewProps) => {
    if (state === "refused") return <SurfaceCard props={{ label: labels.title }} contract="body-with-refusal-note" render={defineContractComponent("body-with-refusal-note", { note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: labels.refused, size: "sm", tone: "muted" }} />) })} />
    const rows = state === "loading" ? [{ id: "loading", fileName: labels.title, mediaType: "", sizeBytes: 0, status: "scanning" as const }] : (studio?.attachments ?? [])
    return <SurfaceCard props={{ label: labels.title }} contract="module-attachment-list" render={defineContractComponent("module-attachment-list", {
        attachment: rows.map((file) => defineContractComponent("subject-over-muted-caption-with-action", {
            identity: defineContractComponent("subject-over-muted-caption", {
                subject: defineLeafComponent("text", {}, () => <Text props={{ content: file.fileName, size: "sm", weight: "semibold" }} isLoading={state === "loading"} />),
                caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: `${file.mediaType} · ${file.status}`, size: "xs" }} isLoading={state === "loading"} />),
            }),
            action: defineLeafComponent("button", {}, () => <Button props={{ label: labels.remove, variant: "ghost", size: "sm", disabled: pending }} on={{ press: () => onRemove(file.id) }} isLoading={state === "loading"} />),
        })),
        upload: defineLeafComponent("button", {}, () => <label data-tier="leaf" data-component="FileUpload"><input type="file" hidden disabled={pending} onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file !== undefined) onChoose(file) }} /><Button props={{ label: labels.upload, variant: "secondary", isPending: pending }} /></label>),
        ...(rows.length === 0 ? { notice: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: labels.empty, size: "xs" }} />) } : {}),
    })} />
}

/** Source-level tier marker for the pure attachments block. */
export const meta = { shape: "block", world: "pure" } as const
