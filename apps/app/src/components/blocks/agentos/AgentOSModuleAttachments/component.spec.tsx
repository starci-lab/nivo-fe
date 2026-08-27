import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AgentOSModuleAttachmentsBase, meta } from "./component"

describe("AgentOSModuleAttachments pure twin", () => {
    it("keeps the approved pure block boundary", () => {
        expect(meta).toEqual({ shape: "block", world: "pure" })
    })

    it("keeps file selection on one named button without nested interactive controls", () => {
        const onChoose = vi.fn()
        const view = render(<AgentOSModuleAttachmentsBase
            state="ready"
            pending={false}
            labels={{
                title: "Knowledge files", upload: "Upload file", retry: "Retry", remove: "Remove", refused: "Refused", empty: "No files",
                uploaded: "Uploaded", scanning: "Scanning", extracting: "Extracting", embedding: "Embedding", indexing: "Indexing", indexed: "Indexed",
                complete: "Complete", current: "Current", upcoming: "Upcoming", chunks: (count) => `${count} chunks`, refusedStatus: "Refused", removed: "Removed",
            }}
            onChoose={onChoose}
            onRemove={vi.fn()}
        />)
        const button = screen.getByRole("button", { name: "Upload file" })
        const input = view.container.querySelector("input[type='file']")

        expect(button.closest("label")).toBeNull()
        expect(input).toHaveAttribute("accept", expect.stringContaining(".md"))
        const file = new File(["support"], "support.md", { type: "text/markdown" })
        fireEvent.change(input as HTMLInputElement, { target: { files: [file] } })
        expect(onChoose).toHaveBeenCalledWith(file)
    })
})
