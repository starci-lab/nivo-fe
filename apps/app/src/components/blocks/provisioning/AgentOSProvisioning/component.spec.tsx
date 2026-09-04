import { fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AgentOSProvisioningBase } from "./component"

const steps = [
    {
        ordinal: "1",
        label: "Request",
        state: "done" as const,
        stateLabel: "Complete",
    },
    {
        ordinal: "2",
        label: "Payment",
        state: "current" as const,
        stateLabel: "Active",
    },
    { ordinal: "3", label: "Create workspace", state: "upcoming" as const, stateLabel: "Upcoming" },
    { ordinal: "4", label: "Ready", state: "upcoming" as const, stateLabel: "Upcoming" },
]

describe("AgentOS provisioning lifecycle", () => {
    it("keeps request pending inside the connected four-stage composition", () => {
        const { container } = render(<AgentOSProvisioningBase
            state="submitting"
            props={{ progressLabel: "AgentOS order", continuationLabel: "Next step", steps, subject: "AgentOS", detail: "Workspace plan", statusTitle: "Requesting", statusText: "Submitting", requestActionLabel: "Order", isRequestPending: true }}
            on={{ request: vi.fn() }}
        />)
        const html = container.innerHTML
        expect(screen.getByRole("button", { name: "Order" })).toHaveAttribute("data-action-pending", "true")
        expect(screen.getByRole("button", { name: "Order" })).toBeDisabled()
        expect(html).toContain('data-size="md"')
        expect(html).toContain('data-weight="medium"')
        expect(screen.getByRole("heading", { name: "AgentOS order" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Next step" })).toBeInTheDocument()
        for (const step of steps) expect(screen.getByText(step.label)).toBeInTheDocument()
        expect(html).toContain("AgentOS order")
        expect(screen.getByRole("status")).toHaveTextContent("Submitting")
        expect(html).toContain("AgentOS")
        expect(screen.getByText("Complete")).toBeInTheDocument()
        expect(screen.getByText("Active")).toBeInTheDocument()
        expect(screen.getAllByText("Upcoming")).toHaveLength(2)
    })

    it("renders all four progress stages responsively and keeps watch controls disabled", () => {
        const html = renderToStaticMarkup(<AgentOSProvisioningBase
            state="preparing"
            props={{ steps, subject: "AgentOS", detail: "Workspace plan", statusTitle: "Preparing", statusText: "Provisioning in progress", statusActionLabel: "Watch provisioning", statusActionDisabled: true }}
            on={{ statusAction: vi.fn() }}
        />)
        expect(html.match(/Upcoming/g)).toHaveLength(2)
        expect(html).toContain("Watch provisioning")
        expect(html).toContain("disabled")
    })

    it("keeps failure copy and actions visible", () => {
        const html = renderToStaticMarkup(<AgentOSProvisioningBase state="failed" props={{ steps, subject: "AgentOS", detail: "Workspace plan", statusTitle: "Failed", statusText: "Could not provision", statusActionLabel: "Retry" }} on={{ statusAction: vi.fn() }} />)
        expect(html).toContain("Could not provision")
        expect(html).toContain("Retry")
    })

    it("keeps persisted payment continuation operable beside progress", () => {
        const continuePayment = vi.fn()
        render(<AgentOSProvisioningBase
            state="awaiting_payment"
            props={{ progressLabel: "AgentOS order", continuationLabel: "Payment continuation", steps, subject: "AgentOS", detail: "Workspace plan", statusTitle: "Complete payment", statusText: "Pay the linked invoice", statusActionLabel: "Open Wallet" }}
            on={{ statusAction: continuePayment }}
        />)

        expect(screen.getByRole("heading", { name: "AgentOS order" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Payment continuation" })).toBeInTheDocument()
        expect(screen.getByRole("status")).toHaveTextContent("Pay the linked invoice")
        const continuation = screen.getByRole("button", { name: "Open Wallet" })
        expect(continuation).toBeEnabled()
        fireEvent.click(continuation)
        expect(continuePayment).toHaveBeenCalledOnce()
    })
})
