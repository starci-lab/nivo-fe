import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CheckoutReviewFlowBase, type CheckoutReviewCopy, type CheckoutReviewFacts, type CheckoutReviewFlowViewProps } from "./component"
const copy: CheckoutReviewCopy = {
    path: "Purchase path",
    workspaces: "Workspaces",
    newWorkspace: "New",
    checkout: "Checkout",
    title: "Review workspace purchase",
    description: "Confirm the frozen draft terms before requesting payment.",
    offerLabel: "Frozen offer",
    offer: "Offer",
    offerVersion: "Offer version",
    amount: "Amount and currency",
    billingTerm: "Billing term",
    renewal: "Renewal",
    includedOutcome: "Included outcome",
    eligibility: "Eligibility",
    seller: "Seller and invoice source",
    purchaser: "Purchaser",
    admission: "Purchaser admission",
    railLabel: "Request payment",
    railNote: "This request reuses the same purchase identity and opens the SePay checkout. It does not mark payment as paid.",
    stepRecheck: "Recheck admission and frozen terms",
    stepIdentity: "Create purchase identity",
    stepProvider: "Open payment action",
    requestPayment: "Request payment",
    retryPayment: "Retry payment request",
    changeOffer: "Change offer",
    returnToOffers: "Return to offer selection",
    footnote: "Browser return is navigation, not payment proof.",
    refusedTitle: "Checkout cannot continue",
}
const links = {
    workspaces: "/agentos",
    offerSelection: "/agentos/workspaces/new",
}
const facts: CheckoutReviewFacts = {
    offer: "Nivo AI Agent · Pro",
    offerVersion: "nivo-ai-agent · agent_pro",
    amount: "₫990,000",
    billingTerm: "Monthly billing",
    renewal: "Re-authorization required each period",
    includedOutcome: "Run an agent workspace",
    eligibility: "Vietnam · admitted organization owner",
    seller: "Nivo · platform invoice",
    purchaser: "An Nguyen · Northstar Co., Ltd.",
}
const steps = [
    { title: "Recheck admission and frozen terms", detail: "An Nguyen · Vietnam eligibility" },
    { title: "Create purchase identity", detail: "PUR-0001" },
    { title: "Open payment action", detail: "SePay · Online Banking" },
]
const reviewProps: CheckoutReviewFlowViewProps = {
    state: "review",
    props: {
        copy,
        links,
        facts,
        admission: "An Nguyen · Admitted",
        steps,
        purchaseRef: "PUR-0001",
        notice: null,
    },
    on: { requestPayment: vi.fn(), changeOffer: vi.fn() },
}
describe("CheckoutReviewFlow drawing", () => {
    it("holds the page anatomy as a skeleton while the offer recheck is in flight", () => {
        render(<CheckoutReviewFlowBase state="loading" props={{ copy, links }} />)
        expect(screen.getByRole("heading", { name: "Review workspace purchase" })).toBeInTheDocument()
        expect(screen.getByText("Frozen offer")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Request payment" })).toBeDisabled()
    })
    it("renders the frozen offer facts and the ordered payment steps from bound data", () => {
        render(<CheckoutReviewFlowBase {...reviewProps} />)
        expect(screen.getByText("Nivo AI Agent · Pro")).toBeInTheDocument()
        expect(screen.getByText("nivo-ai-agent · agent_pro")).toBeInTheDocument()
        expect(screen.getByText("₫990,000")).toBeInTheDocument()
        expect(screen.getByText("Monthly billing")).toBeInTheDocument()
        expect(screen.getByText("Re-authorization required each period")).toBeInTheDocument()
        expect(screen.getByText("An Nguyen · Northstar Co., Ltd.")).toBeInTheDocument()
        expect(screen.getByText("An Nguyen · Admitted")).toBeInTheDocument()
        expect(screen.getByText("An Nguyen · Vietnam eligibility")).toBeInTheDocument()
        expect(screen.getByText("PUR-0001")).toBeInTheDocument()
        expect(screen.getByText("SePay · Online Banking")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Request payment" })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Change offer" })).toHaveAttribute("href", "/agentos/workspaces/new")
        expect(screen.getByText("Browser return is navigation, not payment proof.")).toBeInTheDocument()
    })
    it("hands the payment request to the owning action exactly once per press", () => {
        const on = { requestPayment: vi.fn(), changeOffer: vi.fn() }
        render(<CheckoutReviewFlowBase {...reviewProps} on={on} />)
        fireEvent.click(screen.getByRole("button", { name: "Request payment" }))
        expect(on.requestPayment).toHaveBeenCalledTimes(1)
    })
    it("keeps the payment action visibly pending so a second press cannot re-raise the request", () => {
        render(<CheckoutReviewFlowBase {...reviewProps} props={{ ...reviewProps.props, isPaymentPending: true }} />)
        expect(screen.getByRole("button", { name: "Request payment" })).toBeDisabled()
    })
    it("draws payment-not-started with the no-start reason and a same-identity retry", () => {
        render(<CheckoutReviewFlowBase {...reviewProps} state="not-started" props={{ ...reviewProps.props, notice: "No payment request was accepted." }} />)
        expect(screen.getByText("No payment request was accepted.")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Retry payment request" })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Return to offer selection" })).toBeInTheDocument()
    })
    it("withholds the purchaser fact row while no session identity is bound", () => {
        render(<CheckoutReviewFlowBase {...reviewProps} props={{ ...reviewProps.props, facts: { ...facts, purchaser: null } }} />)
        expect(screen.queryByText("An Nguyen · Northstar Co., Ltd.")).not.toBeInTheDocument()
        expect(screen.queryByText("Purchaser")).not.toBeInTheDocument()
    })
    it("withholds the payment action entirely when checkout admission is refused", () => {
        render(<CheckoutReviewFlowBase state="refused" props={{ copy, links, facts, message: "The offer terms changed." }} on={{ returnToOffers: vi.fn() }} />)
        expect(screen.getByText("Checkout cannot continue")).toBeInTheDocument()
        expect(screen.getByText("The offer terms changed.")).toBeInTheDocument()
        expect(screen.getByText("Nivo AI Agent · Pro")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Request payment" })).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Return to offer selection" })).toBeInTheDocument()
    })
})
