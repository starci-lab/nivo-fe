import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { CheckoutReviewCopy, CheckoutReviewDecisionProps } from "@/modules/agentos/checkout-review"
import { CheckoutReviewPaymentRail } from "."

const copy: CheckoutReviewCopy = {
    path: "Path",
    workspaces: "Workspaces",
    newWorkspace: "New",
    checkout: "Checkout",
    title: "Title",
    description: "Description",
    offerLabel: "Offer",
    offer: "Offer",
    offerVersion: "Version",
    amount: "Amount",
    billingTerm: "Term",
    renewal: "Renewal",
    includedOutcome: "Includes",
    eligibility: "Eligibility",
    seller: "Seller",
    purchaser: "Purchaser",
    admission: "Admission",
    railLabel: "Request payment",
    railNote: "Uses the existing purchase identity.",
    railChoice: "Payment method",
    railRequired: "Choose a rail.",
    railCredentialPending: "Gateway credentials pending.",
    stepRecheck: "Recheck",
    stepIdentity: "Identity",
    stepProvider: "Provider",
    requestPayment: "Request payment",
    retryPayment: "Retry payment",
    changeOffer: "Change offer",
    returnToOffers: "Return to offers",
    footnote: "Return is not proof.",
    refusedTitle: "Refused",
}
const props: CheckoutReviewDecisionProps = {
    copy,
    links: { workspaces: "/workspaces", offerSelection: "/offers" },
    facts: {
        offer: "Growth",
        offerVersion: "v1",
        amount: "₫10",
        billingTerm: "monthly",
        renewal: "explicit",
        includedOutcome: "Workspace",
        eligibility: "VN",
        seller: "Ledger",
        purchaser: null,
    },
    admission: "Admitted",
    steps: [{ title: "Recheck", detail: "Current offer" }],
    purchaseRef: "purchase-1",
    rails: [
        { rail: "vnpay", label: "VNPAY", detail: "Cards and bank accounts" },
        { rail: "momo", label: "MoMo", detail: "Wallet" },
    ],
    selectedRail: null,
    notice: null,
}

describe("CheckoutReviewPaymentRail", () => {
    it("requires a selected rail and emits the exact choice", () => {
        const on = { requestPayment: vi.fn(), selectRail: vi.fn(), changeOffer: vi.fn() }
        render(<CheckoutReviewPaymentRail props={props} state="review" on={on} />)
        expect(screen.getByRole("button", { name: "Request payment" })).toBeDisabled()
        fireEvent.click(screen.getByRole("radio", { name: /MoMo/ }))
        expect(on.selectRail).toHaveBeenCalledWith("momo")
    })

    it("draws the no-start reason and labels the action as a retry", () => {
        render(
            <CheckoutReviewPaymentRail
                props={{ ...props, selectedRail: "vnpay", notice: "No request started." }}
                state="not-started"
                on={{ requestPayment: vi.fn(), selectRail: vi.fn(), changeOffer: vi.fn() }}
            />,
        )
        expect(screen.getByText("No request started.")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Retry payment" })).toBeEnabled()
    })
})
