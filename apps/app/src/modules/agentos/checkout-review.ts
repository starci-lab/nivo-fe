import type {
    WorkspaceCheckoutAnswer,
    WorkspaceCheckoutOffer,
    WorkspaceCheckoutPaymentRail,
} from "../api/workspace-controlplane"
import { type Outcome } from "@nivo/api"

/** Resolved copy the connected owner supplies; no translation or transport lives here. */
export type CheckoutReviewCopy = {
    readonly path: string
    readonly workspaces: string
    readonly newWorkspace: string
    readonly checkout: string
    readonly title: string
    readonly description: string
    readonly offerLabel: string
    readonly offer: string
    readonly offerVersion: string
    readonly amount: string
    readonly billingTerm: string
    readonly renewal: string
    readonly includedOutcome: string
    readonly eligibility: string
    readonly seller: string
    readonly purchaser: string
    readonly admission: string
    readonly railLabel: string
    readonly railNote: string
    readonly railChoice: string
    readonly railRequired: string
    readonly railCredentialPending: string
    readonly stepRecheck: string
    readonly stepIdentity: string
    readonly stepProvider: string
    readonly requestPayment: string
    readonly retryPayment: string
    readonly changeOffer: string
    readonly returnToOffers: string
    readonly footnote: string
    readonly refusedTitle: string
}

/** One selectable payment rail: the purchaser's explicit choice, never an inferred default. */
export type CheckoutReviewRailOption = {
    readonly rail: WorkspaceCheckoutPaymentRail
    readonly label: string
    readonly detail: string
}

/** Frozen offer and admission facts bound to source data, never fixture prose. */
export type CheckoutReviewFacts = {
    readonly offer: string
    readonly offerVersion: string
    readonly amount: string
    readonly billingTerm: string
    readonly renewal: string
    readonly includedOutcome: string
    readonly eligibility: string
    readonly seller: string
    readonly purchaser: string | null
}

/** One ordered rail step: the pre-payment checks in their literal order. */
export type CheckoutReviewStep = {
    readonly title: string
    readonly detail: string
}

/** Destinations the connected owner resolved for navigation actions. */
export type CheckoutReviewLinks = {
    readonly workspaces: string
    readonly offerSelection: string
}

/** The rail's owned behaviors: raise the canonical request, choose the rail, or leave for offer selection. */
export type CheckoutReviewFlowActions = {
    readonly requestPayment: () => void
    readonly selectRail: (rail: WorkspaceCheckoutPaymentRail) => void
    readonly changeOffer: () => void
}

type CheckoutReviewHeadProps = {
    readonly copy: CheckoutReviewCopy
    readonly links: CheckoutReviewLinks
}

/** Props for {@link CheckoutReviewDecision}. */
export type CheckoutReviewDecisionProps = CheckoutReviewHeadProps & {
    readonly facts: CheckoutReviewFacts
    readonly admission: string
    readonly steps: ReadonlyArray<CheckoutReviewStep>
    readonly purchaseRef: string
    readonly rails: ReadonlyArray<CheckoutReviewRailOption>
    readonly selectedRail: WorkspaceCheckoutPaymentRail | null
    readonly notice: string | null
    readonly isPaymentPending?: boolean
}

/** Complete state/data/action contract of the render half. */
export type CheckoutReviewFlowBaseProps =
    | {
          readonly state: "loading"
          readonly props: CheckoutReviewHeadProps
      }
    | {
          readonly state: "review" | "not-started"
          readonly props: CheckoutReviewDecisionProps
          readonly on: CheckoutReviewFlowActions
      }
    | {
          readonly state: "refused"
          readonly props: CheckoutReviewHeadProps & {
              readonly facts: CheckoutReviewFacts | null
              readonly message: string
              readonly nextAction: string | null
          }
          readonly on: {
              readonly returnToOffers: () => void
          }
      }

/** What the last payment request answered when it carried no admissible purchase transition. */
export type CheckoutReviewStartOutcome =
    | { readonly kind: "none" }
    | { readonly kind: "notice"; readonly notice: string }
    | { readonly kind: "refused"; readonly message: string; readonly nextAction: string | null }

/** Which exact offer and entitlement the route asks the connected owner to recheck. */
export type CheckoutReviewFlowProps = {
    readonly offerId?: string
    readonly offerVersion?: string
    readonly renewalEntitlementId?: string
}

/** The purchaser-scoped retry identity of one selection. */
export const retryKeyFor = (offer: WorkspaceCheckoutOffer): string =>
    `start-checkout:${offer.offerId}@${offer.offerVersion}`

/** Route path of one purchase's status surface. */
export const purchaseStatusPath = (purchaseId: string): string => `/agentos/workspaces/purchases/${purchaseId}`

/** The provider action's own redirect destination, when the action carries one. */
export const redirectDestination = (outcome: WorkspaceCheckoutAnswer): string | null => {
    if (outcome.status !== "prepared" || outcome.paymentAction === null) return null
    const destination = outcome.paymentAction.payload["url"]
    return typeof destination === "string" && destination.length > 0 ? destination : null
}

/** Find the exact current frozen offer selected by the route. */
export const frozenOfferFor = (
    answer: Outcome<WorkspaceCheckoutAnswer> | undefined,
    offerId: string,
    offerVersion: string,
): WorkspaceCheckoutOffer | null => {
    if (!answer?.ok || answer.data.status !== "offers" || answer.data.selection.state !== "current") return null
    return answer.data.offers.find((offer) => offer.offerId === offerId && offer.offerVersion === offerVersion) ?? null
}

/** Bind the frozen offer's visible facts to its formatted amount and ledger copy. */
export const checkoutFactsFor = (
    offer: WorkspaceCheckoutOffer,
    amount: string,
    seller: string,
): CheckoutReviewFacts => ({
    offer: offer.displayName,
    offerVersion: offer.offerVersion,
    amount,
    billingTerm: offer.billingCadence,
    renewal: offer.renewalMode,
    includedOutcome: offer.includedOutcome,
    eligibility: offer.eligibility,
    seller,
    purchaser: null,
})
