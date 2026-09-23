"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { getPathname, useRouter } from "@/i18n/navigation";
import { useSession } from "@/modules/auth/session";
import { useMutateIssueAgentWorkspaceAppLaunchSwr, useMutateRetryWorkspaceProvisioningOrderSwr, useQueryMyAgentWorkspaceControlCenterSwr, useQueryMyAgentWorkspacesSwr, useQueryMyCatalogOrdersSwr, useQueryMyInvoicesSwr } from "@/hooks";
import { type AgentWorkspaceControlCenter, type AgentWorkspaceRow, type CatalogOrderRow, type InvoiceRow } from "@/modules/api/console";
import { type Result } from "@/modules/api/graphql";
import { type WorkspacePurchaseStatus } from "@/modules/api/workspace-controlplane";
import useProvisioningRealtime, { type ProvisioningEvent, type ProvisioningTarget } from "@/modules/realtime/provisioning";
import { followWorkspaceAppRedirect, safeWorkspaceAppRedirect } from "@/modules/window/workspace-app-launch";
import { BILLING_CURRENCY } from "@/modules/config";
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

/** The matched source rows beside their source-qualified verdicts. */
type PurchaseSnapshot = {
    readonly status: WorkspacePurchaseStatus;
    readonly order: CatalogOrderRow | null;
    readonly invoice: InvoiceRow | null;
    readonly workspace: AgentWorkspaceRow | null;
};

type PurchasePhase = "loading" | "payment-pending" | "payment-unknown" | "payment-failed" | "paid" | "provisioning" | "provisioning-unknown" | "provisioning-failed-retryable" | "provisioning-failed-terminal" | "ready" | "denied";

type PurchaseFlow = {
    readonly phase: PurchasePhase;
    readonly snapshot: PurchaseSnapshot | null;
    readonly reason: string | null;
    /** The owner asked to see the provisioning surface while the read still stands at paid. */
    readonly surface?: "provisioning";
};

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
 * The fenced provisioning attempt is the workspace recovery view's owner-scoped attempt count,
 * published on the `myAgentWorkspaceControlCenter` recovery facet for the bound workspace row.
 * The realtime saga stream carries the sequence only as an ordering token and never surfaces it to
 * a consumer, so this owner-scoped read is the facet the seam actually reaches. A refused or
 * unanswered read, and a workspace carrying no recovery row, withhold the value marker.
 */
const provisioningAttemptOf = (controlCenter: Result<AgentWorkspaceControlCenter> | undefined): number | null => {
    if (controlCenter?.ok !== true) return null;
    const attempt = controlCenter.data.recovery?.attemptCount;
    return typeof attempt === "number" && Number.isFinite(attempt) ? attempt : null;
};
/**
 * The Provisioning order header binds the fulfillment-bound external reference the control-center
 * seam publishes for the bound workspace row - the only order-bound identity an owner-scoped read
 * reaches - and never the workspace id itself. An unanswered, refused or still-unpublished
 * reference withholds the fact entirely rather than labelling a workspace as the order.
 */
const provisioningOrderRefOf = (controlCenter: Result<AgentWorkspaceControlCenter> | undefined): string | null => {
    if (controlCenter?.ok !== true) return null;
    const reference = controlCenter.data.workspace.externalWorkspaceRef;
    return reference === null || reference.trim().length === 0 ? null : reference;
};

/** Order lifecycle positions an order row can only reach after its payment settled. */
const ORDER_SETTLED: ReadonlySet<string> = new Set(["active", "completed", "in_progress", "paid"]);
/** Order statuses whose purchase is terminally over; a repeat checkout may admit a fresh one. */
const ORDER_TERMINAL: ReadonlySet<string> = new Set(["cancelled", "suspended"]);
/** Workspace statuses that mean the owner can enter. */
const WORKSPACE_READY: ReadonlySet<string> = new Set(["active", "ready"]);
/** Workspace statuses that ended without a usable workspace but admit the fenced owner retry. */
const WORKSPACE_RETRYABLE: ReadonlySet<string> = new Set(["failed"]);
/** Workspace statuses that ended terminally; no owner retry is admitted from them. */
const WORKSPACE_TERMINAL: ReadonlySet<string> = new Set(["suspended"]);
/** The phase names the provisioning surface can stand on. */
type ProvisioningPhase = "provisioning" | "provisioning-unknown" | "provisioning-failed-retryable" | "provisioning-failed-terminal" | "ready";
/** Phases that stand on the provisioning surface rather than the payment surface. */
const PROVISIONING_PHASES: ReadonlySet<PurchasePhase> = new Set<ProvisioningPhase>(["provisioning", "provisioning-unknown", "provisioning-failed-retryable", "provisioning-failed-terminal", "ready"]);

