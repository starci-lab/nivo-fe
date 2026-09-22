"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { getPathname, useRouter } from "@/i18n/navigation";
import { useSession } from "@/modules/auth/session";
import { useMutateCreateWalletTopUpPayLinkSwr, useMutateOrderAgentosSwr, useQueryCatalogItemsSwr, useQueryMyInvoicesSwr } from "@/hooks";
import { BILLING_CURRENCY } from "@/modules/config";
import type { CatalogItemRow, CatalogTierRow, InvoiceRow } from "@/modules/api/console";
import type { WorkspacePurchasePayLink } from "@/modules/api/workspace-controlplane";
import { CheckoutReviewFlowBase, type CheckoutReviewCopy, type CheckoutReviewFlowViewProps } from "./component";
/** What the route hands the connected checkout owner: which selected offer and rung to review. */
export type CheckoutReviewFlowProps = {
    /** Catalog slug of the selected offer; falls back to the `offer` search parameter. */
    readonly offerSlug?: string;
    /** Catalog tier identity (`id` or `tierKey`); falls back to the `tier` search parameter. */
    readonly tierId?: string;
};
type CheckoutOffer = {
    readonly item: CatalogItemRow;
    readonly tier: CatalogTierRow | null;
};
type CheckoutFlow = {
    readonly phase: "loading";
} | {
    readonly phase: "review" | "not-started";
    readonly purchaseId: string;
    readonly offer: CheckoutOffer;
    /** Definitive no-start reason; rendered only on the not-started rail. */
    readonly notice: string | null;
} | {
    readonly phase: "refused";
    readonly offer: CheckoutOffer | null;
    readonly message: string;
};
/** The purchaser-identity claims the signed-in session's access token may carry. */
type PurchaserClaims = {
    readonly name?: unknown;
    readonly preferred_username?: unknown;
    readonly email?: unknown;
};
/**
 * Decode the purchaser claims inside the session's access token, the same claim surface the
 * Keycloak guard verifies server-side (`name`, `preferred_username`, `email`). A malformed or
 * claim-less token yields none, and the surface then withholds the named identity rather than
 * inventing one.
 */
