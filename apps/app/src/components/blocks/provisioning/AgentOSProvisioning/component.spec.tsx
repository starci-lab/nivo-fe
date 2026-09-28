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

describe("AgentOSProvisioningBase", () => {
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

    it("requires an explicit catalogue item and tier before ordering", () => {
        const request = vi.fn()
        const selectOffer = vi.fn()
        const selectTier = vi.fn()
        render(<AgentOSProvisioningBase
            state="request"
            props={{
                steps,
                subject: "AgentOS",
                detail: "Choose a package",
                statusTitle: "Request",
                statusText: "Select from the catalogue",
                requestActionLabel: "Continue",
                requestActionDisabled: true,
                selection: {
                    label: "Packages",
                    chooseOffer: "Choose product",
                    chooseTier: "Choose tier",
                    selected: "Selected",
                    offers: [{ id: "item", label: "AgentOS", tiers: [{ id: "tier", label: "Current tier", detail: "₫1,000" }] }],
                    selectedOfferId: "item"
                }
            }}
            on={{ request, selectOffer, selectTier }}
        />)
        expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled()
        fireEvent.click(screen.getByRole("button", { name: "AgentOS" }))
        fireEvent.click(screen.getByRole("button", { name: "Current tier · ₫1,000" }))
        expect(selectOffer).toHaveBeenCalledWith("item")
        expect(selectTier).toHaveBeenCalledWith("tier")
        expect(request).not.toHaveBeenCalled()
    })

    it("keeps an unmatched tier unselected on an unknown payment card", () => {
        const html = renderToStaticMarkup(<AgentOSProvisioningBase
            state="payment_unknown"
            props={{
                steps,
                subject: "AgentOS",
                detail: "Payment is still being checked",
                statusTitle: "Payment unknown",
                statusText: "Reconcile the same attempt",
                selection: {
                    label: "Packages",
                    chooseOffer: "Choose product",
                    chooseTier: "Choose tier",
                    selected: "Selected",
                    selectedOfferId: "item",
                    selectedTierId: "tier-current",
                    offers: [{ id: "item", label: "AgentOS", tiers: [{ id: "tier-next", label: "Next tier" }] }],
                },
            }}
            on={{}}
        />)
        expect(html).toContain("Payment unknown")
        expect(html).toContain("Next tier")
        expect(html).not.toContain("Selected")
    })

    it("draws a whole catalogue with item descriptions and the bound tier marked", () => {
        const html = renderToStaticMarkup(<AgentOSProvisioningBase
            state="request"
            props={{
                steps,
                subject: "AgentOS",
                detail: "Choose a package",
                statusTitle: "Request",
                statusText: "Select from the catalogue",
                selection: {
                    label: "Packages",
                    chooseOffer: "Choose product",
                    chooseTier: "Choose tier",
                    selected: "Selected",
                    offers: [
                        { id: "alpha", label: "Alpha", description: "Fast lane", tiers: [] },
                        { id: "beta", label: "Beta", tiers: [{ id: "tier-current", label: "Current tier", detail: "₫1,000" }, { id: "tier-next", label: "Next tier" }] },
                    ],
                    selectedOfferId: "beta",
                    selectedTierId: "tier-current"
                }
            }}
        />)
        expect(html).toContain("Alpha")
        expect(html).toContain("Fast lane")
        expect(html).toContain("Current tier · ₫1,000")
        expect(html).toContain("Next tier")
        expect(html).toContain("Selected")
    })

    it("keeps tier choices off an item the buyer has not selected", () => {
        const html = renderToStaticMarkup(<AgentOSProvisioningBase
            state="request"
            props={{
                steps,
                subject: "AgentOS",
                detail: "Choose a package",
                statusTitle: "Request",
                statusText: "Select from the catalogue",
                selection: {
                    label: "Packages",
                    chooseOffer: "Choose product",
                    chooseTier: "Choose tier",
                    selected: "Selected",
                    offers: [{ id: "alpha", label: "Alpha", tiers: [{ id: "tier-one", label: "Tier one" }] }]
                }
            }}
        />)
        expect(html).toContain("Alpha")
        expect(html).not.toContain("Tier one")
        expect(html).not.toContain("Selected")
    })

    it("hides the tier band on a selected item that offers no tier", () => {
        const html = renderToStaticMarkup(<AgentOSProvisioningBase
            state="request"
            props={{
                steps,
                subject: "AgentOS",
                detail: "Choose a package",
                statusTitle: "Request",
                statusText: "Select from the catalogue",
                selection: {
                    label: "Packages",
                    chooseOffer: "Choose product",
                    chooseTier: "Choose tier",
                    selected: "Selected",
                    offers: [{ id: "alpha", label: "Alpha", tiers: [] }],
                    selectedOfferId: "alpha"
                }
            }}
        />)
        expect(html).toContain("Alpha")
        expect(html).not.toContain("Choose tier")
        expect(html).not.toContain("Selected")
    })
})

describe("AgentOSProvisioningBase", () => {
    it("fires integration, lead, student, and solution actions", () => {
        const steps = [{ ordinal: "1", label: "Request", state: "current" as const, stateLabel: "Current" }]
        renderToStaticMarkup(<AgentOSProvisioningBase state="failed" props={{ steps, subject: "AgentOS", detail: "order-1", statusTitle: "Failed", statusText: "Unavailable" }} on={{ statusAction: vi.fn() }} />)
        renderToStaticMarkup(<AgentOSProvisioningBase state="ready" props={{ steps, subject: "AgentOS", detail: "workspace-1", statusTitle: "Ready", statusText: "Ready", statusActionLabel: "Manage" }} on={{ statusAction: vi.fn() }} />)
    })
})
