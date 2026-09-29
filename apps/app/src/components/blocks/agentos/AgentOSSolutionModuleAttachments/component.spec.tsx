import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import enMessages from "../../../../messages/en.json"
import viMessages from "../../../../messages/vi.json"
import { AgentOSSolutionModuleAttachmentsBase } from "./component"

const labels = {
    title: "Documents",
    upload: enMessages.console.agentos.modules.studio.attachments.upload,
    remove: "Remove document",
    refused: "Unavailable",
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

describe("AgentOSSolutionModuleAttachmentsBase", () => {
    it("exposes the grammar file picker by its catalog name and accepts the same file again", () => {
        const choose = vi.fn()
        render(
            <AgentOSSolutionModuleAttachmentsBase
                state="attachments"
                props={{ status: "ready", pending: false, labels }}
                on={{
                    onChoose: choose,
                    onRemove: vi.fn(),
                    onRetryNotice: vi.fn(),
                    chunks: (count) => `${count} chunks`,
                }}
            />,
        )

        const picker = screen.getByRole("button", { name: labels.upload })
        expect(picker).toHaveAttribute("type", "file")
        const file = new File(["brief"], "brief.pdf", { type: "application/pdf" })
        fireEvent.change(picker, { target: { files: [file] } })
        fireEvent.change(screen.getByRole("button", { name: labels.upload }), { target: { files: [file] } })
        expect(choose).toHaveBeenCalledTimes(2)
    })

    it("keeps the Vietnamese catalog name accessible on the picker", () => {
        render(
            <AgentOSSolutionModuleAttachmentsBase
                state="attachments"
                props={{
                    status: "ready",
                    pending: false,
                    labels: { ...labels, upload: viMessages.console.agentos.modules.studio.attachments.upload },
                }}
                on={{
                    onChoose: vi.fn(),
                    onRemove: vi.fn(),
                    onRetryNotice: vi.fn(),
                    chunks: (count) => `${count} chunks`,
                }}
            />,
        )
        expect(
            screen.getByRole("button", { name: viMessages.console.agentos.modules.studio.attachments.upload }),
        ).toHaveAttribute("type", "file")
    })
})