const purchaserClaimsOf = (accessToken: string): PurchaserClaims => {
    const payload = accessToken.split(".")[1];
    if (payload === undefined) return {};
    try {
        const normalised = payload.replaceAll("-", "+").replaceAll("_", "/");
        const padded = normalised.padEnd(Math.ceil(normalised.length / 4) * 4, "=");
        return JSON.parse(globalThis.atob(padded)) as PurchaserClaims;
    } catch {
        return {};
    }
};
const claimText = (value: unknown): string | null => typeof value === "string" && value.trim().length > 0 ? value : null;
/** The admitted purchaser's bound display name: display name, then login handle, then contact. */
const purchaserNameOf = (claims: PurchaserClaims): string | null => claimText(claims.name) ?? claimText(claims.preferred_username) ?? claimText(claims.email);
/** The secondary identity the purchaser fact pairs beside the name, never repeating the name itself. */
const purchaserDetailOf = (claims: PurchaserClaims, name: string | null): string | null => {
    const detail = claimText(claims.email) ?? claimText(claims.preferred_username);
    return detail !== null && detail !== name ? detail : null;
};
/** Submit the provider form exactly like the existing wallet seam: POST hidden fields, then navigate. */
const postProviderCheckout = (link: WorkspacePurchasePayLink) => {
    const fields: Record<string, string> = link.checkoutFields === null ? {} : JSON.parse(link.checkoutFields);
    const form = document.createElement("form");
    form.method = "POST";
    form.action = link.checkoutUrl;
    Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
};
/** Route path (unlocalized) of the offer-selection surface the flow returns to. */
const OFFER_SELECTION_PATH = "/agentos/workspaces/new";
/** Route path (unlocalized) of one purchase's status surface. */
const purchaseStatusPath = (purchaseId: string) => `/agentos/workspaces/purchases/${purchaseId}`;
/** Checkout-review owner: catalogue recheck → idempotent purchase → provider checkout hand-off. */
const CheckoutReviewFlow = (props: CheckoutReviewFlowProps) => {
    const locale = useLocale();
    const format = useFormatter();
    const t = useTranslations("console.agentos.checkoutReview");
    const router = useRouter();
    const searchParams = useSearchParams();
    const session = useSession();
    const accessToken = session.state.status === "signed-in" ? session.state.accessToken : null;
    const offerSlug = props.offerSlug ?? searchParams.get("offer") ?? "";
    const tierId = props.tierId ?? searchParams.get("tier") ?? undefined;
    const catalogQuery = useQueryCatalogItemsSwr("ai_agent", accessToken !== null);
    const invoicesQuery = useQueryMyInvoicesSwr(accessToken !== null);
    const orderAgentos = useMutateOrderAgentosSwr();
    const payLink = useMutateCreateWalletTopUpPayLinkSwr();
    const orderAgentosRef = useRef(orderAgentos);
    orderAgentosRef.current = orderAgentos;
    const [flow, setFlow] = useState<CheckoutFlow>({ phase: "loading" });
    const [paymentPending, setPaymentPending] = useState(false);
    const pendingRef = useRef(false);
    const flowRef = useRef<CheckoutFlow>(flow);
    flowRef.current = flow;
    const preparedRef = useRef<string | null>(null);
    const route = (href: string) => getPathname({ locale, href });
    /* Anchors carry the localized href; the locale-aware router owns the prefix for pushes. */
    const links = {
        workspaces: route("/agentos"),
        offerSelection: route(OFFER_SELECTION_PATH),
    };
    const returnToOffers = () => router.push(OFFER_SELECTION_PATH);
    const invoiceFor = (purchaseId: string, invoices: InvoiceRow[] | ReadonlyArray<InvoiceRow> | undefined) => invoices?.find(row => row.catalogOrder?.id === purchaseId);
    const currentInvoices = invoicesQuery.data?.ok === true ? invoicesQuery.data.data : undefined;
    const amountText = (offer: CheckoutOffer, invoice: InvoiceRow | undefined) => {
        const amountVnd = invoice?.amountVnd ?? offer.tier?.priceMonthlyVnd ?? null;
        return amountVnd === null ? null : format.number(amountVnd, { style: "currency", currency: BILLING_CURRENCY, currencyDisplay: "narrowSymbol" });
    };
    const purchaserClaims = useMemo(() => accessToken === null ? {} : purchaserClaimsOf(accessToken), [accessToken]);
    const purchaserName = purchaserNameOf(purchaserClaims);
    const purchaserDetail = purchaserDetailOf(purchaserClaims, purchaserName);
    const purchaserFact = purchaserName === null ? null : purchaserDetail === null ? purchaserName : `${purchaserName} · ${purchaserDetail}`;
    const copy = useMemo<CheckoutReviewCopy>(() => ({
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
        railNote: t("railNote"),
        stepRecheck: t("stepRecheck"),
        stepIdentity: t("stepIdentity"),
        stepProvider: t("stepProvider"),
        requestPayment: t("requestPayment"),
        retryPayment: t("retryPayment"),
        changeOffer: t("changeOffer"),
        returnToOffers: t("returnToOffers"),
        footnote: t("footnote"),
        refusedTitle: t("refusedTitle"),
    }), [t]);
    useEffect(() => {
        if (accessToken === null) {
            return;
        }
        const catalogue = catalogQuery.data;
        if (catalogue === undefined) {
            return;
        }
        const refuse = (message: string, offer: CheckoutOffer | null = null) => setFlow({ phase: "refused", offer, message });
        if (!catalogue.ok) {
            refuse(t("checkoutUnavailable"));
            return;
        }
        if (offerSlug === "") {
            refuse(t("staleOffer"));
            return;
        }
        const item = catalogue.data.find(candidate => candidate.slug === offerSlug) ?? null;
        if (item === null) {
            refuse(t("staleOffer"));
            return;
        }
        const tiers = item.tiers ?? [];
        const tier = tierId === undefined ? null : tiers.find(candidate => candidate.id === tierId || candidate.tierKey === tierId) ?? null;
        if ((tierId !== undefined && tier === null) || (tiers.length > 0 && tier === null)) {
            refuse(t("staleOffer"), { item, tier: null });
            return;
        }
        const offer: CheckoutOffer = { item, tier };
        const key = `${item.slug}:${tier?.id ?? ""}`;
        if (preparedRef.current === key) {
            return;
        }
        preparedRef.current = key;
        const prepare = async () => {
            try {
                const order = await orderAgentosRef.current.trigger({ catalogItemSlug: item.slug, catalogTierId: tier?.id });
                if (!order.ok) {
                    refuse(order.reason, offer);
                    return;
                }
                setFlow({ phase: "review", purchaseId: order.data.id, offer, notice: null });
            } catch {
                refuse(t("checkoutUnavailable"), offer);
            }
        };
        void prepare();
    }, [accessToken, catalogQuery.data, offerSlug, tierId, t]);
    const requestPayment = async () => {
        const current = flowRef.current;
        /* A synchronous ref guards the in-flight press; a re-render cannot arrive before a second press. */
        if ((current.phase !== "review" && current.phase !== "not-started") || pendingRef.current) {
            return;
        }
        const notStarted = (notice: string) => setFlow({ ...current, phase: "not-started", notice });
        pendingRef.current = true;
        setPaymentPending(true);
        try {
            /* Re-read the owner's invoices through the query lifecycle before raising the action. */
            const fresh = await invoicesQuery.mutate().catch(() => undefined);
            const invoice = invoiceFor(current.purchaseId, fresh?.ok === true ? fresh.data : undefined);
            if (invoice === undefined) {
                notStarted(t("paymentNotStarted"));
                return;
            }
            if (invoice.status === "paid") {
                router.push(purchaseStatusPath(current.purchaseId));
                return;
            }
            if (invoice.status === "cancelled") {
                setFlow({ phase: "refused", offer: current.offer, message: t("paymentRefused") });
                return;
            }
            /* The provider needs an absolute, already-localized return address; router.push does not. */
            const destination = `${window.location.origin}${route(purchaseStatusPath(current.purchaseId))}`;
            let link;
            try {
                link = await payLink.trigger({ amountVnd: invoice.amountVnd, returnUrl: destination, cancelUrl: `${destination}?payment=cancelled` });
            } catch {
                router.push(purchaseStatusPath(current.purchaseId));
                return;
            }
            if (!link.ok) {
                notStarted(link.reason);
                return;
            }
            try {
                postProviderCheckout(link.data);
            } catch {
                notStarted(t("checkoutInvalid"));
            }
        } finally {
            pendingRef.current = false;
            setPaymentPending(false);
        }
    };
    const changeOffer = () => {
        /* The TextAction carries the real href; this handler stays for action tracing. */
    };
    const view = (): CheckoutReviewFlowViewProps => {
        if (flow.phase === "loading") {
            return { state: "loading", props: { copy, links } };
        }
        if (flow.phase === "refused") {
            const offer = flow.offer;
            const facts = offer === null ? null : {
                offer: `${offer.item.name}${offer.tier === null ? "" : ` · ${offer.tier.name}`}`,
                offerVersion: `${offer.item.slug}${offer.tier === null ? "" : ` · ${offer.tier.tierKey}`}`,
                amount: amountText(offer, undefined) ?? "—",
                billingTerm: offer.tier?.priceMonthlyVnd == null ? t("oneTimeBilling") : t("monthlyBilling"),
                renewal: offer.tier?.priceMonthlyVnd == null ? t("noRenewal") : t("renewalManual"),
                includedOutcome: offer.item.tagline ?? offer.item.name,
                eligibility: t("eligibilityValue"),
                seller: t("sellerValue"),
                purchaser: purchaserFact,
            };
            return { state: "refused", props: { copy, links, facts, message: flow.message }, on: { returnToOffers } };
        }
        const { offer, purchaseId } = flow;
        const amount = amountText(offer, invoiceFor(purchaseId, currentInvoices));
        const facts = {
            offer: `${offer.item.name}${offer.tier === null ? "" : ` · ${offer.tier.name}`}`,
            offerVersion: `${offer.item.slug}${offer.tier === null ? "" : ` · ${offer.tier.tierKey}`}`,
            amount: amount ?? t("checkoutUnavailable"),
            billingTerm: offer.tier?.priceMonthlyVnd == null ? t("oneTimeBilling") : t("monthlyBilling"),
            renewal: offer.tier?.priceMonthlyVnd == null ? t("noRenewal") : t("renewalManual"),
            includedOutcome: offer.item.tagline ?? offer.item.name,
            eligibility: t("eligibilityValue"),
            seller: t("sellerValue"),
            purchaser: purchaserFact,
        };
        return {
            state: flow.phase,
            props: {
                copy,
                links,
                facts,
                admission: purchaserName === null ? t("admitted") : t("admissionNamed", { name: purchaserName }),
                steps: [
                    { title: copy.stepRecheck, detail: purchaserName === null ? t("recheckDetail") : t("recheckDetailNamed", { name: purchaserName }) },
                    { title: copy.stepIdentity, detail: purchaseId },
                    { title: copy.stepProvider, detail: t("providerRail") },
                ],
                purchaseRef: purchaseId,
                notice: flow.notice,
                isPaymentPending: paymentPending,
            },
            on: { requestPayment: () => void requestPayment(), changeOffer },
        };
    };
    return <CheckoutReviewFlowBase {...view()} />;
};
export { CheckoutReviewFlow };
export default CheckoutReviewFlow;
