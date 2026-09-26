"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { getPathname, useRouter } from "@/i18n/navigation";
import { useSession } from "@/modules/auth/session";
import { useMutateRecoverWorkspacePurchaseSwr, useQueryWorkspaceCheckoutEntrySwr, useQueryWorkspaceCheckoutStatusSwr } from "@/hooks";
import { type WorkspaceCheckoutEntryDestination, type WorkspaceCheckoutEntryRequest, type WorkspaceCheckoutObservedIdentities, type WorkspaceCheckoutOutcome, type WorkspaceCheckoutStatusView } from "@/modules/api/workspace-controlplane";
import useProvisioningRealtime, { type ProvisioningTarget } from "@/modules/realtime/provisioning";
import { nivoIconSource } from "@nivo/ui";
import { type IconSource } from "@starci/grammar/common";
import { PurchaseStatusFlowBase, type PurchaseStatusCheck, type PurchaseStatusFlowViewProps, type PurchaseStatusOperation, type PurchaseStatusRail } from "./component";
import { type PurchaseStatusCopy } from "./copy";

/** Route identity owned by the purchase-status block: one stable purchase identity. */
export type PurchaseStatusFlowProps = {
    readonly purchaseId: string;
    /** The declared /provisioning route pins the provisioning surface directly; the payment journey still resolves underneath. */
    readonly surface?: "provisioning";
};

/** The phase names the view union admits. */
type PurchasePhase =
    | "loading"
    | "payment-pending"
    | "payment-unknown"
    | "payment-refused"
    | "payment-failed"
    | "payment-cancelled"
    | "paid"
    | "queued"
    | "provisioning"
    | "provisioning-unknown"
    | "provisioning-refused"
    | "provisioning-failed-retryable"
    | "provisioning-failed-terminal"
    | "refund-started"
    | "refunded"
    | "refund-pending-reconciliation"
    | "service-eligibility-hold"
    | "ready"
    | "denied";

/** Phases that draw the payment surface's fact card and verification rail. */
const PAYMENT_PHASES: ReadonlySet<PurchasePhase> = new Set(["payment-pending", "payment-unknown", "payment-refused", "payment-failed", "payment-cancelled", "paid"]);
/** Phases that draw the provisioning surface's order card and confirmed-facts rail. */
const PROVISIONING_PHASES: ReadonlySet<PurchasePhase> = new Set(["queued", "provisioning", "provisioning-unknown", "provisioning-refused", "provisioning-failed-retryable", "provisioning-failed-terminal", "refund-started", "refunded", "refund-pending-reconciliation", "service-eligibility-hold", "ready"]);
/** Phases whose truth can still move; the surface keeps re-reading the same purchase on a slow interval. */
const POLLING_PHASES: ReadonlySet<PurchasePhase> = new Set(["payment-pending", "payment-unknown", "paid", "queued", "provisioning", "provisioning-unknown", "refund-started", "refund-pending-reconciliation", "service-eligibility-hold"]);
/** Phases an entitlement hold re-renders as the hold state; refusal and refund truth stay itself. */
const HOLD_PHASES: ReadonlySet<PurchasePhase> = new Set(["queued", "provisioning", "provisioning-unknown", "provisioning-failed-retryable", "provisioning-failed-terminal", "ready"]);
/** Provisioning-order dispositions the owner publishes once an order exists for the purchase. */
const OBSERVED_ORDER_STATES: ReadonlySet<string> = new Set(["admitted", "running", "outcome-unknown", "refused", "failed-retryable", "failed-terminal", "ready"]);
/** The registered workspace-shell destination the entry owner may return. */
const ENTRY_ROUTE_NAME = "instance-management.workspace-shell";

/** The owner-identity claims the signed-in session's access token may carry. */
type PurchaserClaims = {
    readonly name?: unknown;
    readonly preferred_username?: unknown;
    readonly email?: unknown;
};
/**
 * Decode the owner claims inside the session's access token, the same claim surface the Keycloak
 * guard verifies server-side (`name`, `preferred_username`, `email`). A malformed or claim-less
 * token yields none, and the surface then withholds the named identity rather than inventing one.
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
/** The provisioning owner's bound display name: display name, then login handle, then contact. */
const purchaserNameOf = (claims: PurchaserClaims): string | null => claimText(claims.name) ?? claimText(claims.preferred_username) ?? claimText(claims.email);
/** The secondary identity the owner fact pairs beside the name, never repeating the name itself. */
const purchaserDetailOf = (claims: PurchaserClaims, name: string | null): string | null => {
    const detail = claimText(claims.email) ?? claimText(claims.preferred_username);
    return detail !== null && detail !== name ? detail : null;
};

/**
 * The Provisioning order header binds only the durable provisioning-order identity the checkout
 * status read publishes on its provisioning facet - the order's own `provisioningOrderId`, a
 * reference distinct from the purchase identity. It is never the purchase id (already rendered
 * under the Purchase fact), never the workspace id, and never a fabricated value; a facet that
 * answered `none` or `unavailable` withholds the trailing fact.
 */
const provisioningOrderRefOf = (purchase: WorkspaceCheckoutStatusView): string | null =>
    OBSERVED_ORDER_STATES.has(purchase.provisioning.state) ? purchase.provisioning.reference : null;

/**
 * The exact source identities the screen actually observed, sent on the safe-recovery call so the
 * backend can refuse a caller whose last view contradicts the confirmed record. `payment.reference`
 * is never forwarded: the reconciliation owner returns the provider reference or the attempt id in
 * the same slot, and claiming it as either could raise a false identity conflict.
 */
const observedIdentitiesOf = (purchase: WorkspaceCheckoutStatusView): WorkspaceCheckoutObservedIdentities => ({
    ...(purchase.billing.reference !== null ? { billingReceiptId: purchase.billing.reference } : {}),
    ...(purchase.provisioning.reference !== null ? { provisioningOrderId: purchase.provisioning.reference } : {}),
    ...(purchase.readiness.state === "ready" && purchase.readiness.reference !== null ? { workspaceId: purchase.readiness.reference } : {})
});

/**
 * The refund-family phase a refused paid order stands on. `refunded` is shown only beside its
 * linked refund ledger entry; an unavailable or unlinked projection keeps the refused order beside
 * the pending-reconciliation truth instead of a settled claim.
 */
const refundPhaseOf = (purchase: WorkspaceCheckoutStatusView): PurchasePhase => {
    const refund = purchase.refund ?? purchase.refundStatus;
    if (refund === null || refund === undefined) return "provisioning-refused";
    if (refund.state === "refunded") {
        const refundEntryId = purchase.refund?.refundEntryId ?? null;
        const ledger = purchase.ledger;
        const linked = refundEntryId !== null
            && ledger !== null
            && ledger.state === "observed"
            && ledger.entries.some(entry => entry.entryId === refundEntryId && entry.kind === "refund");
        return linked ? "refunded" : "refund-pending-reconciliation";
    }
    if (refund.state === "refund-started") return "refund-started";
    if (refund.state === "refund-pending-reconciliation") return "refund-pending-reconciliation";
    return "provisioning-refused";
};