/**
 * Assemble one source-qualified purchase status out of the three owner-scoped snapshots.
 *
 * This mirrors `readWorkspacePurchaseStatus` in the workspace-controlplane seam fact for fact:
 * each source keeps its own name, a refused source reports "unavailable" rather than a verdict,
 * a missing invoice is "not-raised", a missing workspace is "not-admitted", and only a persisted
 * invoice status of "paid" reports paid. When no source answered at all the read fails closed.
 */
const purchaseStatusOf = (purchaseId: string, orders: Result<ReadonlyArray<CatalogOrderRow>> | undefined, invoices: Result<ReadonlyArray<InvoiceRow>> | undefined, workspaces: Result<ReadonlyArray<AgentWorkspaceRow>> | undefined): Result<PurchaseSnapshot> => {
    if (orders?.ok !== true && invoices?.ok !== true && workspaces?.ok !== true) {
        return {
            ok: false,
            reason: orders?.ok === false ? orders.reason : invoices?.ok === false ? invoices.reason : workspaces?.ok === false ? workspaces.reason : "unavailable",
            code: orders?.ok === false ? orders.code : invoices?.ok === false ? invoices.code : workspaces?.ok === false ? workspaces.code : undefined
        };
    }
    const order = orders?.ok === true ? orders.data.find(candidate => candidate.id === purchaseId) ?? null : null;
    const invoice = invoices?.ok === true ? invoices.data.find(candidate => candidate.catalogOrder?.id === purchaseId) ?? null : null;
    const workspace = workspaces?.ok === true ? workspaces.data.find(candidate => candidate.catalogOrder?.id === purchaseId) ?? null : null;
    return {
        ok: true,
        data: {
            order,
            invoice,
            workspace,
            status: {
                purchaseId,
                observedAt: new Date().toISOString(),
                order: orders?.ok !== true ? {
                    state: "unavailable",
                    code: orders?.ok === false ? orders.code ?? null : null
                } : order === null ? {
                    state: "missing"
                } : {
                    state: "observed",
                    status: order.status,
                    offerName: order.catalogItem?.name ?? null,
                    tierName: order.catalogTier?.name ?? null
                },
                payment: invoices?.ok !== true ? {
                    state: "unavailable",
                    code: invoices?.ok === false ? invoices.code ?? null : null
                } : invoice === null ? {
                    state: "not-raised"
                } : {
                    state: "observed",
                    invoiceId: invoice.id,
                    status: invoice.status,
                    amountVnd: invoice.amountVnd,
                    paidAt: invoice.paidAt
                },
                provisioning: workspaces?.ok !== true ? {
                    state: "unavailable",
                    code: workspaces?.ok === false ? workspaces.code ?? null : null
                } : workspace === null ? {
                    state: "not-admitted"
                } : {
                    state: "observed",
                    workspaceId: workspace.id,
                    workspaceName: workspace.name,
                    workspaceStatus: workspace.status
                }
            }
        }
    };
};

/**
 * Settle one source-qualified snapshot into the phase the flow is standing on.
 *
 * A refused read is an unknown phase with a safe reconcile action, never a terminal verdict; only
 * a persisted `paid` invoice or an order already past payment reports payment settled; a missing
 * order denies entry without disclosure; and only a bound ready workspace exposes the ready phase.
 * A settled purchase with no admitted provisioning order stands on its own `paid` phase - the
 * declared intermediate state - until a bound workspace row carries it into provisioning.
 */
const phaseFromStatus = (status: WorkspacePurchaseStatus): PurchasePhase => {
    const order = status.order;
    if (order.state === "unavailable") return "payment-unknown";
    if (order.state === "missing") return "denied";
    if (ORDER_TERMINAL.has(order.status)) return "payment-failed";
    const payment = status.payment;
    if (payment.state === "observed" && payment.status === "cancelled") return "payment-failed";
    const paid = payment.state === "observed" && payment.status === "paid" || ORDER_SETTLED.has(order.status);
    if (!paid) return payment.state === "unavailable" ? "payment-unknown" : "payment-pending";
    const provisioning = status.provisioning;
    if (provisioning.state === "unavailable") return "provisioning-unknown";
    if (provisioning.state === "not-admitted") return "paid";
    if (WORKSPACE_TERMINAL.has(provisioning.workspaceStatus)) return "provisioning-failed-terminal";
    if (WORKSPACE_RETRYABLE.has(provisioning.workspaceStatus)) return "provisioning-failed-retryable";
    return WORKSPACE_READY.has(provisioning.workspaceStatus) ? "ready" : "provisioning";
};

/** The one realtime subject a phase waits on, or nothing when it waits on no one. */
const realtimeTarget = (flow: PurchaseFlow): ProvisioningTarget | null => {
    const workspace = flow.snapshot?.workspace;
    if (workspace !== null && workspace !== undefined && (flow.phase === "provisioning" || flow.phase === "ready" || flow.phase === "provisioning-unknown" || flow.phase === "provisioning-failed-retryable" || flow.phase === "provisioning-failed-terminal")) return {
        kind: "workspace",
        id: workspace.id
    };
    const order = flow.snapshot?.order;
    if (order !== null && order !== undefined && flow.phase !== "denied" && flow.phase !== "loading") return {
        kind: "order",
        id: order.id
    };
    return null;
};

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

