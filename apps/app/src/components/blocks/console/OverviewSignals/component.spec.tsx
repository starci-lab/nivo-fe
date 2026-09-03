import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { OverviewSignalsBase, type OverviewSignalsCell } from "./component"

const cells: ReadonlyArray<OverviewSignalsCell> = [
    { id: "apps", label: "Apps", value: "Needs attention", status: "Awaiting DNS", emphasis: "accent", badgeTone: "warning" },
    { id: "agentos", label: "AgentOS", value: "sales-ops", status: "Pod is not answering", badgeTone: "danger" },
    { id: "domains", label: "Domains", value: "—", status: "Could not read domains" },
    { id: "wallet", label: "Wallet", value: "", status: "", isSkeleton: true },
]

describe("OverviewSignalsBase", () => {
    it("draws four peer cells as one full-measure band, without a collection total", () => {
        const { container } = render(<OverviewSignalsBase label="At a glance" fact="2 signals need attention" cells={cells} />)

        expect(screen.getByText("Needs attention")).toBeInTheDocument()
        expect(screen.getByText("sales-ops")).toBeInTheDocument()
        expect(screen.getByText("Could not read domains")).toBeInTheDocument()
        expect(container.querySelectorAll('[data-cell="true"]')).toHaveLength(4)
    })

    it("raises a warning and a danger status out of a plain-text one", () => {
        const { container } = render(<OverviewSignalsBase label="At a glance" cells={cells} />)

        expect(container.querySelector('[data-component="Badge"][data-tone="warning"]')).toHaveTextContent("Awaiting DNS")
        expect(container.querySelector('[data-component="Badge"][data-tone="danger"]')).toHaveTextContent("Pod is not answering")
    })

    it("leaves an untoned status as plain muted copy, never a Badge", () => {
        const { container } = render(<OverviewSignalsBase label="At a glance" cells={[cells[2]!]} />)

        expect(container.querySelectorAll('[data-component="Badge"]')).toHaveLength(0)
        expect(screen.getByText("Could not read domains")).toBeInTheDocument()
    })

    it("renders the unresolved carrier as the same tree at rest, each leaf shown loading", () => {
        const { container } = render(<OverviewSignalsBase label="At a glance" cells={[cells[3]!]} />)

        expect(container.querySelectorAll('[data-cell="true"]')).toHaveLength(1)
        expect(container.querySelectorAll('[data-loading="true"]').length).toBeGreaterThan(0)
    })
})