/**
 * Settle the composed purchase view into the phase it proves. `paid` reports only the billing
 * owner's posted settlement; readiness comes only from the readiness facet's own `ready`; and an
 * `unavailable` facet is never promoted into a stronger claim.
 */
const phaseOf = (purchase: WorkspaceCheckoutStatusView): PurchasePhase => {
    switch (purchase.state) {
        case "selected":
        case "payment-not-started":
        case "payment-pending":
            return "payment-pending";
        case "payment-outcome-unknown":
            return "payment-unknown";
        case "payment-refused":
            return "payment-refused";
        case "payment-failed":
            return "payment-failed";
        case "payment-cancelled":
            return "payment-cancelled";
        case "paid":
            return "paid";
        case "ready":
        case "renewed":
            return purchase.readiness.state === "ready" ? "ready" : purchase.readiness.state === "unavailable" ? "provisioning-unknown" : "provisioning";
        case "provisioning-refused":
            return refundPhaseOf(purchase);
        case "provisioning":
            switch (purchase.provisioning.state) {
                case "none":
                case "admitted":
                    return "queued";
                case "running":
                    return "provisioning";
                case "unavailable":
                case "outcome-unknown":
                    return "provisioning-unknown";
                case "refused":
                    return refundPhaseOf(purchase);
                case "failed-retryable":
                    return "provisioning-failed-retryable";
                case "failed-terminal":
                    return "provisioning-failed-terminal";
                case "ready":
                    return purchase.readiness.state === "ready" ? "ready" : purchase.readiness.state === "unavailable" ? "provisioning-unknown" : "provisioning";
                default:
                    return "provisioning";
            }
    }
};

/** The registered entry destination is a named route; only the workspace shell maps onto this app. */
const entryPathOf = (destination: WorkspaceCheckoutEntryDestination): string | null =>
    destination.routeName === ENTRY_ROUTE_NAME ? `/agentos/workspaces/${destination.workspaceId}` : null;

type WordTone = { readonly word: "done" | "running" | "queued" | "failed" | "unknown"; readonly tone: "success" | "accent" | "neutral" | "danger" | "warning" };

/** The header badge variants a phase can raise. */
type PurchaseStatusBadge = { readonly label: string; readonly tone: "warning" | "accent" | "success" | "danger" | "neutral" };

const CHECK_TONES: Readonly<Record<WordTone["word"], WordTone["tone"]>> = {
    done: "success",
    running: "warning",
    queued: "neutral",
    failed: "danger",
    unknown: "warning"
};

/** The circular mark each check word carries, resolved from the app icon registry. */
const CHECK_MARKS: Readonly<Record<WordTone["word"], IconSource>> = {
    done: nivoIconSource("complete"),
    running: nivoIconSource("retry"),
    queued: nivoIconSource("pending"),
    failed: nivoIconSource("close"),
    unknown: nivoIconSource("pending")
};

const check = (id: string, label: string, word: WordTone["word"], detail?: string, at?: string): PurchaseStatusCheck => ({
    id,
    label,
    word,
    tone: CHECK_TONES[word],
    mark: CHECK_MARKS[word],
    detail,
    at
});

/** The purchase view one checkout outcome carries, when the arm carries one at all. */
const purchaseOf = (outcome: WorkspaceCheckoutOutcome | null): WorkspaceCheckoutStatusView | null =>
    outcome !== null && "purchase" in outcome && outcome.purchase !== undefined ? outcome.purchase : null;

