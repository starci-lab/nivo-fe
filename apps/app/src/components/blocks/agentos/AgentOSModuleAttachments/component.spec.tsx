import { fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import enMessages from "../../../../messages/en.json"
import viMessages from "../../../../messages/vi.json"
import type { AgentosModuleStudio } from "@/modules/api/agentos-module-studio"
import { AgentOSModuleAttachmentsBase } from "./component"

const labels = {
    title: "Documents",
    upload: enMessages.console.agentos.modules.studio.attachments.upload,
    retry: "Retry scan",
    remove: "Remove document",
    refused: "Unavailable",
    empty: "No documents",
    uploaded: "Uploaded",
    scanning: "Scanning",
    extracting: "Extracting",
    embedding: "Embedding",
    indexing: "Indexing",
    indexed: "Indexed",
    complete: "Complete",
    current: "Current",
    upcoming: "Upcoming",
    refusedStatus: "Refused",
    removed: "Removed",
}

const props = {
    state: "attachments" as const,
    props: {
        pending: false,
        labels,
    },
    on: {
        onChoose: vi.fn(),
        onRemove: vi.fn(),
        chunks: (count: number) => `${count} chunks`,
    },
}

describe("AgentOSModuleAttachmentsBase", () => {
    it("draws upload lifecycle and adaptive intake without source requests", () => {
        const attachments = renderToStaticMarkup(
            <AgentOSModuleAttachmentsBase
                {...props}
                props={{ ...props.props, status: "loading" }}
                on={{ ...props.on, chunks: (count) => `${count} chunks` }}
            />,
        )
        expect(attachments).toContain("Documents")
    })

    it("reports collection and upload actions", () => {
        const choose = vi.fn()
        const remove = vi.fn()
        const studio: Pick<AgentosModuleStudio, "attachments"> = {
            attachments: [
                {
                    id: "attachment-1",
                    fileName: "brief.pdf",
                    mediaType: "application/pdf",
                    sizeBytes: 128,
                    status: "refused",
                    ingestionStatus: "refused",
                    detectedMediaType: null,
                    sha256: null,
                    chunkCount: 0,
                    indexedAt: null,
                    retrievalRemovedAt: null,
                    objectDeletionStatus: "retained",
                    objectDeletionDueAt: null,
                    failureCode: "ATTACHMENT_REFUSED",
                },
            ],
        }
        const attachments = render(
            <AgentOSModuleAttachmentsBase
                state="attachments"
                props={{
                    studio,
                    status: "ready",
                    pending: false,
                    labels,
                }}
                on={{ onChoose: choose, onRemove: remove, chunks: (count) => `${count} chunks` }}
            />,
        )
        fireEvent.click(screen.getByRole("button", { name: labels.remove }))
        const input = screen.getByRole("button", { name: labels.upload })
        expect(input).toHaveAttribute("type", "file")
        const file = new File(["brief"], "brief.pdf", { type: "application/pdf" })
        fireEvent.change(input, { target: { files: [file] } })
        fireEvent.change(screen.getByRole("button", { name: labels.upload }), { target: { files: [file] } })
        expect(remove).toHaveBeenCalledWith("attachment-1")
        expect(choose).toHaveBeenCalledTimes(2)
        attachments.unmount()
    })

    it("exposes the Vietnamese upload name as the file control name", () => {
        const label = viMessages.console.agentos.modules.studio.attachments.upload
        render(
            <AgentOSModuleAttachmentsBase
                {...props}
                props={{ ...props.props, status: "ready", labels: { ...labels, upload: label } }}
                on={{ ...props.on, chunks: (count) => `${count} chunks` }}
            />,
        )
        expect(screen.getByRole("button", { name: label })).toHaveAttribute("type", "file")
    })

    it("exposes the solution attachment picker by its catalog name and accepts the same file again", () => {
        const choose = vi.fn()
        render(
            <AgentOSModuleAttachmentsBase
                {...props}
                props={{ ...props.props, status: "ready" }}
                on={{ ...props.on, onChoose: choose, chunks: (count) => `${count} chunks` }}
            />,
        )

        const picker = screen.getByRole("button", { name: labels.upload })
        expect(picker).toHaveAttribute("type", "file")
        const file = new File(["brief"], "brief.pdf", { type: "application/pdf" })
        fireEvent.change(picker, { target: { files: [file] } })
        fireEvent.change(screen.getByRole("button", { name: labels.upload }), { target: { files: [file] } })
        expect(choose).toHaveBeenCalledTimes(2)
    })

    it("keeps the solution picker Vietnamese name accessible", () => {
        const label = viMessages.console.agentos.modules.studio.attachments.upload
        render(
            <AgentOSModuleAttachmentsBase
                {...props}
                props={{ ...props.props, status: "ready", labels: { ...labels, upload: label } }}
                on={{ ...props.on, chunks: (count) => `${count} chunks` }}
            />,
        )
        expect(screen.getByRole("button", { name: label })).toHaveAttribute("type", "file")
    })

    it("offers retry for a refused attachment", () => {
        const retry = vi.fn()
        const studio: Pick<AgentosModuleStudio, "attachments"> = {
            attachments: [
                {
                    id: "attachment-1",
                    fileName: "brief.pdf",
                    mediaType: "application/pdf",
                    sizeBytes: 128,
                    status: "refused",
                    ingestionStatus: "refused",
                    detectedMediaType: null,
                    sha256: null,
                    chunkCount: 0,
                    indexedAt: null,
                    retrievalRemovedAt: null,
                    objectDeletionStatus: "retained",
                    objectDeletionDueAt: null,
                    failureCode: "ATTACHMENT_REFUSED",
                },
            ],
        }
        render(
            <AgentOSModuleAttachmentsBase
                state="attachments"
                props={{ studio, status: "ready", pending: false, labels }}
                on={{ ...props.on, onRetry: retry }}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: labels.retry }))
        expect(retry).toHaveBeenCalledWith("attachment-1")
    })

    it("shows the solution read failure and retries the attachment query", () => {
        const retry = vi.fn()
        render(
            <AgentOSModuleAttachmentsBase
                state="attachments"
                props={{
                    status: "failed",
                    notice: { message: "Could not read attachments", retryLabel: "Retry read" },
                    pending: false,
                    labels,
                }}
                on={{ ...props.on, onRetryNotice: retry }}
            />,
        )
        fireEvent.click(screen.getByRole("button", { name: "Retry read" }))
        expect(retry).toHaveBeenCalledTimes(1)
    })
})
