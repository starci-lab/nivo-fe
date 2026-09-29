import { fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import enMessages from "../../../../messages/en.json"
import viMessages from "../../../../messages/vi.json"
import type { AgentosModuleStudio } from "@/modules/api/agentos-module-studio"
import { AgentOSModuleAttachmentsBase } from "./component"

describe("AgentOSModuleAttachmentsBase", () => {
    it("draws upload lifecycle and adaptive intake without source requests", () => {
        const attachments = renderToStaticMarkup(
            <AgentOSModuleAttachmentsBase
                state="loading"
                props={{
                    pending: false,
                    labels: {
                        title: "Documents",
                        upload: enMessages.console.agentos.modules.studio.attachments.upload,
                        remove: "Remove",
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
                    },
                }}
                on={{ onChoose: vi.fn(), onRemove: vi.fn(), chunks: (count) => `${count} chunks` }}
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
                state="ready"
                props={{
                    studio,
                    pending: false,
                    labels: {
                        title: "Documents",
                        upload: enMessages.console.agentos.modules.studio.attachments.upload,
                        remove: "Remove",
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
                        refusedStatus: "Refused document",
                        removed: "Removed",
                    },
                }}
                on={{ onChoose: choose, onRemove: remove, chunks: (count) => `${count} chunks` }}
            />,
        )
        fireEvent.click(
            screen.getByRole("button", { name: enMessages.console.agentos.modules.studio.attachments.remove }),
        )
        const input = screen.getByRole("button", { name: enMessages.console.agentos.modules.studio.attachments.upload })
        expect(input).toHaveAttribute("type", "file")
        const file = new File(["brief"], "brief.pdf", { type: "application/pdf" })
        fireEvent.change(input, { target: { files: [file] } })
        fireEvent.change(
            screen.getByRole("button", { name: enMessages.console.agentos.modules.studio.attachments.upload }),
            { target: { files: [file] } },
        )
        expect(remove).toHaveBeenCalledWith("attachment-1")
        expect(choose).toHaveBeenCalledTimes(2)
        attachments.unmount()
    })

    it("exposes the Vietnamese upload name as the file control name", () => {
        const label = viMessages.console.agentos.modules.studio.attachments.upload
        render(
            <AgentOSModuleAttachmentsBase
                state="ready"
                props={{
                    pending: false,
                    labels: {
                        title: "Documents",
                        upload: label,
                        remove: "Remove",
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
                    },
                }}
                on={{ onChoose: vi.fn(), onRemove: vi.fn(), chunks: (count) => `${count} chunks` }}
            />,
        )
        expect(screen.getByRole("button", { name: label })).toHaveAttribute("type", "file")
    })
})