/** Connected purchase → payment → workspace status surface bound to one stable purchase identity. */
const PurchaseStatusFlow = (props: PurchaseStatusFlowProps) => {
    const { purchaseId, surface } = props;
    const format = useFormatter();
    const locale = useLocale();
    const t = useTranslations("console.agentos.purchaseStatus");
    const router = useRouter();
    const session = useSession();
    const accessToken = session.state.status === "signed-in" ? session.state.accessToken : null;
    const ordersQuery = useQueryMyCatalogOrdersSwr(accessToken !== null);
    const invoicesQuery = useQueryMyInvoicesSwr(accessToken !== null);
    const workspacesQuery = useQueryMyAgentWorkspacesSwr(accessToken !== null);
    const [flow, setFlow] = useState<PurchaseFlow>({ phase: "loading", snapshot: null, reason: null, surface });
    const [reconciling, setReconciling] = useState(false);
    const [retryPending, setRetryPending] = useState(false);
    const [retryRefusal, setRetryRefusal] = useState<string | null>(null);
    const [entryPending, setEntryPending] = useState(false);
    const [entryRefusal, setEntryRefusal] = useState<string | null>(null);
    const [lastWorkspaceEvent, setLastWorkspaceEvent] = useState<{ readonly status: string; readonly reason: string | null; readonly updatedAt: string } | null>(null);
    const [reconciledAt, setReconciledAt] = useState<string | null>(null);
    const seenEventKey = useRef<string | null>(null);
    const refreshOrders = ordersQuery.mutate;
    const refreshInvoices = invoicesQuery.mutate;
    const refreshWorkspaces = workspacesQuery.mutate;
    const boundWorkspaceId = flow.snapshot?.workspace?.id ?? "";
    const issueWorkspaceLaunch = useMutateIssueAgentWorkspaceAppLaunchSwr(boundWorkspaceId);
    const retryProvisioningOrder = useMutateRetryWorkspaceProvisioningOrderSwr(boundWorkspaceId);
    /* The control-center read binds only once an owner-scoped workspace row exists to name. */
    const controlCenterQuery = useQueryMyAgentWorkspaceControlCenterSwr(boundWorkspaceId, boundWorkspaceId !== "");
    const refreshControlCenter = controlCenterQuery.mutate;
    const links = useMemo(() => ({
        workspaces: getPathname({ locale, href: "/agentos/workspaces" }),
        offerSelection: getPathname({ locale, href: "/agentos/workspaces/new" })
    }), [locale]);
    const purchaserClaims = useMemo(() => accessToken === null ? {} : purchaserClaimsOf(accessToken), [accessToken]);
    const purchaserName = purchaserNameOf(purchaserClaims);
    const purchaserDetail = purchaserDetailOf(purchaserClaims, purchaserName);
    const purchaserFact = purchaserName === null ? null : purchaserDetail === null ? purchaserName : `${purchaserName} · ${purchaserDetail}`;

    const copy = useMemo<PurchaseStatusCopy>(() => ({
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
        operationStatus: status => t.has(`operation.${status}`) ? t(`operation.${status}`) : status
    }), [t]);

    const timeOf = (iso: string) => format.dateTime(new Date(iso), { hour: "2-digit", minute: "2-digit" });
    const stampOf = (iso: string) => format.dateTime(new Date(iso), { dateStyle: "medium", timeStyle: "short" });
    const amountOf = (amountVnd: number) => format.number(amountVnd, { style: "currency", currency: BILLING_CURRENCY, maximumFractionDigits: 0 });
    /* Elapsed is measured against the last authoritative read, never a render-time clock. */
    const elapsedOf = (iso: string) => {
        const now = reconciledAt === null ? Date.parse(iso) : Date.parse(reconciledAt);
        return `${Math.max(1, Math.round((now - Date.parse(iso)) / 60000))}m`;
    };

    const reconcile = useCallback(async () => {
        setReconciling(true);
        setEntryRefusal(null);
        try {
            const [orders, invoices, workspaces] = await Promise.all([refreshOrders(), refreshInvoices(), refreshWorkspaces(), boundWorkspaceId === "" ? Promise.resolve(undefined) : refreshControlCenter()]);
            setReconciledAt(new Date().toISOString());
            const snapshot = purchaseStatusOf(purchaseId, orders, invoices, workspaces);
            if (snapshot.ok) {
                setFlow(current => ({ phase: phaseFromStatus(snapshot.data.status), snapshot: snapshot.data, reason: null, surface: current.surface }));
            } else {
                setFlow(current => ({ phase: PROVISIONING_PHASES.has(current.phase) ? "provisioning-unknown" : "payment-unknown", snapshot: current.snapshot, reason: snapshot.reason, surface: current.surface }));
            }
        } catch {
            setFlow(current => ({ phase: PROVISIONING_PHASES.has(current.phase) ? "provisioning-unknown" : "payment-unknown", snapshot: current.snapshot, reason: "reconcile", surface: current.surface }));
        } finally {
            setReconciling(false);
        }
    }, [purchaseId, refreshInvoices, refreshOrders, refreshWorkspaces, boundWorkspaceId, refreshControlCenter]);

    /* Settle each freshly-read owner-scoped snapshot into the phase it proves. */
    useEffect(() => {
        if (accessToken === null) return;
        if (ordersQuery.data === undefined || invoicesQuery.data === undefined || workspacesQuery.data === undefined) return;
        const snapshot = purchaseStatusOf(purchaseId, ordersQuery.data, invoicesQuery.data, workspacesQuery.data);
        setReconciledAt(new Date().toISOString());
        setFlow(current => {
            if (snapshot.ok) return { phase: phaseFromStatus(snapshot.data.status), snapshot: snapshot.data, reason: null, surface: current.surface };
            if (current.phase !== "loading") return current;
            return { phase: "payment-unknown", snapshot: null, reason: snapshot.reason };
        });
    }, [accessToken, invoicesQuery.data, ordersQuery.data, purchaseId, workspacesQuery.data]);

    const target = realtimeTarget(flow);
    const realtime = useProvisioningRealtime({ accessToken, target });
    useEffect(() => {
        if (realtime.status !== "event") return;
        const event: ProvisioningEvent = realtime.event;
        /* The hook already orders events; this ref stops an identical re-fired event from re-settling state on every render. */
        const eventKey = "updatedAt" in event ? `${event.kind}:${event.id}:${event.updatedAt}` : `${event.kind}:${event.id}:${event.status}`;
        if (seenEventKey.current === eventKey) return;
        seenEventKey.current = eventKey;
        if (event.kind === "order") {
            if (event.id === purchaseId) void reconcile();
            return;
        }
        if (event.kind !== "workspace") return;
        const workspaceId = flow.snapshot?.workspace?.id;
        if (workspaceId === undefined || event.id !== workspaceId) return;
        setLastWorkspaceEvent({ status: event.status, reason: event.reason, updatedAt: event.updatedAt });
        setFlow(current => {
            if (current.snapshot === null) return current;
            if (WORKSPACE_TERMINAL.has(event.status)) return { phase: "provisioning-failed-terminal", snapshot: current.snapshot, reason: event.reason };
            if (WORKSPACE_RETRYABLE.has(event.status)) return { phase: "provisioning-failed-retryable", snapshot: current.snapshot, reason: event.reason };
            if (WORKSPACE_READY.has(event.status)) return { phase: "ready", snapshot: current.snapshot, reason: null };
            return current.phase === "provisioning" || current.phase === "ready" ? current : { ...current, phase: "provisioning" };
        });
    }, [flow.snapshot?.workspace?.id, purchaseId, realtime, reconcile]);

    /* The owner-scoped snapshot is the recovery path for a tab that reconnects after a terminal event. */
    useEffect(() => {
        if (flow.phase !== "payment-pending" && flow.phase !== "payment-unknown" && flow.phase !== "paid" && flow.phase !== "provisioning" && flow.phase !== "provisioning-unknown") return;
        const timer = window.setInterval(() => {
            void reconcile();
        }, 4000);
        return () => window.clearInterval(timer);
    }, [flow.phase, reconcile]);

    useEffect(() => {
        if (realtime.status !== "connected" || flow.phase === "loading" || flow.phase === "denied") return;
        void reconcile();
    }, [realtime.status, flow.phase, reconcile]);

    /* The intl router localizes the href itself, so pushes take the bare route — the getPathname
       output is for anchor hrefs only. */
    const returnToList = useCallback(() => router.push("/agentos/workspaces"), [router]);
    const changeOffer = useCallback(() => router.push("/agentos/workspaces/new"), [router]);
    /* The paid surface's onward action lands on the declared provisioning route; the surface flag keeps the render truthful while navigation settles. */
    const viewProvisioning = useCallback(() => {
        setFlow(current => current.phase === "paid" ? { ...current, surface: "provisioning" } : current);
        router.push(`/agentos/workspaces/purchases/${purchaseId}/provisioning`);
    }, [purchaseId, router]);

    const enterWorkspace = async () => {
        if (boundWorkspaceId === "" || entryPending) return;
        setEntryPending(true);
        setEntryRefusal(null);
        try {
            const grant = await issueWorkspaceLaunch.trigger();
            if (!grant.ok) {
                setEntryRefusal(grant.reason);
                return;
            }
            const destination = safeWorkspaceAppRedirect(grant.data.redirectUrl);
            if (destination === null) {
                setEntryRefusal(copy.outcomeEntryDenied);
                return;
            }
            followWorkspaceAppRedirect(destination);
        } finally {
            setEntryPending(false);
        }
    };

    /* The fenced retry re-drives the same bound workspace; the backend admits it only from `failed`. */
    const retryProvisioning = async () => {
        if (boundWorkspaceId === "" || retryPending) return;
        setRetryPending(true);
        setRetryRefusal(null);
        try {
            const result = await retryProvisioningOrder.trigger();
            if (!result.ok) {
                setRetryRefusal(result.reason);
                return;
            }
            setLastWorkspaceEvent(null);
            await reconcile();
        } finally {
            setRetryPending(false);
        }
    };

    const snapshot = flow.snapshot;
    const order = snapshot?.order ?? null;
    const invoice = snapshot?.invoice ?? null;
    const workspace = snapshot?.workspace ?? null;
    const offerName = order?.catalogItem?.name ?? invoice?.catalogOrder?.catalogItem?.name ?? null;
    const tierName = order?.catalogTier?.name ?? invoice?.catalogOrder?.catalogTier?.name ?? null;
    /* The cadence/renewal band reads only what the order seam publishes; a pre-billing schema or
       an unsettled order withholds the value rather than inventing commercial terms. */
    const billingModel = order?.catalogItem?.billingModel ?? invoice?.catalogOrder?.catalogItem?.billingModel ?? null;
    const renewsAt = order?.renewsAt ?? invoice?.catalogOrder?.renewsAt ?? null;
    const autoRenew = order?.autoRenew ?? invoice?.catalogOrder?.autoRenew ?? null;
    const dayOf = (iso: string) => format.dateTime(new Date(iso), { dateStyle: "medium" });
    const cadenceText = billingModel === "recurring"
        ? copy.cadenceRecurring
        : billingModel === "setup_plus_recurring"
            ? copy.cadenceSetupRecurring
            : billingModel === "one_time" ? copy.cadenceOneTime : "—";
    const renewalText = renewsAt !== null
        ? (autoRenew === true ? copy.renewalAutoAt(dayOf(renewsAt)) : copy.renewalManualAt(dayOf(renewsAt)))
        : autoRenew === true ? copy.renewalAuto
            : billingModel === "one_time" ? copy.renewalNone
                : billingModel === null ? "—" : copy.renewalManual;
    const amountText = invoice === null ? null : amountOf(invoice.amountVnd);
    const observedAt = snapshot?.status.observedAt ?? null;
    const workspaceStatus = lastWorkspaceEvent?.status ?? workspace?.status ?? null;
    const lastObservationAt = lastWorkspaceEvent?.updatedAt ?? observedAt;
    /* The owner may stand on the paid state yet ask for the provisioning surface; the surface flag is view-only and never invents a fact. */
    const renderedPhase: PurchasePhase = flow.phase === "paid" && flow.surface === "provisioning" ? "provisioning" : flow.phase;
    const onProvisioningSurface = PROVISIONING_PHASES.has(renderedPhase);

    const trail = [
        { id: "workspaces", label: copy.workspaces, href: links.workspaces },
        { id: "purchases", label: copy.purchases },
        { id: "purchase", label: purchaseId, isCurrent: !onProvisioningSurface },
        ...(onProvisioningSurface ? [{ id: "provisioning", label: copy.provisioning, isCurrent: true }] : [])
    ];

    const paymentChecks = (): ReadonlyArray<PurchaseStatusCheck> => {
        const payment = snapshot?.status.payment;
        const provisioning = snapshot?.status.provisioning;
        const provider: PurchaseStatusCheck = payment?.state === "unavailable"
            ? check("provider", copy.checkProvider, "unknown", copy.detailSourceRefused)
            : payment?.state === "observed" && payment.status === "paid"
                ? check("provider", copy.checkProvider, "done", copy.detailConfirmed, payment.paidAt === null ? undefined : timeOf(payment.paidAt))
                : payment?.state === "observed" && payment.status === "cancelled"
                    ? check("provider", copy.checkProvider, "failed", copy.detailRefused)
                    : check("provider", copy.checkProvider, "running", copy.detailAwaiting);
        const amountState: WordTone["word"] = payment?.state === "observed" && payment.status === "paid" ? "done" : payment?.state === "unavailable" ? "unknown" : "queued";
        const amount = check("amount", amountText === null ? copy.checkAmount : `${copy.checkAmount} — ${amountText}`, amountState, amountState === "done" ? copy.detailEvaluated : amountState === "unknown" ? copy.detailSourceRefused : copy.detailNotEvaluated);
        const canonical: PurchaseStatusCheck = payment?.state === "observed" && payment.status === "paid"
            ? check("canonical", copy.checkCanonical, "done", copy.detailConfirmed)
            : payment?.state === "observed" && payment.status === "cancelled"
                ? check("canonical", copy.checkCanonical, "failed", copy.detailRefused)
                : payment?.state === "unavailable"
                    ? check("canonical", copy.checkCanonical, "unknown", copy.detailSourceRefused)
                    : check("canonical", copy.checkCanonical, "queued", copy.detailWithheld);
        const admission: PurchaseStatusCheck = provisioning?.state === "observed"
            ? check("admission", copy.checkAdmission, "done", copy.detailAdmitted)
            : provisioning?.state === "unavailable"
                ? check("admission", copy.checkAdmission, "unknown", copy.detailSourceRefused)
                : flow.phase === "paid" || payment?.state === "observed" && payment.status === "paid"
                    ? check("admission", copy.checkAdmission, "queued", copy.detailWaitingAdmission)
                    : check("admission", copy.checkAdmission, "queued", copy.detailLocked);
        return [provider, amount, canonical, admission];
    };

    const provisioningChecks = (): ReadonlyArray<PurchaseStatusCheck> => {
        const payment = snapshot?.status.payment;
        const provisioning = snapshot?.status.provisioning;
        const paid = payment?.state === "observed" && payment.status === "paid";
        const paymentVerified = paid
            ? check("payment", copy.checkPaymentVerified, "done", undefined, payment?.state === "observed" && payment.paidAt !== null ? timeOf(payment.paidAt) : undefined)
            : check("payment", copy.checkPaymentVerified, "queued", copy.detailAwaiting);
        const entitled = snapshot?.status.order.state === "observed" && ORDER_SETTLED.has(snapshot.status.order.status) || workspace !== null;
        const entitlement = entitled
            ? check("entitlement", copy.checkEntitlement, "done", copy.detailOrderRecorded)
            : check("entitlement", copy.checkEntitlement, "running", copy.detailAwaiting);
        const failed = workspaceStatus !== null && (WORKSPACE_RETRYABLE.has(workspaceStatus) || WORKSPACE_TERMINAL.has(workspaceStatus));
        const configure: PurchaseStatusCheck = failed
            ? check("configure", copy.checkConfigure, "failed", copy.detailRefused, lastWorkspaceEvent === null ? undefined : timeOf(lastWorkspaceEvent.updatedAt))
            : workspaceStatus !== null && WORKSPACE_READY.has(workspaceStatus)
                ? check("configure", copy.checkConfigure, "done", undefined, lastWorkspaceEvent === null ? undefined : timeOf(lastWorkspaceEvent.updatedAt))
                : workspace !== null || lastWorkspaceEvent !== null
                    ? check("configure", copy.checkConfigure, "running", workspaceStatus ?? undefined, lastObservationAt === null ? undefined : timeOf(lastObservationAt))
                    : check("configure", copy.checkConfigure, "queued", copy.detailWaitingConfiguration);
        const readiness: PurchaseStatusCheck = failed
            ? check("readiness", copy.checkReadiness, "failed", copy.detailRefused)
            : workspaceStatus !== null && WORKSPACE_READY.has(workspaceStatus)
                ? check("readiness", copy.checkReadiness, "done", undefined, lastObservationAt === null ? undefined : timeOf(lastObservationAt))
                : provisioning?.state === "unavailable"
                    ? check("readiness", copy.checkReadiness, "unknown", copy.detailSourceRefused)
                    : check("readiness", copy.checkReadiness, "queued", copy.detailWaitingReadiness);
        return [paymentVerified, entitlement, configure, readiness];
    };

    const provisioningOperation = (): PurchaseStatusOperation | undefined => {
        if (workspace === null && lastWorkspaceEvent === null) {
            return {
                heading: copy.currentOperation,
                name: copy.operationAdmit,
                word: copy.stateQueued,
                tone: "neutral",
                progressLabel: copy.checkAdmission,
                progressValue: 25,
                lastObservation: observedAt === null ? undefined : copy.lastObservationSentence(copy.detailPaymentSettled, timeOf(observedAt))
            };
        }
        const status = workspaceStatus ?? "provisioning";
        const name = copy.operationStatus(status);
        const failed = WORKSPACE_RETRYABLE.has(status) || WORKSPACE_TERMINAL.has(status);
        const ready = WORKSPACE_READY.has(status);
        const steps = provisioningChecks();
        const score = steps.reduce((total, step) => total + (step.word === copy.stateDone ? 100 : step.word === copy.stateRunning ? 50 : 0), 0);
        const progressValue = Math.round(score / steps.length);
        return {
            heading: copy.currentOperation,
            name,
            word: failed ? copy.stateFailed : ready ? copy.stateDone : copy.stateRunning,
            tone: failed ? "danger" : ready ? "success" : "warning",
            progressLabel: name,
            progressValue,
            started: lastWorkspaceEvent === null ? undefined : copy.startedSentence(timeOf(lastWorkspaceEvent.updatedAt), elapsedOf(lastWorkspaceEvent.updatedAt)),
            lastObservation: lastObservationAt === null ? undefined : copy.lastObservationSentence(lastWorkspaceEvent?.reason ?? status, timeOf(lastObservationAt))
        };
    };

    const paymentTimeline = () => {
        const rows = [];
        const recorded = nivoIconSource("complete");
        if (order !== null) rows.push({ id: "order", title: copy.purchaseRow, detail: copy.orderReports(order.status), mark: recorded });
        if (invoice !== null) rows.push({ id: "invoice", title: copy.invoiceRow, detail: copy.invoiceReports(invoice.status), at: invoice.paidAt === null ? undefined : timeOf(invoice.paidAt), mark: recorded });
        if (observedAt !== null) rows.push({ id: "read", title: copy.timelineRead, detail: copy.timelineReadDetail, at: timeOf(observedAt), mark: recorded });
        return rows;
    };

    const paymentPrimary = () => ({
        label: copy.purchaseFactsLabel,
        fact: purchaseId,
        banner: offerName === null ? undefined : [offerName, ...(amountText === null ? [] : [amountText]), ...(tierName === null ? [] : [tierName])],
        facts: [
            { label: copy.offer, value: offerName ?? "—" },
            { label: copy.offerPlan, value: tierName ?? "—" },
            { label: copy.purchaseRef, value: purchaseId },
            { label: copy.paymentAttempt, value: invoice?.id ?? "—" },
            { label: copy.amountLabel, value: amountText ?? "—" },
            { label: copy.paymentStatusLabel, value: invoice?.status ?? "—" },
            { label: copy.invoiceDue, value: invoice === null ? "—" : stampOf(invoice.dueAt) },
            { label: copy.invoicePaidAt, value: invoice?.paidAt == null ? "—" : stampOf(invoice.paidAt) }
        ],
        timeline: paymentTimeline()
    });

    const provisioningPrimary = (phase: PurchasePhase) => ({
        label: copy.provisioningOrderLabel,
        fact: provisioningOrderRefOf(controlCenterQuery.data) ?? undefined,
        facts: [
            { label: copy.offer, value: offerName ?? "—" },
            { label: copy.purchaseLabel, value: purchaseId },
            { label: copy.paymentStatusLabel, value: amountText === null ? (invoice?.status ?? "—") : copy.paidSentence(amountText) },
            { label: copy.workspaceLabel, value: workspace?.id ?? copy.workspacePending },
            { label: copy.offerPlan, value: tierName ?? "—" },
            { label: invoice?.paidAt == null ? copy.invoiceDue : copy.invoicePaidAt, value: invoice === null ? "—" : stampOf(invoice.paidAt ?? invoice.dueAt) }
        ],
        cadenceFacts: [
            { label: copy.cadenceLabel, value: cadenceText },
            { label: copy.renewalLabel, value: renewalText }
        ],
        operation: provisioningOperation(),
        footnote: `Order ${purchaseId} ${copy.reconcileNote}`,
        action: phase === "provisioning" || phase === "provisioning-unknown" ? { label: phase === "provisioning" ? copy.refreshStatusAction : copy.reconcileOrderAction, pending: reconciling } : undefined
    });

    const paymentRail = (phase: PurchasePhase): PurchaseStatusRail => {
        const attempt = invoice?.id ?? purchaseId;
        return {
            label: copy.verificationLabel,
            latestCheck: observedAt === null ? undefined : `${copy.latestCheck} · ${timeOf(observedAt)}`,
            checks: paymentChecks(),
            notice: phase === "payment-pending" ? copy.lockedNotice : flow.reason ?? undefined,
            action: phase === "payment-failed"
                ? { label: copy.changeOffer }
                : phase === "paid"
                    ? { label: copy.viewProvisioningAction }
                    : { label: phase === "payment-unknown" ? copy.reconcilePaymentAction : copy.checkPaymentAction, pending: reconciling },
            actionCaption: phase === "payment-failed" || phase === "paid" ? undefined : copy.rechecksOnly(attempt),
            secondaryLink: { label: copy.returnToList, href: links.workspaces }
        };
    };

    const provisioningRail = (phase: PurchasePhase): PurchaseStatusRail => {
        const ready = phase === "ready";
        const retryable = phase === "provisioning-failed-retryable";
        const terminal = phase === "provisioning-failed-terminal";
        const entryDenied = ready && entryRefusal !== null;
        const attempt = provisioningAttemptOf(controlCenterQuery.data);
        return {
            label: copy.confirmedFactsLabel,
            fact: attempt === null ? undefined : copy.attemptFact(attempt),
            checks: provisioningChecks(),
            facts: [
                { label: copy.ownerLabel, value: purchaserFact ?? "—" },
                { label: copy.attemptLabel, value: attempt === null ? "—" : String(attempt) }
            ],
            notice: phase === "provisioning-unknown" ? (flow.reason ?? copy.detailSourceRefused) : retryable || terminal ? (flow.reason ?? undefined) : undefined,
            outcome: {
                title: `${copy.outcomeLabel}: ${workspace?.name ?? offerName ?? "—"}`,
                detail: ready ? copy.outcomeEntryReady : terminal ? copy.outcomeProvisioningTerminal : retryable ? copy.outcomeProvisioningRetryable : copy.outcomeEntryWithheld
            },
            action: ready
                ? entryDenied ? { label: copy.refreshStatusAction, pending: reconciling } : { label: copy.enterWorkspaceAction, pending: entryPending }
                : retryable ? { label: copy.retryProvisionAction, pending: retryPending } : undefined,
            actionCaption: retryable ? copy.retryProvisionCaption : undefined,
            refusalText: entryRefusal ?? retryRefusal ?? undefined
            /* The escape action is page-level below the rail card on every provisioning state. */
        };
    };

    const headFor = (title: string, subtitle: string, badge?: PurchaseStatusBadge) => ({
        copy,
        links,
        trail,
        title,
        subtitle,
        badge
    });

    const view = (): PurchaseStatusFlowViewProps => {
        if (flow.phase === "loading") {
            return {
                state: "loading",
                props: { ...headFor(copy.loadingTitle, copy.loadingText), surface: flow.surface }
            };
        }
        if (flow.phase === "denied") {
            return {
                state: "denied",
                props: { ...headFor(copy.deniedTitle, copy.deniedSubtitle), message: copy.deniedNotice, description: copy.deniedText },
                on: { returnToList }
            };
        }
        if (renderedPhase === "payment-pending" || renderedPhase === "payment-unknown" || renderedPhase === "payment-failed" || renderedPhase === "paid") {
            const heading = renderedPhase === "payment-pending"
                ? headFor(copy.paymentPendingTitle, copy.paymentPendingSubtitle, { label: copy.paymentPendingBadge, tone: "warning" })
                : renderedPhase === "payment-unknown"
                    ? headFor(copy.paymentUnknownTitle, copy.paymentUnknownSubtitle, { label: copy.paymentUnknownBadge, tone: "warning" })
                    : renderedPhase === "payment-failed"
                        ? headFor(copy.paymentFailedTitle, copy.paymentFailedSubtitle, { label: copy.paymentFailedBadge, tone: "danger" })
                        : headFor(copy.paidTitle, copy.paidSubtitle, { label: copy.paidBadge, tone: "success" });
            return {
                state: renderedPhase,
                props: { ...heading, primary: paymentPrimary(), rail: paymentRail(renderedPhase) },
                on: {
                    primary: renderedPhase === "payment-failed" ? changeOffer : renderedPhase === "paid" ? viewProvisioning : () => void reconcile(),
                    returnToList
                }
            };
        }
        /* The guards above returned every non-provisioning phase, so only the family remains. */
        const phase = renderedPhase as ProvisioningPhase;
        const subtitle = phase === "ready" ? copy.readySubtitle : `${copy.provisioningSubtitle} ${lastObservationAt === null ? "" : stampOf(lastObservationAt)}.`;
        const heading = phase === "provisioning"
            ? headFor(offerName === null ? copy.provisioningTitle : copy.preparingOffer(offerName), subtitle, { label: copy.provisioningBadge, tone: "warning" })
            : phase === "provisioning-unknown"
                ? headFor(copy.provisioningUnknownTitle, subtitle, { label: copy.provisioningUnknownBadge, tone: "warning" })
                : phase === "provisioning-failed-retryable"
                    ? headFor(copy.provisioningFailedTitle, subtitle, { label: copy.provisioningFailedBadge, tone: "warning" })
                    : phase === "provisioning-failed-terminal"
                        ? headFor(copy.provisioningFailedTerminalTitle, subtitle, { label: copy.provisioningFailedTerminalBadge, tone: "danger" })
                        : headFor(copy.readyTitle, subtitle, { label: copy.readyBadge, tone: "success" });
        const entryDenied = phase === "ready" && entryRefusal !== null;
        return {
            state: phase,
            props: {
                ...heading,
                primary: provisioningPrimary(phase),
                rail: provisioningRail(phase),
                escapeLink: { label: copy.returnToList, href: links.workspaces }
            },
            on: {
                primary: entryDenied
                    ? () => void reconcile()
                    : phase === "ready"
                        ? () => void enterWorkspace()
                        : phase === "provisioning" || phase === "provisioning-unknown"
                            ? () => void reconcile()
                            : phase === "provisioning-failed-retryable"
                                ? () => void retryProvisioning()
                                : undefined,
                returnToList
            }
        };
    };

    return <PurchaseStatusFlowBase {...view()} />;
};

export { PurchaseStatusFlow };
export default PurchaseStatusFlow;
