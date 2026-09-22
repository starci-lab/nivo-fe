import { fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { OfferSelectionFlowBase, type OfferSelectionCopy, type OfferSelectionOffer } from "./component"

const copy: OfferSelectionCopy = {
    path: "Purchase path",
    workspaces: "Workspaces",
    newWorkspace: "New",
    title: "Choose a workspace offer",
    description: "Compare provisional Vietnamese launch terms before checkout.",
    offersLabel: "Available offers",
    offersFact: "Draft recommendation • VND",
    offerGroupLabel: "Workspace offers",
    billingCadence: "Billing cadence",
    renewalBehavior: "Renewal behavior",
    includedOutcome: "Included workspace outcome",
    eligibility: "Eligibility",
    selectedBadge: "Selected",
    selectedDraft: "Selected draft",
    provisionalNote: "Terms are provisional until owner approval.",
    reviewAction: "Review selected offer",
    noPaymentNote: "No payment is requested on this screen.",
    backToWorkspaces: "Back to workspaces",
    unavailableTitle: "Offers cannot be read right now",
    refreshOffers: "Refresh offers",
}

const offer = (over: Partial<OfferSelectionOffer>): OfferSelectionOffer => ({
    offerId: "nivo-workspace-starter",
    offerVersion: "draft-2026-09-22",
    displayName: "Nivo Workspace Starter",
    amount: "1,490,000",
    currency: "VND",
    amountCadence: "year",
    billingCadence: "Annual billing",
    renewalMode: "Manual reauthorization each year",
    includedOutcome: "1 managed AI workspace • up to 5 members",
    capacity: "Up to 5 members",
    eligibility: "Eligible: verified businesses in Vietnam",
    ...over,
})

const offers: ReadonlyArray<OfferSelectionOffer> = [
    offer({}),
    offer({
        offerId: "nivo-workspace-growth",
        displayName: "Nivo Workspace Growth",
        amount: "2,990,000",
        includedOutcome: "1 managed AI workspace • up to 15 members",
        capacity: "Up to 15 members",
    }),
    offer({
        offerId: "nivo-workspace-scale",
        displayName: "Nivo Workspace Scale",
        amount: "5,990,000",
        includedOutcome: "1 managed AI workspace • up to 40 members",
        capacity: "Up to 40 members",
    }),
]

const links = { workspaces: "/agentos/workspaces" }

describe("OfferSelectionFlow surface", () => {
    it("renders all three concrete draft offers with exact amount/currency and provisional disclosure", () => {
        render(<OfferSelectionFlowBase
            state="selection"
            props={{ copy, links, offers, selectedOfferId: "nivo-workspace-growth", checkoutHref: "/agentos/workspaces/new/checkout?offer=nivo-workspace-growth&offerVersion=draft-2026-09-22" }}
            on={{ select: vi.fn() }}
        />)
        expect(screen.getByRole("radiogroup", { name: "Workspace offers" })).toBeInTheDocument()
        const radios = screen.getAllByRole("radio")
        expect(radios).toHaveLength(3)
        expect(screen.getByText("Nivo Workspace Starter")).toBeInTheDocument()
        expect(screen.getAllByText("Nivo Workspace Growth").length).toBeGreaterThan(0)
        expect(screen.getByText("Nivo Workspace Scale")).toBeInTheDocument()
        expect(screen.getByText("1,490,000 VND / year")).toBeInTheDocument()
        expect(screen.getAllByText("2,990,000 VND / year").length).toBeGreaterThan(0)
        expect(screen.getByText("5,990,000 VND / year")).toBeInTheDocument()
        expect(screen.getAllByText("Annual billing").length).toBeGreaterThanOrEqual(3)
        expect(screen.getAllByText("Manual reauthorization each year").length).toBeGreaterThanOrEqual(3)
        expect(screen.getByText("1 managed AI workspace • up to 5 members")).toBeInTheDocument()
        expect(screen.getByText("1 managed AI workspace • up to 15 members")).toBeInTheDocument()
        expect(screen.getByText("1 managed AI workspace • up to 40 members")).toBeInTheDocument()
        expect(screen.getAllByText("Eligible: verified businesses in Vietnam")).toHaveLength(3)
        expect(screen.getByText("Draft recommendation • VND")).toBeInTheDocument()
        expect(screen.getByText("Terms are provisional until owner approval.")).toBeInTheDocument()
        expect(screen.getByText("No payment is requested on this screen.")).toBeInTheDocument()
    })

    it("marks the selected offer through checked state and a visible text badge, not color alone", () => {
        render(<OfferSelectionFlowBase
            state="selection"
            props={{ copy, links, offers, selectedOfferId: "nivo-workspace-growth", checkoutHref: "/checkout?offer=nivo-workspace-growth&offerVersion=draft-2026-09-22" }}
            on={{ select: vi.fn() }}
        />)
        const growth = screen.getByRole("radio", { name: /Nivo Workspace Growth/ })
        expect(growth).toBeChecked()
        expect(screen.getByText("Selected")).toBeInTheDocument()
        expect(screen.getByText("Selected draft")).toBeInTheDocument()
        const summary = screen.getByText("Selected draft").parentElement?.parentElement
        expect(summary).toHaveTextContent("2,990,000 VND / year")
        expect(summary).toHaveTextContent("Up to 15 members")
    })

    it("fires select with the offer identity and preserves it as the review destination", () => {
        const select = vi.fn()
        render(<OfferSelectionFlowBase
            state="selection"
            props={{ copy, links, offers, selectedOfferId: "nivo-workspace-starter", checkoutHref: "/checkout?offer=nivo-workspace-starter&offerVersion=draft-2026-09-22" }}
            on={{ select }}
        />)
        fireEvent.click(screen.getByRole("radio", { name: /Nivo Workspace Scale/ }))
        expect(select).toHaveBeenCalledWith("nivo-workspace-scale")
        const review = screen.getByRole("link", { name: "Review selected offer" })
        expect(review).toHaveAttribute("href", "/checkout?offer=nivo-workspace-starter&offerVersion=draft-2026-09-22")
    })

    it("draws the joined surface with one external label row and hairline-separated flush bands", () => {
        const { container } = render(<OfferSelectionFlowBase
            state="selection"
            props={{ copy, links, offers, selectedOfferId: "nivo-workspace-growth", checkoutHref: "/checkout" }}
            on={{ select: vi.fn() }}
        />)
        const html = container.innerHTML
        expect(html).toContain("Available offers")
        expect(html).toContain("Draft recommendation • VND")
        const rows = container.querySelectorAll("[data-offer]")
        expect(rows).toHaveLength(3)
        rows.forEach(row => {
            expect(row.className).toContain("border-separator")
            expect(row.className).toContain("px-4")
        })
        const selected = container.querySelector("[data-offer='nivo-workspace-growth']")
        expect(selected?.className).toContain("bg-accent-soft")
    })

    it("keeps the workspace return path below the surface", () => {
        render(<OfferSelectionFlowBase
            state="selection"
            props={{ copy, links, offers, selectedOfferId: "nivo-workspace-growth", checkoutHref: "/checkout" }}
            on={{ select: vi.fn() }}
        />)
        expect(screen.getByRole("link", { name: "Back to workspaces" })).toHaveAttribute("href", "/agentos/workspaces")
    })

    it("renders the loading state only as skeleton geometry inside a busy surface", () => {
        const { container } = render(<OfferSelectionFlowBase
            state="loading"
            props={{ copy, links }}
        />)
        const busy = container.querySelector("[aria-busy='true']")
        expect(busy).not.toBeNull()
        expect(screen.queryAllByRole("radio")).toHaveLength(0)
        expect(container.querySelectorAll("[data-loading='true']").length).toBeGreaterThan(0)
        expect(screen.queryByText("Nivo Workspace Growth")).not.toBeInTheDocument()
    })

    it("keeps the offer hierarchy readable in the unavailable state without selection controls", () => {
        const refresh = vi.fn()
        render(<OfferSelectionFlowBase
            state="unavailable"
            props={{ copy, links, offers, message: "catalog read refused", isRefreshPending: false }}
            on={{ refresh }}
        />)
        expect(screen.queryAllByRole("radio")).toHaveLength(0)
        expect(screen.getByText("Nivo Workspace Growth")).toBeInTheDocument()
        expect(screen.getByText("Offers cannot be read right now")).toBeInTheDocument()
        expect(screen.getByText("catalog read refused")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Back to workspaces" })).toHaveAttribute("href", "/agentos/workspaces")
        fireEvent.click(screen.getByRole("button", { name: "Refresh offers" }))
        expect(refresh).toHaveBeenCalledOnce()
    })

    it("shows no payment or selection claim while unavailable", () => {
        const html = renderToStaticMarkup(<OfferSelectionFlowBase
            state="unavailable"
            props={{ copy, links, offers, message: "unavailable", isRefreshPending: true }}
            on={{ refresh: vi.fn() }}
        />)
        expect(html).not.toContain("Review selected offer")
        expect(html).not.toContain('type="radio"')
    })
})
