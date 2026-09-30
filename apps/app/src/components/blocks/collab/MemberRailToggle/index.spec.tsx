import { expectNoA11yViolations } from "@/testing/axe"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { MemberRailToggle } from "./index"

describe("MemberRailToggle", () => {
    it("keeps its accessible name and toggles the member rail", async () => {
        const onClick = vi.fn()
        const { container } = render(<MemberRailToggle expanded label="Open members (3)" onClick={onClick} />)

        const toggle = screen.getByRole("button", { name: "Open members (3)" })
        expect(toggle).toBeInTheDocument()
        fireEvent.click(toggle)
        expect(onClick).toHaveBeenCalledOnce()
        await expectNoA11yViolations(container)
    })
})
