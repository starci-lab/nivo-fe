import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { MarkdownComponent } from "."

describe("MarkdownComponent", () => {
    it("renders headings and text without a duplicate-key warning when blocks repeat", () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => undefined)
        render(<MarkdownComponent markdown={"# Title\n\nsame\n\nsame\n\n## Sub"} />)
        expect(screen.getByRole("heading", { level: 2, name: "Title" })).toBeInTheDocument()
        expect(screen.getAllByText("same")).toHaveLength(2)
        expect(screen.getByRole("heading", { level: 3, name: "Sub" })).toBeInTheDocument()
        expect(error).not.toHaveBeenCalled()
        error.mockRestore()
    })
})
