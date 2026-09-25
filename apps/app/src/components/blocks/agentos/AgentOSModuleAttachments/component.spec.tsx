import { fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import type { AgentosModuleStudio } from "@/modules/api/console"
import { AgentOSModuleAttachmentsBase } from "./component"

describe("AgentOSModuleAttachmentsBase", () => {
    it("draws upload lifecycle and adaptive intake without source requests", () => {
        const attachments = renderToStaticMarkup(<AgentOSModuleAttachmentsBase
            state="loading"
            pending={false}
            labels={{ title: "Documents", upload: "Upload", remove: "Remove", refused: "Unavailable", empty: "No documents", uploaded: "Uploaded", scanning: "Scanning", extracting: "Extracting", embedding: "Embedding", indexing: "Indexing", indexed: "Indexed", complete: "Complete", current: "Current", upcoming: "Upcoming", chunks: (count) => `${count} chunks`, refusedStatus: "Refused", removed: "Removed" }}
            onChoose={vi.fn()}
            onRemove={vi.fn()}
        />)
        expect(attachments).toContain("Documents")
    })

    it("reports collection and upload actions", () => {
        const choose = vi.fn()
        const remove = vi.fn()
        const studio = { attachments: [{ id: "attachment-1", fileName: "brief.pdf", mediaType: "application/pdf", sizeBytes: 128, status: "refused", ingestionStatus: "refused", chunkCount: 0 }] } as unknown as AgentosModuleStudio
        const attachments = render(<AgentOSModuleAttachmentsBase
            studio={studio}
            state="ready"
            pending={false}
            labels={{ title: "Documents", upload: "Upload", remove: "Remove", refused: "Unavailable", empty: "No documents", uploaded: "Uploaded", scanning: "Scanning", extracting: "Extracting", embedding: "Embedding", indexing: "Indexing", indexed: "Indexed", complete: "Complete", current: "Current", upcoming: "Upcoming", chunks: (count) => `${count} chunks`, refusedStatus: "Refused document", removed: "Removed" }}
            onChoose={choose}
            onRemove={remove}
        />)
        fireEvent.click(screen.getByRole("button", { name: "Remove" }))
        const input = attachments.container.querySelector('input[type="file"]')
        expect(input).not.toBeNull()
        fireEvent.change(input!, { target: { files: [new File(["brief"], "brief.pdf", { type: "application/pdf" })] } })
        expect(remove).toHaveBeenCalledWith("attachment-1")
        expect(choose).toHaveBeenCalledTimes(1)
        attachments.unmount()

    })
})