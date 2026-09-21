"use client";

import { useEffect, useRef, useState } from "react";
import { useFormatter, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { getPathname, useRouter } from "@/i18n/navigation";
import { DEFAULT_LOCALE } from "@/i18n/config";
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
/**
 * Copy mirroring the owner-accepted checkout direction while owner-visible message keys land;
 * every phrase is copy — all data values resolve from live seams.
 */
const COPY: CheckoutReviewCopy = {
    path: "Purchase path",
    workspaces: "Workspaces",
    newWorkspace: "New",
    checkout: "Checkout",
    title: "Review workspace purchase",
    description: "Confirm the frozen offer terms before requesting payment.",
    offerLabel: "Frozen offer",
    offer: "Offer",
    offerVersion: "Offer version",
    amount: "Amount and currency",
    billingTerm: "Billing term",
    renewal: "Renewal",
    includedOutcome: "Included outcome",
    eligibility: "Eligibility",
    seller: "Seller and invoice source",
    admission: "Purchaser admission",
    railLabel: "Request payment",
    railNote: "This request reuses the same purchase identity and opens the provider checkout. It does not mark payment as paid.",
    stepRecheck: "Recheck admission and frozen terms",
    stepIdentity: "Create purchase identity",
    stepProvider: "Open payment action",
    requestPayment: "Request payment",
    retryPayment: "Retry payment request",
    changeOffer: "Change offer",
    returnToOffers: "Return to offer selection",
    footnote: "Browser return is navigation, not payment proof.",
    refusedTitle: "Checkout cannot continue",
};
const LABELS = {
    admitted: "Admitted",
    eligibility: "Vietnam · admitted purchaser",
    seller: "Nivo · platform invoice",
    recheckDetail: "Admitted purchaser · current offer terms",
    providerRail: "SePay · Online banking",
    monthlyBilling: "Monthly billing",
    oneTimeBilling: "One-time charge",
    renewalManual: "Manual re-authorization required each period",
    noRenewal: "Manual re-authorization required for renewal",
    staleOffer: "The selected offer is no longer current. Return to offer selection and choose a current offer.",
    checkoutUnavailable: "Checkout could not confirm this purchase. The offer may have changed.",
    paymentNotStarted: "No payment request was accepted. The same purchase identity remains available for a safe retry.",
    paymentRefused: "This purchase's invoice was cancelled. Return to offer selection to start a current purchase.",
    checkoutInvalid: "The provider returned unreadable checkout fields.",
} as const;
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
/** Checkout-review owner: catalogue recheck → idempotent purchase → provider checkout hand-off. */
const CheckoutReviewFlow = (props: CheckoutReviewFlowProps) => {
    const locale = useLocale();
    const format = useFormatter();
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
    const links = {
        workspaces: route("/agentos"),
        offerSelection: route("/agentos/workspaces/new"),
    };
    const paymentStatusRoute = (purchaseId: string) => getPathname({ locale: DEFAULT_LOCALE, href: `/agentos/workspaces/purchases/${purchaseId}` });
    const returnToOffers = () => router.push(links.offerSelection);
    const invoiceFor = (purchaseId: string, invoices: InvoiceRow[] | ReadonlyArray<InvoiceRow> | undefined) => invoices?.find(row => row.catalogOrder?.id === purchaseId);
    const currentInvoices = invoicesQuery.data?.ok === true ? invoicesQuery.data.data : undefined;
    const amountText = (offer: CheckoutOffer, invoice: InvoiceRow | undefined) => {
        const amountVnd = invoice?.amountVnd ?? offer.tier?.priceMonthlyVnd ?? null;
        return amountVnd === null ? null : format.number(amountVnd, { style: "currency", currency: BILLING_CURRENCY, currencyDisplay: "narrowSymbol" });
    };
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
            refuse(LABELS.checkoutUnavailable);
            return;
        }
        if (offerSlug === "") {
            refuse(LABELS.staleOffer);
            return;
        }
        const item = catalogue.data.find(candidate => candidate.slug === offerSlug) ?? null;
        if (item === null) {
            refuse(LABELS.staleOffer);
            return;
        }
        const tiers = item.tiers ?? [];
        const tier = tierId === undefined ? null : tiers.find(candidate => candidate.id === tierId || candidate.tierKey === tierId) ?? null;
        if ((tierId !== undefined && tier === null) || (tiers.length > 0 && tier === null)) {
            refuse(LABELS.staleOffer, { item, tier: null });
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
                refuse(LABELS.checkoutUnavailable, offer);
            }
        };
        void prepare();
    }, [accessToken, catalogQuery.data, offerSlug, tierId]);
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
                notStarted(LABELS.paymentNotStarted);
                return;
            }
            if (invoice.status === "paid") {
                router.push(paymentStatusRoute(current.purchaseId));
                return;
            }
            if (invoice.status === "cancelled") {
                setFlow({ phase: "refused", offer: current.offer, message: LABELS.paymentRefused });
                return;
            }
            const destination = `${window.location.origin}${paymentStatusRoute(current.purchaseId)}`;
            let link;
            try {
                link = await payLink.trigger({ amountVnd: invoice.amountVnd, returnUrl: destination, cancelUrl: `${destination}?payment=cancelled` });
            } catch {
                router.push(paymentStatusRoute(current.purchaseId));
                return;
            }
            if (!link.ok) {
                notStarted(link.reason);
                return;
            }
            try {
                postProviderCheckout(link.data);
            } catch {
                notStarted(LABELS.checkoutInvalid);
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
            return { state: "loading", props: { copy: COPY, links } };
        }
        if (flow.phase === "refused") {
            const offer = flow.offer;
            const facts = offer === null ? null : {
                offer: `${offer.item.name}${offer.tier === null ? "" : ` · ${offer.tier.name}`}`,
                offerVersion: `${offer.item.slug}${offer.tier === null ? "" : ` · ${offer.tier.tierKey}`}`,
                amount: amountText(offer, undefined) ?? "—",
                billingTerm: offer.tier?.priceMonthlyVnd == null ? LABELS.oneTimeBilling : LABELS.monthlyBilling,
                renewal: offer.tier?.priceMonthlyVnd == null ? LABELS.noRenewal : LABELS.renewalManual,
                includedOutcome: offer.item.tagline ?? offer.item.name,
                eligibility: LABELS.eligibility,
                seller: LABELS.seller,
            };
            return { state: "refused", props: { copy: COPY, links, facts, message: flow.message }, on: { returnToOffers } };
        }
        const { offer, purchaseId } = flow;
        const amount = amountText(offer, invoiceFor(purchaseId, currentInvoices));
        const facts = {
            offer: `${offer.item.name}${offer.tier === null ? "" : ` · ${offer.tier.name}`}`,
            offerVersion: `${offer.item.slug}${offer.tier === null ? "" : ` · ${offer.tier.tierKey}`}`,
            amount: amount ?? LABELS.checkoutUnavailable,
            billingTerm: offer.tier?.priceMonthlyVnd == null ? LABELS.oneTimeBilling : LABELS.monthlyBilling,
            renewal: offer.tier?.priceMonthlyVnd == null ? LABELS.noRenewal : LABELS.renewalManual,
            includedOutcome: offer.item.tagline ?? offer.item.name,
            eligibility: LABELS.eligibility,
            seller: LABELS.seller,
        };
        return {
            state: flow.phase,
            props: {
                copy: COPY,
                links,
                facts,
                admission: LABELS.admitted,
                steps: [
                    { title: COPY.stepRecheck, detail: LABELS.recheckDetail },
                    { title: COPY.stepIdentity, detail: purchaseId },
                    { title: COPY.stepProvider, detail: LABELS.providerRail },
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
