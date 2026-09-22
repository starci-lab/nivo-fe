"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { getPathname } from "@/i18n/navigation";
import { useSession } from "@/modules/auth/session";
import { useQueryCatalogItemsSwr } from "@/hooks";
import { OfferSelectionFlowBase, type OfferSelectionCopy, type OfferSelectionFlowProps, type OfferSelectionOffer } from "./component";

/**
 * Copy mirroring the owner-accepted offer-selection direction while owner-visible message keys
 * land; every phrase is copy — all offer values bind to the accepted provisional draft catalog.
 */
const COPY: OfferSelectionCopy = {
    path: "Purchase path",
    workspaces: "Workspaces",
    newWorkspace: "New",
    title: "Choose a workspace offer",
    description: "Compare provisional Vietnamese launch terms before checkout.",
    offersLabel: "Available offers",
    offersFact: "Draft recommendation • VND",
    offerGroupLabel: "Workspace offers",
    billingCadence: "Billing cadence",
    renewalBehavior: "Renewal behavior",
    includedOutcome: "Included workspace outcome",
    eligibility: "Eligibility",
    selectedBadge: "Selected",
    selectedDraft: "Selected draft",
    provisionalNote: "Terms are provisional until owner approval.",
    reviewAction: "Review selected offer",
    noPaymentNote: "No payment is requested on this screen.",
    backToWorkspaces: "Back to workspaces",
    unavailableTitle: "Offers cannot be read right now",
    refreshOffers: "Refresh offers",
};

/*
 * The owner-accepted provisional offer set from the round-3 offer-selection evidence
 * (ui/purchase-flow/evidence/round-3/offer-selection/manifest.yaml). The payment-provider
 * decision is still open, so no live catalog publishes these offers yet: they render as the
 * draft recommendation under explicit provisional disclosure, and checkout's own recheck stays
 * the authority on whether a selected identity is current before any purchase effect.
 */
const DRAFT_OFFER_VERSION = "draft-2026-09-22";
/**
 * The provisional draft catalog this screen compares until an approved offer source ships.
 * Exported so colocated specs assert the accepted values rather than redeclaring them.
 */
export const OFFER_SELECTION_DRAFT_OFFERS: ReadonlyArray<OfferSelectionOffer> = [
    {
        offerId: "nivo-workspace-starter",
        offerVersion: DRAFT_OFFER_VERSION,
        displayName: "Nivo Workspace Starter",
        amount: "1,490,000",
        currency: "VND",
        amountCadence: "year",
        billingCadence: "Annual billing",
        renewalMode: "Manual reauthorization each year",
        includedOutcome: "1 managed AI workspace • up to 5 members",
        capacity: "Up to 5 members",
        eligibility: "Eligible: verified businesses in Vietnam",
    },
    {
        offerId: "nivo-workspace-growth",
        offerVersion: DRAFT_OFFER_VERSION,
        displayName: "Nivo Workspace Growth",
        amount: "2,990,000",
        currency: "VND",
        amountCadence: "year",
        billingCadence: "Annual billing",
        renewalMode: "Manual reauthorization each year",
        includedOutcome: "1 managed AI workspace • up to 15 members",
        capacity: "Up to 15 members",
        eligibility: "Eligible: verified businesses in Vietnam",
    },
    {
        offerId: "nivo-workspace-scale",
        offerVersion: DRAFT_OFFER_VERSION,
        displayName: "Nivo Workspace Scale",
        amount: "5,990,000",
        currency: "VND",
        amountCadence: "year",
        billingCadence: "Annual billing",
        renewalMode: "Manual reauthorization each year",
        includedOutcome: "1 managed AI workspace • up to 40 members",
        capacity: "Up to 40 members",
        eligibility: "Eligible: verified businesses in Vietnam",
    },
];

/** The accepted direction opens with the Growth draft selected. */
const DEFAULT_SELECTED_OFFER_ID = "nivo-workspace-growth";

/** Offer-selection owner: live offer-source read → accepted draft comparison → review hand-off. */
const OfferSelectionFlow = () => {
    const locale = useLocale();
    const session = useSession();
    const accessToken = session.state.status === "signed-in" ? session.state.accessToken : null;
    const catalogQuery = useQueryCatalogItemsSwr("ai_agent", accessToken !== null);
    const [selectedOfferId, setSelectedOfferId] = useState(DEFAULT_SELECTED_OFFER_ID);
    const links = {
        workspaces: getPathname({ locale, href: "/agentos/workspaces" }),
    };
    const selected = OFFER_SELECTION_DRAFT_OFFERS.find(offer => offer.offerId === selectedOfferId) ?? OFFER_SELECTION_DRAFT_OFFERS[0];
    /* Selection carries offerId and offerVersion verbatim; continuing is navigation, never a purchase. */
    const checkoutHref = `${getPathname({ locale, href: "/agentos/workspaces/new/checkout" })}?offer=${encodeURIComponent(selected.offerId)}&offerVersion=${encodeURIComponent(selected.offerVersion)}`;
    const view = (): OfferSelectionFlowProps => {
        const catalogue = catalogQuery.data;
        if (accessToken === null || catalogue === undefined) {
            return { state: "loading", props: { copy: COPY, links } };
        }
        if (!catalogue.ok) {
            return {
                state: "unavailable",
                props: {
                    copy: COPY,
                    links,
                    offers: OFFER_SELECTION_DRAFT_OFFERS,
                    message: catalogue.reason,
                    isRefreshPending: catalogQuery.isValidating,
                },
                on: {
                    refresh: () => void catalogQuery.mutate(),
                },
            };
        }
        return {
            state: "selection",
            props: {
                copy: COPY,
                links,
                offers: OFFER_SELECTION_DRAFT_OFFERS,
                selectedOfferId: selected.offerId,
                checkoutHref,
            },
            on: {
                select: setSelectedOfferId,
            },
        };
    };
    return <OfferSelectionFlowBase {...view()} />;
};

export { OfferSelectionFlow };
export default OfferSelectionFlow;
