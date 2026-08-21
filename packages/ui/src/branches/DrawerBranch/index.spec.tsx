import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DrawerBranch } from "."

describe("DrawerBranch", () => {
    it("opens and closes the right-edge drawer through its product controls", async () => {
        render(<DrawerBranch triggerLabel="Menu" title="Console" closeLabel="Close" content={<p>Destinations</p>} />)
        fireEvent.click(screen.getByRole("button", { name: "Menu" }))
        expect(await screen.findByRole("dialog")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Close" }))
        expect(screen.queryByText("Destinations")).not.toBeInTheDocument()
    })
})
