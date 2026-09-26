import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CheckoutReviewFlowBase, type CheckoutReviewCopy, type CheckoutReviewFacts, type CheckoutReviewFlowBaseProps, type CheckoutReviewRailOption } from "./component"
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
    railNote: "This request reuses the account's existing purchase identity and opens the chosen gateway's payment page.",
    railChoice: "Payment method",
    railRequired: "Choose a payment method before requesting payment.",
    railCredentialPending: "The payment gateway is still waiting on the owner's credentials.",
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
const rails: ReadonlyArray<CheckoutReviewRailOption> = [
    { rail: "vnpay", label: "VNPAY", detail: "Domestic cards and bank accounts through VNPAY" },
    { rail: "momo", label: "MoMo", detail: "MoMo wallet" },
]
const links = {
    workspaces: "/agentos",
    offerSelection: "/agentos/workspaces/new",
}
const facts: CheckoutReviewFacts = {
    offer: "Nivo Workspace Growth",
    offerVersion: "draft-2026-09-22",
    amount: "₫2,990,000",
    billingTerm: "yearly",
    renewal: "explicit-reauthorization",
    includedOutcome: "One managed agent workspace",
    eligibility: "market:VN",
    seller: "Nivo · invoice posted on the platform billing ledger",
    purchaser: null,
}
const steps = [
    { title: "Recheck admission and frozen terms", detail: "Admitted purchaser · current offer terms" },
    { title: "Create purchase identity", detail: "start-checkout:nivo-workspace-growth@draft-2026-09-22" },
    { title: "Open payment action", detail: "Domestic cards and bank accounts through VNPAY" },
]
const reviewProps: CheckoutReviewFlowBaseProps = {
    state: "review",
    props: {
        copy,
        links,
        facts,
        admission: "Admitted",
        steps,
        purchaseRef: "start-checkout:nivo-workspace-growth@draft-2026-09-22",
        rails,
        selectedRail: null,
        notice: null,
    },
    on: { requestPayment: vi.fn(), selectRail: vi.fn(), changeOffer: vi.fn() },
}
describe("CheckoutReviewFlowBase", () => {
    it("holds the page anatomy as a skeleton while the offer recheck is in flight", () => {
        render(<CheckoutReviewFlowBase state="loading" props={{ copy, links }} />)
        expect(screen.getByRole("heading", { name: "Review workspace purchase" })).toBeInTheDocument()
        expect(screen.getByText("Frozen offer")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Request payment" })).toBeDisabled()
    })
    it("renders the frozen offer facts and the ordered payment steps from bound data", () => {
        render(<CheckoutReviewFlowBase {...reviewProps} />)
        expect(screen.getByText("Nivo Workspace Growth")).toBeInTheDocument()
        expect(screen.getByText("draft-2026-09-22")).toBeInTheDocument()
        expect(screen.getByText("₫2,990,000")).toBeInTheDocument()
        expect(screen.getByText("yearly")).toBeInTheDocument()
        expect(screen.getByText("explicit-reauthorization")).toBeInTheDocument()
        expect(screen.getByText("Nivo · invoice posted on the platform billing ledger")).toBeInTheDocument()
        expect(screen.getByText("Admitted")).toBeInTheDocument()
        expect(screen.getByText("Admitted purchaser · current offer terms")).toBeInTheDocument()
        expect(screen.getByText("start-checkout:nivo-workspace-growth@draft-2026-09-22")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Change offer" })).toHaveAttribute("href", "/agentos/workspaces/new")
        expect(screen.getByText("Browser return is navigation, not payment proof.")).toBeInTheDocument()
    })
    it("states the rail choice, withholds the payment action until a rail is chosen", () => {
        render(<CheckoutReviewFlowBase {...reviewProps} />)
        expect(screen.getByRole("radiogroup", { name: "Payment method" })).toBeInTheDocument()
        expect(screen.getAllByRole("radio")).toHaveLength(2)
        expect(screen.getAllByText("Choose a payment method before requesting payment.").length).toBeGreaterThanOrEqual(1)
        expect(screen.getByRole("button", { name: "Request payment" })).toBeDisabled()
    })
    it("hands the chosen rail to the owning action and enables the request", () => {
        const on = { requestPayment: vi.fn(), selectRail: vi.fn(), changeOffer: vi.fn() }
        render(<CheckoutReviewFlowBase {...reviewProps} props={{ ...reviewProps.props, selectedRail: "vnpay" }} on={on} />)
        expect(screen.getByRole("radio", { name: /VNPAY/ })).toBeChecked()
        expect(screen.queryByText("Choose a payment method before requesting payment.")).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Request payment" })).toBeEnabled()
        fireEvent.click(screen.getByRole("radio", { name: /MoMo/ }))
        expect(on.selectRail).toHaveBeenCalledWith("momo")
    })
    it("hands the payment request to the owning action exactly once per press", () => {
        const on = { requestPayment: vi.fn(), selectRail: vi.fn(), changeOffer: vi.fn() }
        render(<CheckoutReviewFlowBase {...reviewProps} props={{ ...reviewProps.props, selectedRail: "vnpay" }} on={on} />)
        fireEvent.click(screen.getByRole("button", { name: "Request payment" }))
        expect(on.requestPayment).toHaveBeenCalledTimes(1)
    })
    it("keeps the payment action visibly pending so a second press cannot re-raise the request", () => {
        render(<CheckoutReviewFlowBase {...reviewProps} props={{ ...reviewProps.props, selectedRail: "vnpay", isPaymentPending: true }} />)
        expect(screen.getByRole("button", { name: "Request payment" })).toBeDisabled()
    })
    it("draws payment-not-started with the no-start reason and a same-identity retry", () => {
        render(<CheckoutReviewFlowBase {...reviewProps} state="not-started" props={{ ...reviewProps.props, selectedRail: "vnpay", notice: "No payment request was accepted." }} />)
        expect(screen.getByText("No payment request was accepted.")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Retry payment request" })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Return to offer selection" })).toBeInTheDocument()
    })
    it("withholds the purchaser fact row while no published source names one", () => {
        render(<CheckoutReviewFlowBase {...reviewProps} />)
        expect(screen.queryByText("Purchaser")).not.toBeInTheDocument()
    })
    it("withholds the payment action entirely when checkout admission is refused", () => {
        render(<CheckoutReviewFlowBase state="refused" props={{ copy, links, facts, message: "The offer terms changed.", nextAction: null }} on={{ returnToOffers: vi.fn() }} />)
        expect(screen.getByText("Checkout cannot continue")).toBeInTheDocument()
        expect(screen.getByText("The offer terms changed.")).toBeInTheDocument()
        expect(screen.getByText("Nivo Workspace Growth")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Request payment" })).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Return to offer selection" })).toBeInTheDocument()
    })
    it("names the verified-Login door the refusal points at", () => {
        render(<CheckoutReviewFlowBase state="refused" props={{ copy, links, facts: null, message: "The signed-in account is not an admitted purchaser yet.", nextAction: "Verify the account's email, then try again." }} on={{ returnToOffers: vi.fn() }} />)
        expect(screen.getByText("Verify the account's email, then try again.")).toBeInTheDocument()
    })
})