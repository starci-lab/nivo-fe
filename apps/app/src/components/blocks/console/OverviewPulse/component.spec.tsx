import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { OverviewPulseBase, type OverviewPulseProps } from "./component"

const signals: OverviewPulseProps["signals"] = [
    { id: "apps", icon: "apps", label: "Apps", phase: "answered", value: "Needs attention", caption: "Awaiting DNS", tone: "warning", emphasis: "accent" },
    { id: "agentos", icon: "agentos", label: "AgentOS", phase: "answered", value: "sales-ops", caption: "Pod is not answering", tone: "danger" },
    { id: "domains", icon: "domains", label: "Domains", phase: "failed", value: "—", caption: "Could not read domains", tone: "default" },
    { id: "wallet", icon: "wallet", label: "Wallet", phase: "pending", value: "", caption: "", tone: "default" },
]

describe("OverviewPulseBase", () => {
    it("keeps four independently settled named signals without a collection total", () => {
        const { container } = render(<OverviewPulseBase label="At a glance" summary="Four operations asked, four answered." signals={signals} />)

        expect(screen.getByText("Needs attention")).toBeInTheDocument()
        expect(screen.getByText("sales-ops")).toBeInTheDocument()
        expect(screen.getByText("Could not read domains")).toBeInTheDocument()
        expect(container.querySelectorAll('[data-size="metric-lead"]')).toHaveLength(0)
    })

    it("raises a warning and a danger caption out of the healthy tone", () => {
        const { container } = render(<OverviewPulseBase label="At a glance" summary="Four operations asked, four answered." signals={signals} />)

        expect(container.querySelector('[data-component="Badge"][data-tone="warning"]')).toHaveTextContent("Awaiting DNS")
        expect(container.querySelector('[data-component="Badge"][data-tone="danger"]')).toHaveTextContent("Pod is not answering")
    })

    it("leaves a default-toned caption as plain muted copy", () => {
        const { container } = render(<OverviewPulseBase label="At a glance" summary="Four operations asked, four answered." signals={[signals[2]!, signals[3]!]} />)

        expect(container.querySelectorAll('[data-component="Badge"]')).toHaveLength(0)
        expect(screen.getByText("Could not read domains")).toBeInTheDocument()
    })

    it("renders every signal phase without inventing a value", () => {
        render(<OverviewPulseBase label="At a glance" summary="Four operations asked, four answered." signals={[
            { id: "pending", icon: "apps", label: "Apps", phase: "pending", value: "", caption: "Loading", tone: "default" },
            { id: "answered", icon: "agentos", label: "AgentOS", phase: "answered", value: "sales-ops", caption: "Ready", tone: "default" },
            { id: "failed", icon: "wallet", label: "Wallet", phase: "failed", value: "—", caption: "Unavailable", tone: "default" },
        ]} />)

        expect(screen.getByText("Apps")).toBeInTheDocument()
        expect(screen.getByText("AgentOS")).toBeInTheDocument()
        expect(screen.getByText("Wallet")).toBeInTheDocument()
    })
})
