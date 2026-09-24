import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ChangelogEntryRow } from "./"

describe("ChangelogEntryRow", () => {
    it("uses an actionable title only when a handler is supplied", () => {
        const open = vi.fn()
        const { rerender } = render(<ChangelogEntryRow props={{ id: "1", dateLabel: "Jan 1", categoryLabel: "Release", title: "New API", body: "Details", isAction: true }} on={{ open }} />)
        fireEvent.click(screen.getByRole("button", { name: "New API" }))
        expect(open).toHaveBeenCalledTimes(1)
        rerender(<ChangelogEntryRow props={{ id: "1", dateLabel: "Jan 1", title: "New API", isAction: true }} />)
        expect(screen.queryByRole("button", { name: "New API" })).not.toBeInTheDocument()
        expect(screen.getByText("New API")).toBeInTheDocument()
    })
})