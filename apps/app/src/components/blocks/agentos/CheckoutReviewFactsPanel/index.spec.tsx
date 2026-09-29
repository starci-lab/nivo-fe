import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { CheckoutReviewCopy, CheckoutReviewFacts } from "../../../../modules/agentos/checkout-review"
import { CheckoutReviewFactsPanel } from "."

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
    railLabel: "Rail",
    railNote: "Note",
    railChoice: "Choice",
    railRequired: "Required",
    railCredentialPending: "Credential pending",
    stepRecheck: "Recheck",
    stepIdentity: "Identity",
    stepProvider: "Provider",
    requestPayment: "Request",
    retryPayment: "Retry",
    changeOffer: "Change",
    returnToOffers: "Return",
    footnote: "Footnote",
    refusedTitle: "Refused",
}
const facts: CheckoutReviewFacts = {
    offer: "Growth",
    offerVersion: "v1",
    amount: "₫10",
    billingTerm: "monthly",
    renewal: "explicit",
    includedOutcome: "Workspace",
    eligibility: "VN",
    seller: "Ledger",
    purchaser: null,
}

describe("CheckoutReviewFactsPanel", () => {
    it("draws only the facts whose source named a value", () => {
        render(<CheckoutReviewFactsPanel copy={copy} facts={facts} admission="Admitted" />)
        expect(screen.getByText("Growth")).toBeInTheDocument()
        expect(screen.getByText("Admitted")).toBeInTheDocument()
        expect(screen.queryByText("Purchaser")).toBeNull()
    })

    it("keeps the same fact anatomy while loading", () => {
        render(<CheckoutReviewFactsPanel copy={copy} skeleton />)
        expect(screen.getByText("Offer")).toBeInTheDocument()
        expect(screen.getByText("Version")).toBeInTheDocument()
        expect(screen.getByText("Admission")).toBeInTheDocument()
    })
})
