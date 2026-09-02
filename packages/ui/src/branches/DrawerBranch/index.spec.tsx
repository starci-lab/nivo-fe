import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DrawerBranch } from "."

const Destinations = () => <p>Destinations</p>

describe("DrawerBranch", () => {
    it("opens and closes the right-edge drawer through its product controls", async () => {
        render(<DrawerBranch triggerLabel="Menu" title="Console" closeLabel="Close" content={Destinations} contentProps={{}} />)
        fireEvent.click(screen.getByRole("button", { name: "Menu" }))
        expect(await screen.findByRole("dialog")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Close" }))
        expect(screen.queryByText("Destinations")).not.toBeInTheDocument()
    })

    it("lets action-aware content close only after its successful command", async () => {
        render(<DrawerBranch
            triggerLabel="Menu"
            title="Console"
            closeLabel="Close"
            renderContent={(close) => <button type="button" onClick={close}>Open destination</button>}
        />)

        fireEvent.click(screen.getByRole("button", { name: "Menu" }))
        expect(await screen.findByRole("dialog")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Open destination" }))
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
})
