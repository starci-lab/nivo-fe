import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { SelectionList } from "."

describe("SelectionList", () => {
    it("keeps one selected destination and refuses disabled activation", async () => {
        const activate = vi.fn()
        const user = userEvent.setup()
        render(<SelectionList props={{
            label: "Console navigation",
            selectedKey: "overview",
            groups: [{ id: "main", items: [
                { id: "overview", label: "Overview" },
                { id: "apps", label: "Apps" },
                { id: "servers", label: "Servers", status: "Unavailable", isDisabled: true },
            ] }],
        }} on={{ activate }} />)

        expect(screen.getByRole("option", { name: "Overview" })).toHaveAttribute("aria-selected", "true")
        await user.click(screen.getByRole("option", { name: "ServersUnavailable" }))
        expect(activate).not.toHaveBeenCalled()
        await user.click(screen.getByRole("option", { name: "Apps" }))
        expect(activate).toHaveBeenCalledWith("apps")
    })
})
