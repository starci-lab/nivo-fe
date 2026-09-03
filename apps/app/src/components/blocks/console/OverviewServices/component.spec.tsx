import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { OverviewServicesBase, type OverviewServicesRow } from "./component"

const rows: ReadonlyArray<OverviewServicesRow> = [
    { id: "app-1", name: "reader-app", detail: "reader-app.nivo.dev", statusLabel: "Running", statusTone: "success", actionLabel: "Open", onOpen: vi.fn() },
    { id: "workspace-1", name: "reader workspace", detail: "Agent workspace", statusLabel: "Ready", statusTone: "success", actionLabel: "Open workspace", onOpen: vi.fn() },
]

describe("OverviewServicesBase", () => {
    it("draws one row per owned service, each closing on its own action", () => {
        render(<OverviewServicesBase label="Services" fact="2 answered · nothing degraded" rows={rows} />)

        expect(screen.getByText("reader-app")).toBeInTheDocument()
        expect(screen.getByText("reader-app.nivo.dev")).toBeInTheDocument()
        expect(screen.getByText("reader workspace")).toBeInTheDocument()
        expect(screen.getAllByRole("button", { name: /Open/ })).toHaveLength(2)
    })

    it("routes the row's own open command from either the name or the action", () => {
        const onOpen = vi.fn()
        render(<OverviewServicesBase label="Services" rows={[{ ...rows[0]!, onOpen }]} />)

        fireEvent.click(screen.getByRole("button", { name: "Open" }))
        expect(onOpen).toHaveBeenCalledTimes(1)
    })

    it("disables the row's own control when there is nothing to open yet", () => {
        render(<OverviewServicesBase label="Services" rows={[{ id: "app-2", name: "new-app", detail: "—", statusLabel: "Not provisioned", statusTone: "neutral", actionLabel: "Not available yet", isDisabled: true, onOpen: vi.fn() }]} />)

        expect(screen.getByRole("button", { name: "Not available yet" })).toBeDisabled()
    })
})
