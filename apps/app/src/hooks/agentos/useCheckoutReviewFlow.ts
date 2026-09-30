"use client"

import { useFormatter, useLocale, useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useAccessToken, useQueryWorkspaceCheckoutOffersSwr, useRouter, useSession } from ".."
import { getPathname } from "@/modules/i18n"
import {
    checkoutFactsFor,
    frozenOfferFor,
    retryKeyFor,
    type CheckoutReviewCopy,
    type CheckoutReviewFlowBaseProps,
    type CheckoutReviewFlowProps,
    type CheckoutReviewRailOption,
} from "../../modules/agentos/checkout-review"
import { useCheckoutReviewPayment } from "./useCheckoutReviewPayment"

const OFFER_SELECTION_PATH = "/agentos/workspaces/new"
const WORKSPACES_PATH = "/agentos/workspaces"

/** Resolve checkout copy and the answer into the pure view contract. */
export const useCheckoutReviewFlow = (props: CheckoutReviewFlowProps): CheckoutReviewFlowBaseProps => {
    const locale = useLocale()
    const format = useFormatter()
    const t = useTranslations("console.agentos.checkoutReview")
    const purchaseStatus = useTranslations("console.agentos.purchaseStatus")
    const router = useRouter()
    const searchParams = useSearchParams()
    const session = useSession()
    const accessToken = useAccessToken()
    const offerId = props.offerId ?? searchParams.get("offer") ?? ""
    const offerVersion = props.offerVersion ?? searchParams.get("offerVersion") ?? ""
    const renewalEntitlementId = props.renewalEntitlementId ?? searchParams.get("entitlement") ?? undefined
    const offersQuery = useQueryWorkspaceCheckoutOffersSwr(
        offerId,
        offerVersion,
        accessToken !== null && offerId !== "" && offerVersion !== "",
    )
    const answer = offersQuery.data
    const frozen = frozenOfferFor(answer, offerId, offerVersion)
    const route = (href: string): string => getPathname({ locale, href })
    const links = { workspaces: route(WORKSPACES_PATH), offerSelection: route(OFFER_SELECTION_PATH) }
    const returnToOffers = () => router.push(OFFER_SELECTION_PATH)
    const copy: CheckoutReviewCopy = {
        path: t("path"),
        workspaces: t("workspaces"),
        newWorkspace: t("newWorkspace"),
        checkout: t("checkout"),
        title: t("title"),
        description: t("description"),
        offerLabel: t("offerLabel"),
        offer: t("offer"),
        offerVersion: t("offerVersion"),
        amount: purchaseStatus("amountLabel"),
        billingTerm: t("billingTerm"),
        renewal: t("renewal"),
        includedOutcome: t("includedOutcome"),
        eligibility: t("eligibility"),
        seller: t("seller"),
        purchaser: t("purchaser"),
        admission: t("admission"),
        railLabel: t("railLabel"),
        railNote: t("purchaseIdentityReused"),
        railChoice: t("railChoice"),
        railRequired: t("railRequired"),
        railCredentialPending: t("railCredentialPending"),
        stepRecheck: t("stepRecheck"),
        stepIdentity: t("stepIdentity"),
        stepProvider: t("stepProvider"),
        requestPayment: t("requestPayment"),
        retryPayment: t("retryPayment"),
        changeOffer: t("changeOffer"),
        returnToOffers: t("returnToOffers"),
        footnote: t("footnote"),
        refusedTitle: t("refusedTitle"),
    }
    const payment = useCheckoutReviewPayment({
        offer: frozen,
        renewalEntitlementId,
        copy: {
            checkoutUnavailable: t("checkoutUnavailable"),
            paymentNotStarted: t("paymentNotStarted"),
            outcomeUnknownNotice: t("outcomeUnknownNotice"),
            staleOffer: t("staleOffer"),
            paymentRefused: t("paymentRefused"),
            conflictNotice: t("conflictNotice"),
            refusedNotAdmitted: t("refusedNotAdmitted"),
            nextActionVerifyEmail: t("nextActionVerifyEmail"),
            nextActionRegister: t("nextActionRegister"),
            nextActionSignIn: t("nextActionSignIn"),
        },
    })
    const rails: ReadonlyArray<CheckoutReviewRailOption> = [
        { rail: "vnpay", label: t("railVnpay"), detail: t("railVnpayDetail") },
        { rail: "momo", label: t("railMomo"), detail: t("railMomoDetail") },
    ]
    const chosenRail = rails.find((candidate) => candidate.rail === payment.rail) ?? null
    const factsFor = (offer: NonNullable<typeof frozen>) => {
        const amount = Number(offer.amount)
        const formattedAmount = Number.isFinite(amount)
            ? format.number(amount, {
                  style: "currency",
                  currency: offer.currency,
                  currencyDisplay: "narrowSymbol",
              })
            : `${offer.amount} ${offer.currency}`
        return checkoutFactsFor(offer, formattedAmount, t("sellerLedger"))
    }
    const facts = frozen === null ? null : factsFor(frozen)
    const refused = (
        message: string,
        nextAction: string | null,
        refusedFacts: typeof facts,
    ): CheckoutReviewFlowBaseProps => ({
        state: "refused",
        props: { copy, links, facts: refusedFacts, message, nextAction },
        on: { returnToOffers },
    })

    if (session.state.status === "restoring") return { state: "loading", props: { copy, links } }
    if (accessToken === null) return refused(t("refusedNotAdmitted"), t("nextActionSignIn"), null)
    if (answer === undefined)
        return offersQuery.error === undefined
            ? { state: "loading", props: { copy, links } }
            : refused(t("checkoutUnavailable"), null, null)
    if (!answer.ok) return refused(t("checkoutUnavailable"), null, null)
    const outcome = answer.data
    if (outcome.status === "refused") {
        const nextAction =
            outcome.nextAction === "login-verify-email"
                ? t("nextActionVerifyEmail")
                : outcome.nextAction === "login-register"
                  ? t("nextActionRegister")
                  : outcome.nextAction === "login-sign-in"
                    ? t("nextActionSignIn")
                    : null
        return outcome.code === "offer-version-stale" || outcome.code === "offer-unavailable"
            ? refused(t("staleOffer"), null, null)
            : refused(t("refusedNotAdmitted"), nextAction ?? t("nextActionSignIn"), null)
    }
    if (outcome.status === "unavailable") return refused(t("checkoutUnavailable"), null, null)
    if (outcome.status !== "offers" || outcome.selection.state !== "current" || frozen === null)
        return refused(t("staleOffer"), null, null)
    if (payment.start.kind === "refused") return refused(payment.start.message, payment.start.nextAction, facts)
    const notice = payment.start.kind === "notice" ? payment.start.notice : null
    return {
        state: notice === null ? "review" : "not-started",
        props: {
            copy,
            links,
            facts: factsFor(frozen),
            admission: t("admitted"),
            steps: [
                { title: copy.stepRecheck, detail: t("recheckDetail") },
                { title: copy.stepIdentity, detail: payment.purchaseRef ?? retryKeyFor(frozen) },
                { title: copy.stepProvider, detail: chosenRail === null ? copy.railRequired : chosenRail.detail },
            ],
            purchaseRef: payment.purchaseRef ?? retryKeyFor(frozen),
            rails,
            selectedRail: payment.rail,
            notice,
            isPaymentPending: payment.isPaymentPending,
        },
        on: {
            requestPayment: () => void payment.requestPayment(),
            selectRail: payment.selectRail,
            changeOffer: () => undefined,
        },
    }
}
