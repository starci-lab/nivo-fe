import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { HelmComponentStatusTable } from "./HelmComponentStatusTable"
import { OperationActionRail } from "./OperationActionRail"
import { StatusActionCard } from "./StatusActionCard"

describe("StatusActionCard", () => {
    const base = { id: "sync", title: "Sync", description: "Keeps data current", statusLabel: "Ready", statusTone: "success" as const, actionLabel: "Run" }

    it("renders an in-page action and optional detail", () => {
        const press = vi.fn()
        render(<StatusActionCard props={{ ...base, detail: "Last run today" }} on={{ press }} />)
        expect(screen.getByText("Last run today")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Run" }))
        expect(press).toHaveBeenCalledTimes(1)
    })

    it("uses an external action link only when enabled", () => {
        const { rerender } = render(<StatusActionCard props={{ ...base, actionHref: "https://example.com", actionTarget: "_blank" }} />)
        expect(screen.getByRole("link", { name: "Run" })).toHaveAttribute("href", "https://example.com")
        rerender(<StatusActionCard props={{ ...base, actionHref: "https://example.com", disabled: true }} />)
        expect(screen.getByRole("button", { name: "Run" })).toBeDisabled()
    })
})

describe("OperationActionRail", () => {
    it("preserves action order and reports the selected id", () => {
        const select = vi.fn()
        render(<OperationActionRail props={{ id: "ops", actions: [{ id: "retry", label: "Retry" }, { id: "cancel", label: "Cancel", disabled: true }] }} on={{ select }} />)
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(select).toHaveBeenCalledWith("retry")
        expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled()
    })
})

describe("HelmComponentStatusTable", () => {
    const row = { id: "api", name: "API", detail: "Healthy", kind: "service", status: "Ready", statusTone: "success" as const, resources: "2 pods" }

    it("renders each component's public status fields", () => {
        render(<HelmComponentStatusTable props={{ id: "release", rows: [row] }} />)
        expect(screen.getByText("API")).toBeInTheDocument()
        expect(screen.getByText("Healthy")).toBeInTheDocument()
        expect(screen.getByText("2 pods")).toBeInTheDocument()
        expect(screen.getByText("Ready")).toBeInTheDocument()
    })

    it("creates three loading rows without exposing stale values", () => {
        render(<HelmComponentStatusTable props={{ id: "release", rows: [row] }} isLoading />)
        expect(screen.queryByText("API")).not.toBeInTheDocument()
        expect(document.querySelectorAll("[data-loading='true']").length).toBeGreaterThan(3)
    })
})
