"use client";

import { useState } from "react";
import { useFormatter, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { getPathname } from "@/i18n/navigation";
import { useSession } from "@/modules/auth/session";
import { useQueryWorkspaceCheckoutOffersSwr } from "@/hooks";
import type { WorkspaceCheckoutOffer } from "@/modules/api/workspace-controlplane";
import { OfferSelectionFlowBase, type OfferSelectionCopy, type OfferSelectionFlowProps, type OfferSelectionOffer } from "./component";

/** Route path (unlocalized) of the surfaces this screen hands off to. */
const OFFER_SELECTION_PATH = "/agentos/workspaces/new";
const CHECKOUT_PATH = "/agentos/workspaces/new/checkout";
const WORKSPACES_PATH = "/agentos/workspaces";
/** The registered Login address; it carries both sign-in and the surface's self-service registration. */
const LOGIN_PATH = "/authentication";

/**
 * The offer identity this surface presents first.
 *
 * THE SELECTION IS DATA, NOT AUTHORITY: the boundary decides whether this exact version may still be
 * bought and answers current, stale or unavailable beside the same approved list, so presenting a
 * candidate identity here never asserts that it is purchasable.
 */
const PRESENTED_OFFER_ID = "nivo-workspace-growth";
const PRESENTED_OFFER_VERSION = "draft-2026-09-22";

/** Resolved copy of this surface. Offer-selection copy stays block-local: the message catalog files are outside this cut's owned paths. */
const COPY: OfferSelectionCopy = {
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
};

/** The boundary's own refusal code read as the sentence this surface shows. */
const refusalSentence = (code: string): string => code === "purchaser-not-admitted"
    ? "The signed-in account is not an admitted purchaser yet. Verify its email, or create a purchaser account, then return to this step."
    : "No valid Login session was found. Sign in, or create an account, then return to this step.";

/** One boundary offer read into the view's field vocabulary; the amount keeps its currency inseparably. */
const toViewOffer = (offer: WorkspaceCheckoutOffer, formatAmount: (offer: WorkspaceCheckoutOffer) => string): OfferSelectionOffer => ({
    offerId: offer.offerId,
    offerVersion: offer.offerVersion,
    displayName: offer.displayName,
    amount: formatAmount(offer),
    billingCadence: offer.billingCadence,
    renewalMode: offer.renewalMode,
    includedOutcome: offer.includedOutcome,
    eligibility: offer.eligibility,
});

/** Offer-selection owner: the boundary's current-offer read → the review handoff carrying identity only. */
const OfferSelectionFlow = () => {
    const locale = useLocale();
    const format = useFormatter();
    const searchParams = useSearchParams();
    const session = useSession();
    const accessToken = session.state.status === "signed-in" ? session.state.accessToken : null;
    const [presented, setPresented] = useState(() => ({
        offerId: searchParams.get("offer") ?? PRESENTED_OFFER_ID,
        offerVersion: searchParams.get("offerVersion") ?? PRESENTED_OFFER_VERSION,
    }));
    const offersQuery = useQueryWorkspaceCheckoutOffersSwr(presented.offerId, presented.offerVersion, accessToken !== null);
    const answer = offersQuery.data;
    const route = (href: string): string => getPathname({ locale, href });
    const links = { workspaces: route(WORKSPACES_PATH) };
    const loginHref = `${route(LOGIN_PATH)}?returnTo=${encodeURIComponent(route(OFFER_SELECTION_PATH))}`;
    const formatAmount = (offer: WorkspaceCheckoutOffer): string => {
        const amount = Number(offer.amount);
        return Number.isFinite(amount)
            ? format.number(amount, { style: "currency", currency: offer.currency, currencyDisplay: "narrowSymbol" })
            : `${offer.amount} ${offer.currency}`;
    };
    const offers = answer?.ok === true && answer.data.status === "offers" ? answer.data.offers.map(offer => toViewOffer(offer, formatAmount)) : [];
    const select = (offerId: string) => {
        const chosen = answer?.ok === true && answer.data.status === "offers" ? answer.data.offers.find(offer => offer.offerId === offerId) : undefined;
        if (chosen === undefined) return;
        setPresented({ offerId: chosen.offerId, offerVersion: chosen.offerVersion });
    };
    const view = (): OfferSelectionFlowProps => {
        const unavailable = (message: string, isRefreshPending = false): OfferSelectionFlowProps => ({ state: "unavailable", props: { copy: COPY, links, offers, message, isRefreshPending }, on: { refresh: () => void offersQuery.mutate() } });
        const noSession = (message: string): OfferSelectionFlowProps => ({ state: "no-session", props: { copy: COPY, links, message, signInHref: loginHref, signUpHref: loginHref }, on: { signIn: () => undefined } });
        if (session.state.status === "restoring") {
            return { state: "loading", props: { copy: COPY, links } };
        }
        if (accessToken === null) {
            return noSession(refusalSentence("unauthenticated"));
        }
        if (answer === undefined) {
            return offersQuery.error === undefined ? { state: "loading", props: { copy: COPY, links } } : unavailable(COPY.unavailableTitle, true);
        }
        if (!answer.ok) {
            return unavailable(answer.reason);
        }
        const outcome = answer.data;
        if (outcome.status === "refused") {
            return outcome.code === "unauthenticated" || outcome.code === "purchaser-not-admitted" ? noSession(refusalSentence(outcome.code)) : unavailable(COPY.unavailableTitle);
        }
        if (outcome.status !== "offers" || outcome.selection.state !== "current" || offers.length === 0) {
            return unavailable(COPY.unavailableTitle, offersQuery.isValidating);
        }
        const checkoutHref = `${route(CHECKOUT_PATH)}?offer=${encodeURIComponent(presented.offerId)}&offerVersion=${encodeURIComponent(presented.offerVersion)}`;
        return { state: "selection", props: { copy: COPY, links, offers, selectedOfferId: presented.offerId, checkoutHref }, on: { select } };
    };
    return <OfferSelectionFlowBase {...view()} />;
};

export { OfferSelectionFlow };
export default OfferSelectionFlow;