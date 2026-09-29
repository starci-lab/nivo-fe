import { fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
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
                        upload: "Upload",
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
        const studio = {
            attachments: [
                {
                    id: "attachment-1",
                    fileName: "brief.pdf",
                    mediaType: "application/pdf",
                    sizeBytes: 128,
                    status: "refused",
                    ingestionStatus: "refused",
                    chunkCount: 0,
                },
            ],
        } as unknown as AgentosModuleStudio
        const attachments = render(
            <AgentOSModuleAttachmentsBase
                state="ready"
                props={{
                    studio,
                    pending: false,
                    labels: {
                        title: "Documents",
                        upload: "Upload",
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
        fireEvent.click(screen.getByRole("button", { name: "Remove" }))
        const input = attachments.container.querySelector('input[type="file"]')
        expect(input).not.toBeNull()
        fireEvent.change(input!, { target: { files: [new File(["brief"], "brief.pdf", { type: "application/pdf" })] } })
        expect(remove).toHaveBeenCalledWith("attachment-1")
        expect(choose).toHaveBeenCalledTimes(1)
        attachments.unmount()
    })
})
