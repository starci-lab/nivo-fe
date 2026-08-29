import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { RouteTabs } from "./"

describe("RouteTabs", () => {
    it("draws one selected underlined tab destination", () => {
        render(<RouteTabs props={{ label: "Module sections", selectedKey: "operate", tabs: [
            { id: "setup", label: "Setup" },
            { id: "operate", label: "Operate" },
        ] }} />)

        expect(screen.getByRole("tablist", { name: "Module sections" })).toBeInTheDocument()
        expect(screen.getByRole("tab", { name: "Operate" })).toHaveAttribute("aria-selected", "true")
        expect(screen.getByRole("tab", { name: "Setup" })).toHaveAttribute("aria-selected", "false")
    })

    it("reports destination selection without exposing scroll-arrow controls", () => {
        const select = vi.fn()
        render(<RouteTabs props={{ label: "Operations view", selectedKey: "customers", tabs: [
            { id: "customers", label: "Customers" },
            { id: "queue", label: "Customer queue" },
        ] }} on={{ select }} />)

        fireEvent.click(screen.getByRole("tab", { name: "Customer queue" }))
        expect(select).toHaveBeenCalledWith("queue")
        expect(screen.queryByRole("button", { name: /scroll tabs/i })).not.toBeInTheDocument()
    })
})