/** Connected purchase → payment → workspace status surface bound to one stable purchase identity. */
const PurchaseStatusFlow = (props: PurchaseStatusFlowProps) => {
    const { purchaseId, surface } = props;
    const format = useFormatter();
    const locale = useLocale();
    const t = useTranslations("console.agentos.purchaseStatus");
    const router = useRouter();
    const session = useSession();
    const accessToken = session.state.status === "signed-in" ? session.state.accessToken : null;
    const statusQuery = useQueryWorkspaceCheckoutStatusSwr(purchaseId, accessToken !== null);
    const recoverPurchase = useMutateRecoverWorkspacePurchaseSwr();
    const [surfacePinned, setSurfacePinned] = useState(surface);
    const [entryAsked, setEntryAsked] = useState(false);
    const [entryRefusal, setEntryRefusal] = useState<string | null>(null);
    const [recoverRefusal, setRecoverRefusal] = useState<string | null>(null);
    const [purchaseOverride, setPurchaseOverride] = useState<WorkspaceCheckoutStatusView | null>(null);
    const consumedEntry = useRef<unknown>(null);
    const links = useMemo(() => ({
        workspaces: getPathname({ locale, href: "/agentos/workspaces" }),
        offerSelection: getPathname({ locale, href: "/agentos/workspaces/new" })
    }), [locale]);
    const purchaserClaims = useMemo(() => accessToken === null ? {} : purchaserClaimsOf(accessToken), [accessToken]);
    const purchaserName = purchaserNameOf(purchaserClaims);
    const purchaserDetail = purchaserDetailOf(purchaserClaims, purchaserName);
    const purchaserFact = purchaserName === null ? null : purchaserDetail === null ? purchaserName : `${purchaserName} · ${purchaserDetail}`;

    const copy = useMemo<PurchaseStatusCopy>(() => {
        const kebab = (value: string): string => value.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
        const keyed = (prefix: string) => (value: string) => t.has(`${prefix}.${value}`) ? t(`${prefix}.${value}`) : value;
        return {
            path: t("path"),
            workspaces: t("workspaces"),
            purchases: t("purchases"),
            provisioning: t("provisioning"),
            loadingTitle: t("loadingTitle"),
            loadingText: t("loadingText"),
            paymentPendingTitle: t("paymentPendingTitle"),
            paymentPendingBadge: t("paymentPendingBadge"),
            paymentPendingSubtitle: t("paymentPendingSubtitle"),
            paymentUnknownTitle: t("paymentUnknownTitle"),
            paymentUnknownBadge: t("paymentUnknownBadge"),
            paymentUnknownSubtitle: t("paymentUnknownSubtitle"),
            paymentFailedTitle: t("paymentFailedTitle"),
            paymentFailedBadge: t("paymentFailedBadge"),
            paymentFailedSubtitle: t("paymentFailedSubtitle"),
            paidTitle: t("paidTitle"),
            paidBadge: t("paidBadge"),
            paidSubtitle: t("paidSubtitle"),
            provisioningTitle: t("provisioningTitle"),
            provisioningBadge: t("provisioningBadge"),
            provisioningSubtitle: t("provisioningSubtitle"),
            provisioningUnknownTitle: t("provisioningUnknownTitle"),
            provisioningUnknownBadge: t("provisioningUnknownBadge"),
            provisioningFailedTitle: t("provisioningFailedTitle"),
            provisioningFailedBadge: t("provisioningFailedBadge"),
            provisioningFailedTerminalTitle: t("provisioningFailedTerminalTitle"),
            provisioningFailedTerminalBadge: t("provisioningFailedTerminalBadge"),
            readyTitle: t("readyTitle"),
            readyBadge: t("readyBadge"),
            readySubtitle: t("readySubtitle"),
            deniedTitle: t("deniedTitle"),
            deniedSubtitle: t("deniedSubtitle"),
            deniedNotice: t("deniedNotice"),
            deniedText: t("deniedText"),
            purchaseFactsLabel: t("purchaseFactsLabel"),
            verificationLabel: t("verificationLabel"),
            provisioningOrderLabel: t("provisioningOrderLabel"),
            confirmedFactsLabel: t("confirmedFactsLabel"),
            latestCheck: t("latestCheck"),
            offer: t("offer"),
            offerPlan: t("offerPlan"),
            purchaseRef: t("purchaseRef"),
            paymentAttempt: t("paymentAttempt"),
            paymentStatusLabel: t("paymentStatusLabel"),
            amountLabel: t("amountLabel"),
            invoiceDue: t("invoiceDue"),
            invoicePaidAt: t("invoicePaidAt"),
            workspaceLabel: t("workspaceLabel"),
            workspacePending: t("workspacePending"),
            cadenceLabel: t("cadenceLabel"),
            renewalLabel: t("renewalLabel"),
            cadenceOneTime: t("cadenceOneTime"),
            cadenceRecurring: t("cadenceRecurring"),
            cadenceSetupRecurring: t("cadenceSetupRecurring"),
            renewalAuto: t("renewalAuto"),
            renewalAutoAt: date => t("renewalAutoAt", { date }),
            renewalManualAt: date => t("renewalManualAt", { date }),
            renewalManual: t("renewalManual"),
            renewalNone: t("renewalNone"),
            purchaseRow: t("purchaseRow"),
            invoiceRow: t("invoiceRow"),
            paidAmount: t("paidAmount"),
            currentOperation: t("currentOperation"),
            operationAdmit: t("operationAdmit"),
            purchaseLabel: t("purchaseLabel"),
            timelineRead: t("timelineRead"),
            timelineReadDetail: t("timelineReadDetail"),
            detailPaymentSettled: t("detailPaymentSettled"),
            startedLabel: t("startedLabel"),
            lastObservation: t("lastObservation"),
            reconcileNote: t("reconcileNote"),
            checkProvider: t("checkProvider"),
            checkAmount: t("checkAmount"),
            checkCanonical: t("checkCanonical"),
            checkAdmission: t("checkAdmission"),
            checkPaymentVerified: t("checkPaymentVerified"),
            checkEntitlement: t("checkEntitlement"),
            checkConfigure: t("checkConfigure"),
            checkReadiness: t("checkReadiness"),
            detailAwaiting: t("detailAwaiting"),
            detailEvaluated: t("detailEvaluated"),
            detailNotEvaluated: t("detailNotEvaluated"),
            detailWithheld: t("detailWithheld"),
            detailConfirmed: t("detailConfirmed"),
            detailRefused: t("detailRefused"),
            detailSourceRefused: t("detailSourceRefused"),
            detailLocked: t("detailLocked"),
            detailAdmitted: t("detailAdmitted"),
            detailWaitingAdmission: t("detailWaitingAdmission"),
            detailWaitingConfiguration: t("detailWaitingConfiguration"),
            detailWaitingReadiness: t("detailWaitingReadiness"),
            detailOrderRecorded: t("detailOrderRecorded"),
            lockedNotice: t("lockedNotice"),
            outcomeLabel: t("outcomeLabel"),
            outcomeEntryWithheld: t("outcomeEntryWithheld"),
            outcomeEntryReady: t("outcomeEntryReady"),
            outcomeEntryDenied: t("outcomeEntryDenied"),
            outcomeProvisioningRetryable: t("outcomeProvisioningRetryable"),
            outcomeProvisioningTerminal: t("outcomeProvisioningTerminal"),
            checkPaymentAction: t("checkPaymentAction"),
            reconcilePaymentAction: t("reconcilePaymentAction"),
            refreshStatusAction: t("refreshStatusAction"),
            reconcileOrderAction: t("reconcileOrderAction"),
            retryProvisionAction: t("retryProvisionAction"),
            retryProvisionCaption: t("retryProvisionCaption"),
            viewProvisioningAction: t("viewProvisioningAction"),
            enterWorkspaceAction: t("enterWorkspaceAction"),
            returnToList: t("returnToList"),
            backToWorkspaces: t("backToWorkspaces"),
            ownerLabel: t("ownerLabel"),
            attemptLabel: t("attemptLabel"),
            attemptFact: attempt => t("attemptFact", { attempt }),
            changeOffer: t("changeOffer"),
            realtimeReconnect: t("realtimeReconnect"),
            stateDone: t("stateDone"),
            stateRunning: t("stateRunning"),
            stateQueued: t("stateQueued"),
            stateFailed: t("stateFailed"),
            stateUnknown: t("stateUnknown"),
            rechecksOnly: attempt => t("rechecksOnly", { attempt }),
            preparingOffer: offer => t("preparingOffer", { offer }),
            orderReports: status => t("orderReports", { status }),
            invoiceReports: status => t("invoiceReports", { status }),
            paidSentence: amount => t("paidSentence", { amount }),
            startedSentence: (at, elapsed) => t("startedSentence", { at, elapsed }),
            lastObservationSentence: (detail, at) => t("lastObservationSentence", { detail, at }),
            operationStatus: status => t.has(`operation.${status}`) ? t(`operation.${status}`) : status,
            ledgerLabel: t("ledgerLabel"),
            unavailableNotice: t("unavailableNotice"),
            renewAction: t("renewAction"),
            heldSinceLabel: date => t("heldSinceLabel", { date }),
            paidThroughLabel: date => t("paidThroughLabel", { date }),
            entryNotReadyNotice: t("entryNotReadyNotice"),
            entryConflictNotice: t("entryConflictNotice"),
            purchaseStateLabel: state => t.has(`stateLabel.${kebab(state)}`) ? t(`stateLabel.${kebab(state)}`) : state,
            sourceLabel: source => {
                const name = source === "payment-reconciliation" ? "payment" : source === "platform-billing-ledger" ? "billing" : source === "workspace-provisioning" ? "provisioning" : source;
                return t.has(`sourceLabel.${name}`) ? t(`sourceLabel.${name}`) : source;
            },
            sourceStateLabel: keyed("sourceStateLabel"),
            ledgerStateLabel: keyed("ledgerStateLabel"),
            ledgerEntryKindLabel: keyed("ledgerEntryKindLabel"),
            refundStateLabel: keyed("refundStateLabel"),
            holdStateLabel: keyed("holdStateLabel"),
            holdReasonLabel: keyed("holdReasonLabel"),
            renewalEvidenceLabel: keyed("renewalEvidenceLabel"),
            entryStateLabel: keyed("entryStateLabel"),
            entryRefusalLabel: keyed("entryRefusalLabel"),
            provisioningDispositionLabel: keyed("provisioningDispositionLabel")
        };
    }, [t]);

    const timeOf = (iso: string) => format.dateTime(new Date(iso), { hour: "2-digit", minute: "2-digit" });
    const stampOf = (iso: string) => format.dateTime(new Date(iso), { dateStyle: "medium", timeStyle: "short" });
    const dayOf = (iso: string): string => format.dateTime(new Date(iso), { dateStyle: "medium" });
    /* The amount keeps its currency inseparable and formats under the offer's own currency. */
    const amountOf = (amount: string, currency: string): string => {
        const value = Number(amount);
        return Number.isFinite(value) ? format.number(value, { style: "currency", currency, maximumFractionDigits: 0 }) : `${amount} ${currency}`;
    };
    /* Elapsed is measured against the last authoritative read, never a render-time clock. */
    const elapsedOf = (iso: string, now: string): string => `${Math.max(1, Math.round((Date.parse(now) - Date.parse(iso)) / 60000))}m`;

    const answer = statusQuery.data;
    /* A fresh authoritative read supersedes every locally kept refusal and every entry-carried view. */
    useEffect(() => {
        setPurchaseOverride(null);
        setEntryRefusal(null);
        setRecoverRefusal(null);
    }, [answer]);

    const outcome = answer !== undefined && answer.ok ? answer.data : null;
    const statusPurchase = purchaseOf(outcome);
    const purchase = purchaseOverride ?? statusPurchase;
    const readyWorkspaceId = purchase !== null && purchase.readiness.state === "ready" && purchase.readiness.reference !== null ? purchase.readiness.reference : null;

    /* The entry request names the purchase and the exact workspace the readiness facet confirmed;
       the readiness observation itself is the backend's to derive, never a caller claim. */
    const entryRequest = useMemo<WorkspaceCheckoutEntryRequest>(() => ({
        purchaseId,
        workspaceId: readyWorkspaceId ?? "",
        returnContext: { name: "workspace-dashboard", version: "1" }
    }), [purchaseId, readyWorkspaceId]);
    const entryQuery = useQueryWorkspaceCheckoutEntrySwr(entryRequest, entryAsked && readyWorkspaceId !== null);
    const entryAnswer = entryQuery.data;

    useEffect(() => {
        if (!entryAsked || entryAnswer === undefined || consumedEntry.current === entryAnswer) return;
        consumedEntry.current = entryAnswer;
        setEntryAsked(false);
        if (!entryAnswer.ok) {
            setEntryRefusal(entryAnswer.reason);
            return;
        }
        const entry = entryAnswer.data;
        if (entry.status === "entry") {
            /* A destination naming another workspace is a conflict the screen refuses to enter. */
            const path = entry.workspaceId === readyWorkspaceId && entry.destination.workspaceId === readyWorkspaceId ? entryPathOf(entry.destination) : null;
            if (path === null) {
                setEntryRefusal(copy.entryConflictNotice);
                return;
            }
            router.push(path);
            return;
        }
        if (entry.status === "not-ready") {
            /* The entry owner's own status view re-settles the surface to the purchase's real state. */
            setPurchaseOverride(entry.purchase);
            setEntryRefusal(copy.entryNotReadyNotice);
            return;
        }
        if (entry.status === "refused") {
            setEntryRefusal(copy.entryRefusalLabel(entry.code));
            return;
        }
        if (entry.status === "unavailable") {
            setEntryRefusal(copy.entryRefusalLabel(entry.code));
            return;
        }
        setEntryRefusal(copy.entryConflictNotice);
    }, [copy, entryAnswer, entryAsked, readyWorkspaceId, router]);

    const refreshStatus = statusQuery.mutate;
    /* Re-read the same purchase's status; the recover command refreshes the same keyed read itself. */
    const reconcile = useCallback(async (): Promise<void> => {
        try {
            await refreshStatus();
        } catch {
            /* A thrown re-read keeps the last confirmed truth on screen. */
        }
    }, [refreshStatus]);
    const reconciling = statusQuery.isValidating || recoverPurchase.isMutating;

    /* The safe-recovery command reconciles the same purchase through the identities already
       observed; it never starts a second purchase or workspace. */
    const recover = useCallback(async (): Promise<void> => {
        if (purchase === null || recoverPurchase.isMutating) return;
        setRecoverRefusal(null);
        setEntryRefusal(null);
        const response = await recoverPurchase.trigger({ purchaseId, lastObserved: observedIdentitiesOf(purchase) });
        if (!response.ok) {
            setRecoverRefusal(response.reason);
            return;
        }
        const recovered = purchaseOf(response.data);
        if (recovered !== null) {
            setPurchaseOverride(recovered);
            return;
        }
        const refused = response.data;
        if (refused.status === "conflict" || (refused.status === "refused" && (refused.code === "observed-identity-mismatch" || refused.code === "retry-identity-conflict"))) {
            setRecoverRefusal(copy.entryConflictNotice);
            return;
        }
        if (refused.status === "refused") {
            const label = copy.entryRefusalLabel(refused.code);
            setRecoverRefusal(label === refused.code ? copy.unavailableNotice : label);
            return;
        }
        setRecoverRefusal(copy.unavailableNotice);
    }, [copy, purchase, purchaseId, recoverPurchase]);

    const sessionRestoring = session.state.status === "restoring";
    /* Settle the read answer into the phase it proves: a refused or outage answer is unavailable-
       or-denied without disclosing any fact, and a purchase naming another identity is refused too. */
    const basePhase: PurchasePhase = sessionRestoring || answer === undefined && statusQuery.error === undefined
        ? "loading"
        : purchase === null || purchase.purchaseId !== purchaseId
            ? "denied"
            : phaseOf(purchase);
    /* The owner may stand on the paid state yet open the declared provisioning route; the pin is
       view-only and never invents a fact - paid-plus-pin renders the queued admission truth. */
    const pinnedPhase = basePhase === "paid" && surfacePinned === "provisioning" ? "queued" : basePhase;
    /* A held entitlement withholds retry and new service effects; the held phase keeps its own name. */
    const renderedPhase: PurchasePhase = purchase !== null && purchase.serviceEligibility?.state === "held" && HOLD_PHASES.has(pinnedPhase) ? "service-eligibility-hold" : pinnedPhase;
    const onProvisioningSurface = PROVISIONING_PHASES.has(renderedPhase);

    /* A realtime event or a reconnect only re-reads the same purchase; it never settles the surface. */
    const target: ProvisioningTarget | null = readyWorkspaceId !== null
        ? { kind: "workspace", id: readyWorkspaceId }
        : POLLING_PHASES.has(renderedPhase) ? { kind: "order", id: purchaseId } : null;
    const realtime = useProvisioningRealtime({ accessToken, target });
    const seenEventKey = useRef<string | null>(null);
    useEffect(() => {
        if (realtime.status !== "event") return;
        const event = realtime.event;
        const eventKey = "updatedAt" in event ? `${event.kind}:${event.id}:${event.updatedAt}` : `${event.kind}:${event.id}:${event.status}`;
        if (seenEventKey.current === eventKey) return;
        seenEventKey.current = eventKey;
        if (event.kind === "order" && event.id === purchaseId) void reconcile();
        if (event.kind === "workspace" && readyWorkspaceId !== null && event.id === readyWorkspaceId) void reconcile();
    }, [purchaseId, readyWorkspaceId, realtime, reconcile]);

    useEffect(() => {
        if (!POLLING_PHASES.has(renderedPhase)) return;
        const timer = window.setInterval(() => {
            void reconcile();
        }, 4000);
        return () => window.clearInterval(timer);
    }, [renderedPhase, reconcile]);

    useEffect(() => {
        if (realtime.status !== "connected" || renderedPhase === "loading" || renderedPhase === "denied") return;
        void reconcile();
    }, [realtime.status, renderedPhase, reconcile]);

    /* The intl router localizes the href itself, so pushes take the bare route — the getPathname
       output is for anchor hrefs only. */
    const returnToList = useCallback(() => router.push("/agentos/workspaces"), [router]);
    const changeOffer = useCallback(() => router.push("/agentos/workspaces/new"), [router]);
    /* The paid surface's onward action lands on the declared provisioning route; the surface flag keeps the render truthful while navigation settles. */
    const viewProvisioning = useCallback(() => {
        setSurfacePinned("provisioning");
        router.push(`/agentos/workspaces/purchases/${purchaseId}/provisioning`);
    }, [purchaseId, router]);
    const enterWorkspace = useCallback(() => {
        if (readyWorkspaceId === null || entryAsked) return;
        consumedEntry.current = null;
        setEntryRefusal(null);
        setEntryAsked(true);
    }, [entryAsked, readyWorkspaceId]);
    /* The held entitlement's renewal re-admits the same offer through the checkout route, carrying
       the entitlement identity the eligibility facet published - never a new offer's identity. */
    const renewEntitlement = useCallback(() => {
        const renewal = purchase?.serviceEligibility?.renewalAction;
        if (renewal === null || renewal === undefined) return;
        const query = new URLSearchParams({ offer: renewal.offerId, offerVersion: renewal.offerVersion });
        if (purchase?.serviceEligibility?.reference !== null && purchase?.serviceEligibility?.reference !== undefined) query.set("entitlement", purchase.serviceEligibility.reference);
        router.push(`/agentos/workspaces/new/checkout?${query.toString()}`);
    }, [purchase, router]);

    const offer = purchase?.offer ?? null;
    const offerName = offer?.displayName ?? null;
    const amountText = offer === null ? null : amountOf(offer.amount, offer.currency);
    const billingSettled = purchase?.billing.state === "paid";
    const observedAt = purchase?.lastConfirmedAt ?? null;
    const paymentAttempt = purchase !== null && purchase.payment.reference !== null ? purchase.payment.reference : null;

    const paymentChecks = (): ReadonlyArray<PurchaseStatusCheck> => {
        const payment = purchase?.payment;
        const billing = purchase?.billing;
        const provisioning = purchase?.provisioning;
        const paymentTerminal = payment?.state === "refused" || payment?.state === "failed" || payment?.state === "cancelled" || payment?.state === "failed-no-start" || billing?.state === "refused" || billing?.state === "failed" || billing?.state === "cancelled";
        const provider: PurchaseStatusCheck = payment?.state === "unavailable"
            ? check("provider", copy.checkProvider, "unknown", copy.detailSourceRefused)
            : payment?.state === "verified-success"
                ? check("provider", copy.checkProvider, "done", payment.state, payment.observedAt === null ? undefined : timeOf(payment.observedAt))
                : paymentTerminal
                    ? check("provider", copy.checkProvider, "failed", copy.detailRefused)
                    : payment?.state === "outcome-unknown" || payment?.state === "verified-unmatched-charge"
                        ? check("provider", copy.checkProvider, "unknown", copy.detailWithheld)
                        : check("provider", copy.checkProvider, "running", copy.detailAwaiting);
        const amountState: WordTone["word"] = billingSettled ? "done" : billing?.state === "unavailable" ? "unknown" : "queued";
        const amount = check("amount", amountText === null ? copy.checkAmount : `${copy.checkAmount} — ${amountText}`, amountState, amountState === "done" ? copy.detailEvaluated : amountState === "unknown" ? copy.detailSourceRefused : copy.detailNotEvaluated);
        const canonical: PurchaseStatusCheck = billingSettled
            ? check("canonical", copy.checkCanonical, "done", copy.detailConfirmed, billing?.observedAt === null || billing?.observedAt === undefined ? undefined : timeOf(billing.observedAt))
            : billing?.state === "refused" || billing?.state === "failed" || billing?.state === "cancelled"
                ? check("canonical", copy.checkCanonical, "failed", copy.detailRefused)
                : billing?.state === "unavailable"
                    ? check("canonical", copy.checkCanonical, "unknown", copy.detailSourceRefused)
                    : check("canonical", copy.checkCanonical, "queued", copy.detailWithheld);
        const admission: PurchaseStatusCheck = provisioning !== undefined && provisioning !== null && OBSERVED_ORDER_STATES.has(provisioning.state)
            ? check("admission", copy.checkAdmission, "done", copy.detailAdmitted)
            : provisioning?.state === "unavailable"
                ? check("admission", copy.checkAdmission, "unknown", copy.detailSourceRefused)
                : billingSettled
                    ? check("admission", copy.checkAdmission, "queued", copy.detailWaitingAdmission)
                    : check("admission", copy.checkAdmission, "queued", copy.detailLocked);
        return [provider, amount, canonical, admission];
    };

    const provisioningChecks = (): ReadonlyArray<PurchaseStatusCheck> => {
        const billing = purchase?.billing;
        const provisioning = purchase?.provisioning;
        const readiness = purchase?.readiness;
        const eligibility = purchase?.serviceEligibility;
        const paymentVerified = billingSettled === true
            ? check("payment", copy.checkPaymentVerified, "done", copy.detailConfirmed, billing?.observedAt === null || billing?.observedAt === undefined ? undefined : timeOf(billing.observedAt))
            : billing?.state === "unavailable"
                ? check("payment", copy.checkPaymentVerified, "unknown", copy.detailSourceRefused)
                : check("payment", copy.checkPaymentVerified, "queued", copy.detailAwaiting);
        const entitlement = eligibility === null || eligibility === undefined
            ? provisioning !== undefined && provisioning !== null && OBSERVED_ORDER_STATES.has(provisioning.state)
                ? check("entitlement", copy.checkEntitlement, "done", copy.detailOrderRecorded)
                : check("entitlement", copy.checkEntitlement, "queued", copy.detailAwaiting)
            : eligibility.state === "eligible"
                ? check("entitlement", copy.checkEntitlement, "done", copy.detailOrderRecorded)
                : eligibility.state === "held"
                    ? check("entitlement", copy.checkEntitlement, "failed", eligibility.reason === null ? copy.holdStateLabel("held") : copy.holdReasonLabel(eligibility.reason), eligibility.heldSince === null ? undefined : timeOf(eligibility.heldSince))
                    : eligibility.state === "unavailable"
                        ? check("entitlement", copy.checkEntitlement, "unknown", copy.detailSourceRefused)
                        : check("entitlement", copy.checkEntitlement, "queued", copy.detailAwaiting);
        const disposition = provisioning?.state ?? "none";
        const orderFailed = disposition === "refused" || disposition === "failed-retryable" || disposition === "failed-terminal";
        const configure: PurchaseStatusCheck = orderFailed
            ? check("configure", copy.checkConfigure, "failed", provisioning?.reason ?? copy.detailRefused, provisioning?.observedAt === null || provisioning?.observedAt === undefined ? undefined : timeOf(provisioning.observedAt))
            : disposition === "ready"
                ? check("configure", copy.checkConfigure, "done", undefined, provisioning?.observedAt === null || provisioning?.observedAt === undefined ? undefined : timeOf(provisioning.observedAt))
                : disposition === "running"
                    ? check("configure", copy.checkConfigure, "running", copy.provisioningDispositionLabel(disposition), provisioning?.observedAt === null || provisioning?.observedAt === undefined ? undefined : timeOf(provisioning.observedAt))
                    : disposition === "unavailable"
                        ? check("configure", copy.checkConfigure, "unknown", copy.detailSourceRefused)
                        : disposition === "outcome-unknown"
                            ? check("configure", copy.checkConfigure, "unknown", copy.detailWithheld)
                            : check("configure", copy.checkConfigure, "queued", copy.detailWaitingConfiguration);
        const readinessCheck: PurchaseStatusCheck = readiness?.state === "ready"
            ? check("readiness", copy.checkReadiness, "done", undefined, readiness.observedAt === null ? undefined : timeOf(readiness.observedAt))
            : readiness?.state === "unavailable"
                ? check("readiness", copy.checkReadiness, "unknown", copy.detailSourceRefused)
                : orderFailed
                    ? check("readiness", copy.checkReadiness, "failed", copy.detailRefused)
                    : check("readiness", copy.checkReadiness, "queued", copy.detailWaitingReadiness);
        return [paymentVerified, entitlement, configure, readinessCheck];
    };

    const provisioningOperation = (): PurchaseStatusOperation | undefined => {
        if (purchase === null) return undefined;
        const disposition = purchase.provisioning.state;
        const observed = OBSERVED_ORDER_STATES.has(disposition);
        const name = observed ? copy.provisioningDispositionLabel(disposition) : copy.operationAdmit;
        const failed = disposition === "refused" || disposition === "failed-retryable" || disposition === "failed-terminal";
        const steps = provisioningChecks();
        const score = steps.reduce((total, step) => total + (step.word === copy.stateDone ? 100 : step.word === copy.stateRunning ? 50 : 0), 0);
        const progressValue = Math.round(score / steps.length);
        const orderObservedAt = purchase.provisioning.observedAt;
        return {
            heading: copy.currentOperation,
            name,
            word: disposition === "ready" ? copy.stateDone : failed ? copy.stateFailed : disposition === "outcome-unknown" || disposition === "unavailable" ? copy.stateUnknown : disposition === "running" ? copy.stateRunning : copy.stateQueued,
            tone: disposition === "ready" ? "success" : failed ? "danger" : disposition === "outcome-unknown" || disposition === "unavailable" ? "warning" : disposition === "running" ? "warning" : "neutral",
            progressLabel: name,
            progressValue,
            started: orderObservedAt === null || observedAt === null ? undefined : copy.startedSentence(timeOf(orderObservedAt), elapsedOf(orderObservedAt, observedAt)),
            lastObservation: observedAt === null ? undefined : copy.lastObservationSentence(observed ? copy.provisioningDispositionLabel(disposition) : copy.detailPaymentSettled, timeOf(observedAt))
        };
    };

    const paymentTimeline = () => {
        if (purchase === null) return [];
        const rows = [];
        const recorded = nivoIconSource("complete");
        rows.push({ id: "purchase", title: copy.purchaseRow, detail: copy.purchaseStateLabel(purchase.state), mark: recorded });
        if (purchase.payment.reference !== null || purchase.payment.observedAt !== null) {
            rows.push({ id: "payment", title: copy.paymentAttempt, detail: purchase.payment.state, at: purchase.payment.observedAt === null ? undefined : timeOf(purchase.payment.observedAt), mark: recorded });
        }
        for (const entry of purchase.ledger?.entries ?? []) {
            rows.push({ id: entry.entryId, title: copy.ledgerEntryKindLabel(entry.kind), detail: `${entry.amount} ${entry.currency}`, at: timeOf(entry.postedAt), mark: recorded });
        }
        rows.push({ id: "read", title: copy.timelineRead, detail: copy.timelineReadDetail, at: timeOf(purchase.lastConfirmedAt), mark: recorded });
        return rows;
    };

    const paymentPrimary = () => ({
        label: copy.purchaseFactsLabel,
        fact: purchaseId,
        banner: offerName === null ? undefined : [offerName, ...(amountText === null ? [] : [amountText]), ...(offer === null ? [] : [offer.offerVersion])],
        facts: [
            { label: copy.offer, value: offerName ?? "—" },
            { label: copy.offerPlan, value: offer?.offerVersion ?? "—" },
            { label: copy.purchaseRef, value: purchaseId },
            { label: copy.paymentAttempt, value: paymentAttempt ?? "—" },
            { label: copy.amountLabel, value: amountText ?? "—" },
            { label: copy.paymentStatusLabel, value: purchase === null ? "—" : copy.purchaseStateLabel(purchase.state) },
            { label: copy.lastObservation, value: purchase === null ? "—" : stampOf(purchase.lastConfirmedAt) },
            { label: copy.invoicePaidAt, value: billingSettled === true && purchase?.billing.observedAt !== null && purchase?.billing.observedAt !== undefined ? stampOf(purchase.billing.observedAt) : "—" }
        ],
        timeline: paymentTimeline()
    });

    /* The cadence/renewal band reads only what the frozen offer publishes; a field the offer does
       not carry stays the withheld marker rather than inventing commercial terms. */
    const cadenceText = offer === null
        ? "—"
        : offer.billingCadence === "monthly"
            ? copy.cadenceRecurring
            : offer.billingCadence === "one-time" || offer.billingCadence === "one_time" || offer.billingCadence === "once"
                ? copy.cadenceOneTime
                : offer.billingCadence.includes("setup")
                    ? copy.cadenceSetupRecurring
                    : offer.billingCadence;
    const renewalText = offer === null
        ? "—"
        : offer.renewalMode === "automatic" || offer.renewalMode === "auto"
            ? copy.renewalAuto
            : offer.renewalMode === "explicit" || offer.renewalMode === "manual"
                ? copy.renewalManual
                : offer.renewalMode === "none" || offer.renewalMode === "never"
                    ? copy.renewalNone
                    : offer.renewalMode;
    /* The order fact binds the distinct provisioning-order identity the status facet publishes;
       a facet that answered none or unavailable keeps the label but withholds the value. */
    const provisioningPrimary = (phase: PurchasePhase) => ({
        label: copy.provisioningOrderLabel,
        fact: purchase === null ? undefined : provisioningOrderRefOf(purchase) ?? undefined,
        facts: [
            { label: copy.offer, value: offerName ?? "—" },
            { label: copy.purchaseLabel, value: purchaseId },
            { label: copy.paymentStatusLabel, value: billingSettled === true && amountText !== null ? copy.paidSentence(amountText) : purchase === null ? "—" : copy.purchaseStateLabel(purchase.state) },
            { label: copy.workspaceLabel, value: readyWorkspaceId ?? copy.workspacePending },
            { label: copy.offerPlan, value: offer?.offerVersion ?? "—" },
            { label: copy.invoicePaidAt, value: billingSettled === true && purchase?.billing.observedAt !== null && purchase?.billing.observedAt !== undefined ? stampOf(purchase.billing.observedAt) : "—" }
        ],
        cadenceFacts: [
            { label: copy.cadenceLabel, value: cadenceText },
            { label: copy.renewalLabel, value: renewalText }
        ],
        operation: provisioningOperation(),
        footnote: `Order ${purchaseId} ${copy.reconcileNote}`,
        action: phase === "queued" || phase === "provisioning" ? { label: copy.refreshStatusAction, pending: reconciling } : phase === "provisioning-unknown" ? { label: copy.reconcileOrderAction, pending: reconciling } : undefined
    });

    const paymentRail = (phase: PurchasePhase): PurchaseStatusRail => ({
        label: copy.verificationLabel,
        latestCheck: observedAt === null ? undefined : `${copy.latestCheck} · ${timeOf(observedAt)}`,
        checks: paymentChecks(),
        notice: phase === "payment-pending" ? copy.lockedNotice : phase === "payment-unknown" ? copy.unavailableNotice : undefined,
        action: phase === "payment-refused" || phase === "payment-failed" || phase === "payment-cancelled"
            ? { label: copy.changeOffer }
            : phase === "paid"
                ? { label: copy.viewProvisioningAction }
                : { label: phase === "payment-unknown" ? copy.reconcilePaymentAction : copy.checkPaymentAction, pending: reconciling },
        actionCaption: phase === "payment-refused" || phase === "payment-failed" || phase === "payment-cancelled" || phase === "paid" ? undefined : copy.rechecksOnly(paymentAttempt ?? purchaseId),
        secondaryLink: { label: copy.returnToList, href: links.workspaces },
        refusalText: recoverRefusal ?? undefined
    });

    const provisioningRail = (phase: PurchasePhase): PurchaseStatusRail => {
        const ready = phase === "ready";
        const retryable = phase === "provisioning-failed-retryable";
        const terminal = phase === "provisioning-failed-terminal";
        const held = phase === "service-eligibility-hold";
        const refunding = phase === "refund-started" || phase === "refund-pending-reconciliation" || phase === "provisioning-refused";
        const refund = purchase?.refund ?? purchase?.refundStatus ?? null;
        const eligibility = purchase?.serviceEligibility ?? null;
        const renewal = eligibility?.renewalAction ?? null;
        const renewalHref = renewal === null ? null : `${links.offerSelection}/checkout?offer=${encodeURIComponent(renewal.offerId)}&offerVersion=${encodeURIComponent(renewal.offerVersion)}${eligibility?.reference !== null && eligibility?.reference !== undefined ? `&entitlement=${encodeURIComponent(eligibility.reference)}` : ""}`;
        const entryDenied = (ready || held) && entryRefusal !== null;
        const heldSince = eligibility?.heldSince ?? null;
        const paidThrough = eligibility?.paidThrough ?? null;
        const holdFacts = held && eligibility !== null ? [
            { label: copy.holdStateLabel("held"), value: eligibility.reason === null ? copy.holdStateLabel("held") : copy.holdReasonLabel(eligibility.reason) },
            { label: copy.renewalEvidenceLabel(eligibility.renewalEvidence), value: [heldSince === null ? null : copy.heldSinceLabel(dayOf(heldSince)), paidThrough === null ? null : copy.paidThroughLabel(dayOf(paidThrough))].filter((part): part is string => part !== null).join(" · ") || "—" }
        ] : [];
        const refundFacts = phase === "refunded" && purchase?.refund?.refundEntryId !== null && purchase?.refund?.refundEntryId !== undefined ? [{ label: copy.ledgerEntryKindLabel("refund"), value: purchase.refund.refundEntryId }] : [];
        const outcomeDetail = ready
            ? entryDenied ? copy.outcomeEntryDenied : copy.outcomeEntryReady
            : held
                ? `${copy.holdStateLabel("held")}${eligibility?.reason === null || eligibility?.reason === undefined ? "" : ` · ${copy.holdReasonLabel(eligibility.reason)}`}${eligibility?.paidThrough === null || eligibility?.paidThrough === undefined ? "" : ` · ${copy.paidThroughLabel(dayOf(eligibility.paidThrough))}`}`
                : terminal
                    ? copy.outcomeProvisioningTerminal
                    : retryable
                        ? copy.outcomeProvisioningRetryable
                        : phase === "refunded"
                            ? copy.refundStateLabel("refunded")
                            : refunding && refund !== null
                                ? copy.refundStateLabel(refund.state)
                                : refunding
                                    ? copy.provisioningDispositionLabel("refused")
                                    : copy.outcomeEntryWithheld;
        return {
            label: copy.confirmedFactsLabel,
            checks: provisioningChecks(),
            facts: [
                { label: copy.ownerLabel, value: purchaserFact ?? "—" },
                { label: copy.attemptLabel, value: "—" },
                ...holdFacts,
                ...refundFacts
            ],
            notice: phase === "provisioning-unknown" ? copy.unavailableNotice : (retryable || terminal || phase === "provisioning-refused") && purchase !== null ? purchase.provisioning.reason ?? undefined : undefined,
            outcome: {
                title: `${copy.outcomeLabel}: ${readyWorkspaceId ?? offerName ?? "—"}`,
                detail: outcomeDetail
            },
            action: entryDenied
                ? { label: copy.refreshStatusAction, pending: reconciling }
                : ready || held && readyWorkspaceId !== null
                    ? { label: copy.enterWorkspaceAction, pending: entryAsked }
                    : held && renewal !== null
                        ? { label: copy.renewAction }
                        : retryable
                            ? { label: copy.retryProvisionAction, pending: recoverPurchase.isMutating }
                            : refunding && phase !== "provisioning-refused"
                                ? { label: copy.refreshStatusAction, pending: reconciling }
                                : undefined,
            actionCaption: retryable ? copy.retryProvisionCaption : undefined,
            secondaryLink: held && renewalHref !== null && readyWorkspaceId !== null ? { label: copy.renewAction, href: renewalHref } : undefined,
            refusalText: entryRefusal ?? recoverRefusal ?? undefined
            /* The escape action is page-level below the rail card on every provisioning state. */
        };
    };

    const headFor = (title: string, subtitle: string, badge?: PurchaseStatusBadge) => ({
        copy,
        links,
        trail: [
            { id: "workspaces", label: copy.workspaces, href: links.workspaces },
            { id: "purchases", label: copy.purchases },
            { id: "purchase", label: purchaseId, isCurrent: !onProvisioningSurface },
            ...(onProvisioningSurface ? [{ id: "provisioning", label: copy.provisioning, isCurrent: true }] : [])
        ],
        title,
        subtitle,
        badge
    });

    const provisioningSubtitle = `${copy.provisioningSubtitle} ${observedAt === null ? "" : stampOf(observedAt)}.`;

    const view = (): PurchaseStatusFlowViewProps => {
        if (renderedPhase === "loading") {
            return {
                state: "loading",
                props: { ...headFor(copy.loadingTitle, copy.loadingText), surface: surfacePinned }
            };
        }
        if (renderedPhase === "denied") {
            const outage = answer === undefined || !answer.ok || outcome === null || outcome.status !== "refused";
            return {
                state: "denied",
                props: { ...headFor(copy.deniedTitle, copy.deniedSubtitle), message: outage ? copy.unavailableNotice : copy.deniedNotice, description: copy.deniedText },
                on: { returnToList }
            };
        }
        if (PAYMENT_PHASES.has(renderedPhase)) {
            const heading = renderedPhase === "payment-pending"
                ? headFor(copy.paymentPendingTitle, copy.paymentPendingSubtitle, { label: copy.paymentPendingBadge, tone: "warning" })
                : renderedPhase === "payment-unknown"
                    ? headFor(copy.paymentUnknownTitle, copy.paymentUnknownSubtitle, { label: copy.paymentUnknownBadge, tone: "warning" })
                    : renderedPhase === "paid"
                        ? headFor(copy.paidTitle, copy.paidSubtitle, { label: copy.paidBadge, tone: "success" })
                        : headFor(copy.paymentFailedTitle, copy.paymentFailedSubtitle, { label: purchase === null ? copy.paymentFailedBadge : copy.purchaseStateLabel(purchase.state), tone: "danger" });
            return {
                state: renderedPhase,
                props: { ...heading, primary: paymentPrimary(), rail: paymentRail(renderedPhase) },
                on: {
                    primary: renderedPhase === "payment-refused" || renderedPhase === "payment-failed" || renderedPhase === "payment-cancelled"
                        ? changeOffer
                        : renderedPhase === "paid"
                            ? viewProvisioning
                            : renderedPhase === "payment-unknown"
                                ? () => void recover()
                                : () => void reconcile(),
                    returnToList
                }
            };
        }
        /* The guards above returned every non-provisioning phase, so only the family remains. */
        const subtitle = renderedPhase === "ready" ? copy.readySubtitle : provisioningSubtitle;
        /* The refund badge names the phase's own truth: `refunded` only beside the linked ledger
           entry, never an unconfirmed projection. */
        const refundTitle = renderedPhase === "refunded"
            ? copy.refundStateLabel("refunded")
            : renderedPhase === "refund-started"
                ? copy.refundStateLabel("refund-started")
                : renderedPhase === "refund-pending-reconciliation"
                    ? copy.refundStateLabel("refund-pending-reconciliation")
                    : purchase === null
                        ? copy.provisioningFailedTerminalTitle
                        : copy.refundStateLabel("unavailable");
        const heading = renderedPhase === "queued"
            ? headFor(offerName === null ? copy.provisioningTitle : copy.preparingOffer(offerName), subtitle, { label: copy.provisioningDispositionLabel("admitted"), tone: "neutral" })
            : renderedPhase === "provisioning"
                ? headFor(offerName === null ? copy.provisioningTitle : copy.preparingOffer(offerName), subtitle, { label: copy.provisioningBadge, tone: "warning" })
                : renderedPhase === "provisioning-unknown"
                    ? headFor(copy.provisioningUnknownTitle, subtitle, { label: copy.provisioningUnknownBadge, tone: "warning" })
                    : renderedPhase === "provisioning-failed-retryable"
                        ? headFor(copy.provisioningFailedTitle, subtitle, { label: copy.provisioningFailedBadge, tone: "warning" })
                        : renderedPhase === "provisioning-failed-terminal"
                            ? headFor(copy.provisioningFailedTerminalTitle, subtitle, { label: copy.provisioningFailedTerminalBadge, tone: "danger" })
                            : renderedPhase === "provisioning-refused"
                                ? headFor(copy.provisioningFailedTerminalTitle, subtitle, { label: copy.provisioningDispositionLabel("refused"), tone: "danger" })
                                : renderedPhase === "refund-started" || renderedPhase === "refund-pending-reconciliation"
                                    ? headFor(refundTitle, subtitle, { label: refundTitle, tone: "warning" })
                                    : renderedPhase === "refunded"
                                        ? headFor(refundTitle, subtitle, { label: refundTitle, tone: "success" })
                                        : renderedPhase === "service-eligibility-hold"
                                            ? headFor(copy.holdStateLabel("held"), subtitle, { label: copy.holdStateLabel("held"), tone: "warning" })
                                            : headFor(copy.readyTitle, subtitle, { label: copy.readyBadge, tone: "success" });
        const held = renderedPhase === "service-eligibility-hold";
        const renewal = purchase?.serviceEligibility?.renewalAction ?? null;
        const entryDenied = (renderedPhase === "ready" || held) && entryRefusal !== null;
        return {
            state: renderedPhase,
            props: {
                ...heading,
                primary: provisioningPrimary(renderedPhase),
                rail: provisioningRail(renderedPhase),
                escapeLink: { label: copy.returnToList, href: links.workspaces }
            },
            on: {
                primary: entryDenied
                    ? () => void reconcile()
                    : renderedPhase === "ready" || held && readyWorkspaceId !== null
                        ? enterWorkspace
                        : held && renewal !== null
                            ? renewEntitlement
                            : renderedPhase === "provisioning-failed-retryable"
                                ? () => void recover()
                                : renderedPhase === "queued" || renderedPhase === "provisioning" || renderedPhase === "provisioning-unknown"
                                    ? () => void reconcile()
                                    : renderedPhase === "refund-started" || renderedPhase === "refund-pending-reconciliation"
                                        ? () => void reconcile()
                                        : undefined,
                returnToList
            }
        };
    };

    return <PurchaseStatusFlowBase {...view()} />;
};

export { PurchaseStatusFlow };
export default PurchaseStatusFlow;
