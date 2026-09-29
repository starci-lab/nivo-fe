import { fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { OfferSelectionFlowBase, type OfferSelectionCopy, type OfferSelectionOffer } from "./component"

const copy: OfferSelectionCopy = {
    path: "Purchase path",
    workspaces: "Workspaces",
    newWorkspace: "New",
    title: "Choose a workspace offer",
    description: "Compare the offers that currently apply before any payment.",
    offersLabel: "Current offers",
    offersFact: "Read from the Workspace Provision checkout boundary",
    offerGroupLabel: "Available offers",
    billingCadence: "Billing cadence",
    renewalBehavior: "Renewal",
    includedOutcome: "Included outcome",
    eligibility: "Eligibility",
    selectedBadge: "Selected",
    selectedOffer: "Selected offer",
    reviewAction: "Review selected offer",
    noPaymentNote: "No payment is requested at this step.",
    backToWorkspaces: "Back to workspaces",
    unavailableTitle: "No current offer can be presented",
    refreshOffers: "Refresh offers",
    noSessionTitle: "Sign in to see offers",
    signIn: "Sign in",
    signUp: "Create an account",
}

const offer = (over: Partial<OfferSelectionOffer>): OfferSelectionOffer => ({
    offerId: "nivo-workspace-starter",
    offerVersion: "draft-2026-09-22",
    displayName: "Nivo Workspace Starter",
    amount: "1,490,000 VND",
    billingCadence: "yearly",
    renewalMode: "explicit-reauthorization",
    includedOutcome: "One managed agent workspace",
    eligibility: "market:VN",
    ...over,
})

const offers: ReadonlyArray<OfferSelectionOffer> = [
    offer({}),
    offer({
        offerId: "nivo-workspace-growth",
        displayName: "Nivo Workspace Growth",
        amount: "2,990,000 VND",
    }),
    offer({
        offerId: "nivo-workspace-scale",
        displayName: "Nivo Workspace Scale",
        amount: "5,990,000 VND",
    }),
]

const links = { workspaces: "/agentos/workspaces" }

describe("OfferSelectionFlowBase", () => {
    it("renders every current offer with its inseparable amount and published facts", () => {
        render(
            <OfferSelectionFlowBase
                state="selection"
                props={{
                    copy,
                    links,
                    offers,
                    selectedOfferId: "nivo-workspace-growth",
                    checkoutHref:
                        "/agentos/workspaces/new/checkout?offer=nivo-workspace-growth&offerVersion=draft-2026-09-22",
                }}
                on={{ select: vi.fn() }}
            />,
        )
        expect(
            screen.getByRole("radiogroup", {
                name: enMessages.console.agentos.offerSelection.offerGroupLabel,
            }),
        ).toBeInTheDocument()
        const radios = screen.getAllByRole("radio")
        expect(radios).toHaveLength(3)
        for (const currentOffer of offers) {
            expect(screen.getByRole("radio", { name: currentOffer.displayName })).toBeInTheDocument()
        }
        expect(screen.getByText("Nivo Workspace Starter")).toBeInTheDocument()
        expect(screen.getAllByText("Nivo Workspace Growth").length).toBeGreaterThan(0)
        expect(screen.getAllByText("2,990,000 VND").length).toBeGreaterThan(0)
        expect(screen.getByText("5,990,000 VND")).toBeInTheDocument()
        expect(screen.getAllByText("explicit-reauthorization").length).toBeGreaterThanOrEqual(3)
        expect(screen.getAllByText("One managed agent workspace").length).toBeGreaterThanOrEqual(3)
        expect(screen.getAllByText("market:VN")).toHaveLength(3)
        expect(screen.getByText("Read from the Workspace Provision checkout boundary")).toBeInTheDocument()
        expect(screen.getByText("No payment is requested at this step.")).toBeInTheDocument()
    })

    it("names every offer choice with the catalog group label in both locales", () => {
        for (const offerGroupLabel of [
            enMessages.console.agentos.offerSelection.offerGroupLabel,
            viMessages.console.agentos.offerSelection.offerGroupLabel,
        ]) {
            const { unmount } = render(
                <OfferSelectionFlowBase
                    state="selection"
                    props={{
                        copy: { ...copy, offerGroupLabel },
                        links,
                        offers,
                        selectedOfferId: "nivo-workspace-growth",
                        checkoutHref: "/checkout",
                    }}
                    on={{ select: vi.fn() }}
                />,
            )
            expect(screen.getByRole("radiogroup", { name: offerGroupLabel })).toBeInTheDocument()
            for (const currentOffer of offers) {
                expect(screen.getByRole("radio", { name: currentOffer.displayName })).toBeInTheDocument()
            }
            unmount()
        }
    })

    it("marks the selected offer through checked state and a visible text badge, not color alone", () => {
        render(
            <OfferSelectionFlowBase
                state="selection"
                props={{
                    copy,
                    links,
                    offers,
                    selectedOfferId: "nivo-workspace-growth",
                    checkoutHref: "/checkout?offer=nivo-workspace-growth&offerVersion=draft-2026-09-22",
                }}
                on={{ select: vi.fn() }}
            />,
        )
        const growth = screen.getByRole("radio", { name: /Nivo Workspace Growth/ })
        expect(growth).toBeChecked()
        expect(screen.getByText("Selected")).toBeInTheDocument()
        expect(screen.getByText("Selected offer")).toBeInTheDocument()
        const summary = screen.getByText("Selected offer").parentElement?.parentElement
        expect(summary).toHaveTextContent("2,990,000 VND")
    })

    it("fires select with the offer identity and preserves the frozen version as the review destination", () => {
        const select = vi.fn()
        render(
            <OfferSelectionFlowBase
                state="selection"
                props={{
                    copy,
                    links,
                    offers,
                    selectedOfferId: "nivo-workspace-starter",
                    checkoutHref: "/checkout?offer=nivo-workspace-starter&offerVersion=draft-2026-09-22",
                }}
                on={{ select }}
            />,
        )
        fireEvent.click(screen.getByRole("radio", { name: /Nivo Workspace Scale/ }))
        expect(select).toHaveBeenCalledWith("nivo-workspace-scale")
        const review = screen.getByRole("link", { name: "Review selected offer" })
        expect(review).toHaveAttribute("href", "/checkout?offer=nivo-workspace-starter&offerVersion=draft-2026-09-22")
    })

    it("draws the joined surface with one external label row and hairline-separated flush bands", () => {
        const { container } = render(
            <OfferSelectionFlowBase
                state="selection"
                props={{ copy, links, offers, selectedOfferId: "nivo-workspace-growth", checkoutHref: "/checkout" }}
                on={{ select: vi.fn() }}
            />,
        )
        const html = container.innerHTML
        expect(html).toContain("Current offers")
        expect(html).toContain("Read from the Workspace Provision checkout boundary")
        const rows = container.querySelectorAll("[data-offer]")
        expect(rows).toHaveLength(3)
        rows.forEach((row) => {
            expect(row.className).toContain("border-separator")
            expect(row.className).toContain("px-4")
        })
        const selected = container.querySelector("[data-offer='nivo-workspace-growth']")
        expect(selected?.className).toContain("bg-accent-soft")
    })

    it("falls back to the first offer when the presented identity is absent from the list", () => {
        render(
            <OfferSelectionFlowBase
                state="selection"
                props={{
                    copy,
                    links,
                    offers,
                    selectedOfferId: "retired-offer",
                    checkoutHref: "/checkout?offer=retired-offer&offerVersion=draft-2026-09-22",
                }}
                on={{ select: vi.fn() }}
            />,
        )
        expect(screen.getByRole("radio", { name: /Nivo Workspace Starter/ })).toBeChecked()
        expect(screen.getByText("Selected offer")).toBeInTheDocument()
    })

    it("draws the surface without a summary or review action when no offer can be resolved", () => {
        render(
            <OfferSelectionFlowBase
                state="selection"
                props={{ copy, links, offers: [], selectedOfferId: "gone", checkoutHref: "/checkout" }}
                on={{ select: vi.fn() }}
            />,
        )
        expect(screen.queryAllByRole("radio")).toHaveLength(0)
        expect(screen.queryByText("Selected offer")).not.toBeInTheDocument()
        expect(screen.queryByRole("link", { name: "Review selected offer" })).not.toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Back to workspaces" })).toBeInTheDocument()
    })

    it("keeps the workspace return path below the surface", () => {
        render(
            <OfferSelectionFlowBase
                state="selection"
                props={{ copy, links, offers, selectedOfferId: "nivo-workspace-growth", checkoutHref: "/checkout" }}
                on={{ select: vi.fn() }}
            />,
        )
        expect(screen.getByRole("link", { name: "Back to workspaces" })).toHaveAttribute("href", "/agentos/workspaces")
    })

    it("renders the loading state only as skeleton geometry inside a busy surface", () => {
        const { container } = render(<OfferSelectionFlowBase state="loading" props={{ copy, links }} />)
        const busy = container.querySelector("[aria-busy='true']")
        expect(busy).not.toBeNull()
        expect(screen.queryAllByRole("radio")).toHaveLength(0)
        expect(container.querySelectorAll("[data-loading='true']").length).toBeGreaterThan(0)
        expect(screen.queryByText("Nivo Workspace Growth")).not.toBeInTheDocument()
    })

    it("keeps the offer hierarchy readable in the unavailable state without selection controls", () => {
        const refresh = vi.fn()
        render(
            <OfferSelectionFlowBase
                state="unavailable"
                props={{ copy, links, offers, message: "boundary read refused", isRefreshPending: false }}
                on={{ refresh }}
            />,
        )
        expect(screen.queryAllByRole("radio")).toHaveLength(0)
        expect(screen.getByText("Nivo Workspace Growth")).toBeInTheDocument()
        expect(screen.getByText("No current offer can be presented")).toBeInTheDocument()
        expect(screen.getByText("boundary read refused")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Back to workspaces" })).toHaveAttribute("href", "/agentos/workspaces")
        fireEvent.click(screen.getByRole("button", { name: "Refresh offers" }))
        expect(refresh).toHaveBeenCalledOnce()
    })

    it("shows no payment or selection claim while unavailable", () => {
        const html = renderToStaticMarkup(
            <OfferSelectionFlowBase
                state="unavailable"
                props={{ copy, links, offers, message: "unavailable", isRefreshPending: true }}
                on={{ refresh: vi.fn() }}
            />,
        )
        expect(html).not.toContain("Review selected offer")
        expect(html).not.toContain('type="radio"')
    })

    it("discloses no private offer terms and offers only the Login doors in the no-session state", () => {
        const signIn = vi.fn()
        const { container } = render(
            <OfferSelectionFlowBase
                state="no-session"
                props={{
                    copy,
                    links,
                    message: "No valid Login session was found.",
                    signInHref: "/authentication?returnTo=%2Fagentos%2Fworkspaces%2Fnew",
                    signUpHref: "/authentication?returnTo=%2Fagentos%2Fworkspaces%2Fnew",
                }}
                on={{ signIn }}
            />,
        )
        expect(screen.queryAllByRole("radio")).toHaveLength(0)
        expect(container.querySelectorAll("[data-offer]")).toHaveLength(0)
        expect(screen.queryByText("Review selected offer")).not.toBeInTheDocument()
        expect(screen.getByText("Sign in to see offers")).toBeInTheDocument()
        expect(screen.getByText("No valid Login session was found.")).toBeInTheDocument()
        const login = screen.getByRole("link", { name: "Sign in" })
        expect(login).toHaveAttribute("href", "/authentication?returnTo=%2Fagentos%2Fworkspaces%2Fnew")
        const signUp = screen.getByRole("link", { name: "Create an account" })
        expect(signUp).toHaveAttribute("href", "/authentication?returnTo=%2Fagentos%2Fworkspaces%2Fnew")
    })
})
