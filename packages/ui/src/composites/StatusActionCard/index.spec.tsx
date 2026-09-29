import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { StatusActionCard } from "./"

describe("StatusActionCard", () => {
    const base = {
        id: "sync",
        title: "Sync",
        description: "Keeps data current",
        statusLabel: "Ready",
        statusTone: "success" as const,
        actionLabel: "Run",
    }

    it("renders an in-page action and optional detail", () => {
        const press = vi.fn()
        render(<StatusActionCard props={{ ...base, detail: "Last run today" }} on={{ press }} />)
        expect(screen.getByText("Last run today")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Run" }))
        expect(press).toHaveBeenCalledTimes(1)
    })

    it("uses an external action link only when enabled", () => {
        const { rerender } = render(
            <StatusActionCard props={{ ...base, actionHref: "https://example.com", actionTarget: "_blank" }} />,
        )
        expect(screen.getByRole("link", { name: "Run" })).toHaveAttribute("href", "https://example.com")
        rerender(<StatusActionCard props={{ ...base, actionHref: "https://example.com", disabled: true }} />)
        expect(screen.getByRole("button", { name: "Run" })).toBeDisabled()
    })
})
