"use client";

import { useRef, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { getPathname } from "@/modules/i18n/navigation";
import { useSession } from "@/hooks";
import { useMutateWorkspaceCheckoutStartSwr, useQueryWorkspaceCheckoutOffersSwr, useRouter } from "@/hooks";
import type { WorkspaceCheckoutOffer, WorkspaceCheckoutAnswer, WorkspaceCheckoutPaymentRail, WorkspaceCheckoutStartRequest } from "@/modules/api/workspace-controlplane";
import { CheckoutReviewFlowBase, type CheckoutReviewCopy, type CheckoutReviewFacts, type CheckoutReviewFlowBaseProps, type CheckoutReviewRailOption } from "./component";

/** What the route hands the connected checkout owner: which frozen offer and entitlement to review. */
export type CheckoutReviewFlowProps = {
    /** Offer identity of the selected offer; falls back to the `offer` search parameter. */
    readonly offerId?: string;
    /** Exact frozen offer version; falls back to the `offerVersion` search parameter. */
    readonly offerVersion?: string;
    /** The existing entitlement a renewal binds; falls back to the `entitlement` search parameter. */
    readonly renewalEntitlementId?: string;
};

/** What the last payment request answered, when it answered nothing admissible. */
type StartOutcome =
    | { readonly kind: "none" }
    | { readonly kind: "notice"; readonly notice: string }
    | { readonly kind: "refused"; readonly message: string; readonly nextAction: string | null };

/** Route path (unlocalized) of the surfaces this screen hands off to. */
const OFFER_SELECTION_PATH = "/agentos/workspaces/new";
const WORKSPACES_PATH = "/agentos/workspaces";
/** Route path (unlocalized) of one purchase's status surface. */
const purchaseStatusPath = (purchaseId: string): string => `/agentos/workspaces/purchases/${purchaseId}`;

/**
 * The purchaser-scoped retry identity of one selection.
 *
 * THE RETRY KEY IS THE PURCHASE IDENTITY, NOT A CACHE KEY: an identical press replays the same
 * purchase, so it is derived from the frozen selection rather than from the moment of the press.
 */
const retryKeyFor = (offer: WorkspaceCheckoutOffer): string => `start-checkout:${offer.offerId}@${offer.offerVersion}`;

/** The provider action's own redirect destination, when the action carries one. */
const redirectDestination = (outcome: WorkspaceCheckoutAnswer): string | null => {
    if (outcome.status !== "prepared" || outcome.paymentAction === null) return null;
    const destination = outcome.paymentAction.payload["url"];
    return typeof destination === "string" && destination.length > 0 ? destination : null;
};

/** Checkout-review owner: frozen-offer recheck → one admitted purchase → the provider action. */
const CheckoutReviewFlow = (props: CheckoutReviewFlowProps) => {
    const locale = useLocale();
    const format = useFormatter();
    const t = useTranslations("console.agentos.checkoutReview");
    const router = useRouter();
    const searchParams = useSearchParams();
    const session = useSession();
    const accessToken = session.state.status === "signed-in" ? session.state.accessToken : null;
    const offerId = props.offerId ?? searchParams.get("offer") ?? "";
    const offerVersion = props.offerVersion ?? searchParams.get("offerVersion") ?? "";
    const renewalEntitlementId = props.renewalEntitlementId ?? searchParams.get("entitlement") ?? undefined;
    const offersQuery = useQueryWorkspaceCheckoutOffersSwr(offerId, offerVersion, accessToken !== null && offerId !== "" && offerVersion !== "");
    const startCheckout = useMutateWorkspaceCheckoutStartSwr();
    const [rail, setRail] = useState<string | null>(null);
    const [purchaseRef, setPurchaseRef] = useState<string | null>(null);
    const [start, setStart] = useState<StartOutcome>({ kind: "none" });
    const [paymentPending, setPaymentPending] = useState(false);
    const pendingRef = useRef(false);
    const route = (href: string): string => getPathname({ locale, href });
    /* Anchors carry the localized href; the locale-aware router owns the prefix for pushes. */
    const links = {
        workspaces: route(WORKSPACES_PATH),
        offerSelection: route(OFFER_SELECTION_PATH),
    };
    const returnToOffers = () => router.push(OFFER_SELECTION_PATH);
    const nextActionSentence = (nextAction: string | null | undefined): string | null => nextAction === "login-verify-email"
        ? t("nextActionVerifyEmail")
        : nextAction === "login-register"
            ? t("nextActionRegister")
            : nextAction === "login-sign-in"
                ? t("nextActionSignIn")
                : null;
    const answer = offersQuery.data;
    const frozen = answer?.ok === true && answer.data.status === "offers" && answer.data.selection.state === "current"
        ? answer.data.offers.find(offer => offer.offerId === offerId && offer.offerVersion === offerVersion) ?? null
        : null;
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
        amount: t("amount"),
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
    };
    const rails: ReadonlyArray<CheckoutReviewRailOption> = [
        { rail: "vnpay", label: t("railVnpay"), detail: t("railVnpayDetail") },
        { rail: "momo", label: t("railMomo"), detail: t("railMomoDetail") },
    ];
    const chosenRail = rails.find(candidate => candidate.rail === rail) ?? null;
    const formatAmount = (offer: WorkspaceCheckoutOffer): string => {
        const amount = Number(offer.amount);
        return Number.isFinite(amount)
            ? format.number(amount, { style: "currency", currency: offer.currency, currencyDisplay: "narrowSymbol" })
            : `${offer.amount} ${offer.currency}`;
    };
    const factsOf = (offer: WorkspaceCheckoutOffer): CheckoutReviewFacts => ({
        offer: offer.displayName,
        offerVersion: offer.offerVersion,
        amount: formatAmount(offer),
        billingTerm: offer.billingCadence,
        renewal: offer.renewalMode,
        includedOutcome: offer.includedOutcome,
        eligibility: offer.eligibility,
        seller: t("sellerLedger"),
        purchaser: null,
    });
    /** Route an answer that named a purchase which already left the checkout cursor to its status surface. */
    const routeAdvancedPurchase = (outcome: WorkspaceCheckoutAnswer): boolean => {
        const named = "purchaseId" in outcome && typeof outcome.purchaseId === "string" ? outcome.purchaseId : null;
        if (named !== null) setPurchaseRef(named);
        const state = outcome.status === "prepared" || outcome.status === "status" ? outcome.purchase.state : null;
        if (named === null || state === null || state === "selected" || state === "payment-not-started") return false;
        router.push(purchaseStatusPath(named));
        return true;
    };
    const settleStartAnswer = (outcome: WorkspaceCheckoutAnswer) => {
        if (outcome.status === "prepared") {
            if (outcome.purchaseId !== null) setPurchaseRef(outcome.purchaseId);
            if (routeAdvancedPurchase(outcome)) return;
            const destination = redirectDestination(outcome);
            if (outcome.paymentAction === null) {
                setStart({ kind: "notice", notice: t("paymentNotStarted") });
                return;
            }
            if (destination === null) {
                setStart({ kind: "notice", notice: t("checkoutUnavailable") });
                return;
            }
            window.location.assign(destination);
            return;
        }
        if (routeAdvancedPurchase(outcome)) return;
        if (outcome.status === "refused") {
            if (outcome.code === "offer-version-stale" || outcome.code === "offer-unavailable") {
                setStart({ kind: "refused", message: t("staleOffer"), nextAction: null });
                return;
            }
            if (outcome.code === "payment-refused" || outcome.code === "payment-failed") {
                setStart({ kind: "refused", message: t("paymentRefused"), nextAction: null });
                return;
            }
            if (outcome.code === "retry-identity-conflict" || outcome.code === "observed-identity-mismatch") {
                setStart({ kind: "refused", message: t("conflictNotice"), nextAction: null });
                return;
            }
            if (outcome.code === "unauthenticated" || outcome.code === "purchaser-not-admitted") {
                setStart({ kind: "refused", message: t("refusedNotAdmitted"), nextAction: nextActionSentence(outcome.nextAction) ?? t("nextActionSignIn") });
                return;
            }
            if (outcome.code === "outcome-unknown" || outcome.code === "source-unavailable") {
                setStart({ kind: "notice", notice: t("outcomeUnknownNotice") });
                return;
            }
            setStart({ kind: "refused", message: t("checkoutUnavailable"), nextAction: null });
            return;
        }
        if (outcome.status === "outcome-unknown") {
            setStart({ kind: "notice", notice: t("outcomeUnknownNotice") });
            return;
        }
        if (outcome.status === "conflict") {
            setStart({ kind: "refused", message: t("conflictNotice"), nextAction: null });
            return;
        }
        if (outcome.status === "unavailable") {
            setStart({ kind: "notice", notice: t("paymentNotStarted") });
            return;
        }
        setStart({ kind: "notice", notice: t("checkoutUnavailable") });
    };
    const requestPayment = async (): Promise<void> => {
        /* A synchronous ref guards the in-flight press; a re-render cannot arrive before a second press. */
        if (frozen === null || rail === null || pendingRef.current) return;
        const request: WorkspaceCheckoutStartRequest = {
            retryKey: retryKeyFor(frozen),
            offerId: frozen.offerId,
            offerVersion: frozen.offerVersion,
            paymentRail: rail as WorkspaceCheckoutPaymentRail,
            renewalEntitlementId,
        };
        pendingRef.current = true;
        setPaymentPending(true);
        try {
            const response = await startCheckout.trigger(request);
            if (!response.ok) {
                setStart({ kind: "notice", notice: t("checkoutUnavailable") });
                return;
            }
            settleStartAnswer(response.data);
        } catch {
            /* A thrown transport failure decided nothing; reconcile the purchase it may have created. */
            if (purchaseRef !== null) {
                router.push(purchaseStatusPath(purchaseRef));
                return;
            }
            setStart({ kind: "notice", notice: t("outcomeUnknownNotice") });
        } finally {
            pendingRef.current = false;
            setPaymentPending(false);
        }
    };
    const changeOffer = () => {
        /* The TextAction carries the real href; this handler stays for action tracing. */
    };
    const view = (): CheckoutReviewFlowBaseProps => {
        const refused = (message: string, nextAction: string | null, offer: WorkspaceCheckoutOffer | null): CheckoutReviewFlowBaseProps => ({ state: "refused", props: { copy, links, facts: offer === null ? null : factsOf(offer), message, nextAction }, on: { returnToOffers } });
        if (session.state.status === "restoring") {
            return { state: "loading", props: { copy, links } };
        }
        if (accessToken === null) {
            return refused(t("refusedNotAdmitted"), t("nextActionSignIn"), null);
        }
        if (answer === undefined) {
            return offersQuery.error === undefined ? { state: "loading", props: { copy, links } } : refused(t("checkoutUnavailable"), null, null);
        }
        if (!answer.ok) {
            return refused(t("checkoutUnavailable"), null, null);
        }
        const outcome = answer.data;
        if (outcome.status === "refused") {
            const nextAction = nextActionSentence(outcome.nextAction);
            return outcome.code === "offer-version-stale" || outcome.code === "offer-unavailable"
                ? refused(t("staleOffer"), null, null)
                : refused(t("refusedNotAdmitted"), nextAction ?? t("nextActionSignIn"), null);
        }
        if (outcome.status === "unavailable") {
            return refused(t("checkoutUnavailable"), null, null);
        }
        if (outcome.status !== "offers" || outcome.selection.state !== "current") {
            return refused(t("staleOffer"), null, null);
        }
        if (frozen === null) {
            return refused(t("staleOffer"), null, null);
        }
        if (start.kind === "refused") {
            return refused(start.message, start.nextAction, frozen);
        }
        const notice = start.kind === "notice" ? start.notice : null;
        return {
            state: notice === null ? "review" : "not-started",
            props: {
                copy,
                links,
                facts: factsOf(frozen),
                admission: t("admitted"),
                steps: [
                    { title: copy.stepRecheck, detail: t("recheckDetail") },
                    { title: copy.stepIdentity, detail: purchaseRef ?? retryKeyFor(frozen) },
                    { title: copy.stepProvider, detail: chosenRail === null ? copy.railRequired : chosenRail.detail },
                ],
                purchaseRef: purchaseRef ?? retryKeyFor(frozen),
                rails,
                selectedRail: rail,
                notice,
                isPaymentPending: paymentPending,
            },
            on: { requestPayment: () => void requestPayment(), selectRail: setRail, changeOffer },
        };
    };
    return <CheckoutReviewFlowBase {...view()} />;
};
export { CheckoutReviewFlow };
export default CheckoutReviewFlow;