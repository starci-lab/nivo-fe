import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { OperationActionRail } from "./"

describe("OperationActionRail", () => {
    it("preserves action order and reports the selected id", () => {
        const select = vi.fn()
        render(<OperationActionRail props={{ id: "ops", actions: [{ id: "retry", label: "Retry" }, { id: "cancel", label: "Cancel", disabled: true }] }} on={{ select }} />)
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(select).toHaveBeenCalledWith("retry")
        expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled()
    })
})