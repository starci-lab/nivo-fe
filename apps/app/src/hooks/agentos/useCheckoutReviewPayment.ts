import type { WorkspaceCheckoutOfferFieldsFragment, WorkspaceCheckoutStartInput } from "../../modules/api/__generated__/core"

import { useState } from "react"
import { useMutateWorkspaceCheckoutStartSwr } from "../swr/mutations/useMutateWorkspaceCheckoutStartSwr"
import { useRouter } from "../i18n/useRouter"
import type { WorkspaceCheckoutAnswer, WorkspaceCheckoutPaymentRail } from "../../modules/api/workspace-controlplane"
import {
    purchaseStatusPath,
    redirectDestination,
    retryKeyFor,
    type CheckoutReviewStartOutcome,
} from "../../modules/agentos/checkout-review"

/** The resolved phrases the checkout payment step draws. */
type CheckoutReviewPaymentCopy = {
    readonly checkoutUnavailable: string
    readonly paymentNotStarted: string
    readonly outcomeUnknownNotice: string
    readonly staleOffer: string
    readonly paymentRefused: string
    readonly conflictNotice: string
    readonly refusedNotAdmitted: string
    readonly nextActionVerifyEmail: string
    readonly nextActionRegister: string
    readonly nextActionSignIn: string
}

/** Props for {@link CheckoutReviewPayment}. */
type CheckoutReviewPaymentProps = {
    readonly offer: WorkspaceCheckoutOfferFieldsFragment | null
    readonly renewalEntitlementId?: string
    readonly copy: CheckoutReviewPaymentCopy
}

const nextActionSentence = (nextAction: string | null | undefined, copy: CheckoutReviewPaymentCopy): string | null =>
    nextAction === "login-verify-email"
        ? copy.nextActionVerifyEmail
        : nextAction === "login-register"
          ? copy.nextActionRegister
          : nextAction === "login-sign-in"
            ? copy.nextActionSignIn
            : null

/** Own the chosen rail and payment request outcome without mirroring mutation state in a ref. */
export const useCheckoutReviewPayment = ({ offer, renewalEntitlementId, copy }: CheckoutReviewPaymentProps) => {
    const router = useRouter()
    const startCheckout = useMutateWorkspaceCheckoutStartSwr()
    const [rail, setRail] = useState<WorkspaceCheckoutPaymentRail | null>(null)
    const [purchaseRef, setPurchaseRef] = useState<string | null>(null)
    const [start, setStart] = useState<CheckoutReviewStartOutcome>({ kind: "none" })

    const routeAdvancedPurchase = (outcome: WorkspaceCheckoutAnswer): boolean => {
        const named = "purchaseId" in outcome && typeof outcome.purchaseId === "string" ? outcome.purchaseId : null
        if (named !== null) setPurchaseRef(named)
        const state = outcome.status === "prepared" || outcome.status === "status" ? outcome.purchase.state : null
        if (named === null || state === null || state === "selected" || state === "payment-not-started") return false
        router.push(purchaseStatusPath(named))
        return true
    }

    const settleStartAnswer = (outcome: WorkspaceCheckoutAnswer) => {
        if (outcome.status === "prepared") {
            if (outcome.purchaseId !== null) setPurchaseRef(outcome.purchaseId)
            if (routeAdvancedPurchase(outcome)) return
            const destination = redirectDestination(outcome)
            if (outcome.paymentAction === null) {
                setStart({ kind: "notice", notice: copy.paymentNotStarted })
                return
            }
            if (destination === null) {
                setStart({ kind: "notice", notice: copy.checkoutUnavailable })
                return
            }
            window.location.assign(destination)
            return
        }
        if (routeAdvancedPurchase(outcome)) return
        if (outcome.status === "refused") {
            if (outcome.code === "offer-version-stale" || outcome.code === "offer-unavailable") {
                setStart({ kind: "refused", message: copy.staleOffer, nextAction: null })
                return
            }
            if (outcome.code === "payment-refused" || outcome.code === "payment-failed") {
                setStart({ kind: "refused", message: copy.paymentRefused, nextAction: null })
                return
            }
            if (outcome.code === "retry-identity-conflict" || outcome.code === "observed-identity-mismatch") {
                setStart({ kind: "refused", message: copy.conflictNotice, nextAction: null })
                return
            }
            if (outcome.code === "unauthenticated" || outcome.code === "purchaser-not-admitted") {
                setStart({
                    kind: "refused",
                    message: copy.refusedNotAdmitted,
                    nextAction: nextActionSentence(outcome.nextAction, copy) ?? copy.nextActionSignIn,
                })
                return
            }
            if (outcome.code === "outcome-unknown" || outcome.code === "source-unavailable") {
                setStart({ kind: "notice", notice: copy.outcomeUnknownNotice })
                return
            }
            setStart({ kind: "refused", message: copy.checkoutUnavailable, nextAction: null })
            return
        }
        if (outcome.status === "outcome-unknown") {
            setStart({ kind: "notice", notice: copy.outcomeUnknownNotice })
            return
        }
        if (outcome.status === "conflict") {
            setStart({ kind: "refused", message: copy.conflictNotice, nextAction: null })
            return
        }
        if (outcome.status === "unavailable") {
            setStart({ kind: "notice", notice: copy.paymentNotStarted })
            return
        }
        setStart({ kind: "notice", notice: copy.checkoutUnavailable })
    }

    const requestPayment = async (): Promise<void> => {
        if (offer === null || rail === null || startCheckout.isMutating) return
        const request: WorkspaceCheckoutStartInput = {
            retryKey: retryKeyFor(offer),
            offerId: offer.offerId,
            offerVersion: offer.offerVersion,
            paymentRail: rail,
            renewalEntitlementId,
        }
        try {
            const response = await startCheckout.trigger(request)
            if (!response.ok) {
                setStart({ kind: "notice", notice: copy.checkoutUnavailable })
                return
            }
            settleStartAnswer(response.data)
        } catch {
            if (purchaseRef !== null) {
                router.push(purchaseStatusPath(purchaseRef))
                return
            }
            setStart({ kind: "notice", notice: copy.outcomeUnknownNotice })
        }
    }

    return {
        rail,
        purchaseRef,
        start,
        isPaymentPending: startCheckout.isMutating,
        selectRail: setRail,
        requestPayment,
    }
}
