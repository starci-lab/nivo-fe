import type { createTranslator } from "next-intl"
import type enMessages from "@/messages/en.json"

/**
 * The copy contract the purchase-status view consumes. Every phrase resolves through the next-intl
 * catalog (`console.agentos.purchaseStatus` in src/messages/{en,vi}.json); this module owns only
 * the shape so the presentational component never names a message key.
 */
export type PurchaseStatusCopy = {
    /** Accessible name of the breadcrumb trail. */
    readonly path: string
    readonly workspaces: string
    readonly purchases: string
    readonly provisioning: string
    readonly loadingTitle: string
    readonly loadingText: string
    /** Spoken name of a skeleton placeholder while the read is in flight. */
    readonly loading: string
    readonly paymentPendingTitle: string
    readonly paymentPendingBadge: string
    readonly paymentPendingSubtitle: string
    readonly paymentUnknownTitle: string
    readonly paymentUnknownBadge: string
    readonly paymentUnknownSubtitle: string
    readonly paymentFailedTitle: string
    readonly paymentFailedBadge: string
    readonly paymentFailedSubtitle: string
    readonly paidTitle: string
    readonly paidBadge: string
    readonly paidSubtitle: string
    readonly provisioningTitle: string
    readonly provisioningBadge: string
    readonly provisioningSubtitle: string
    readonly provisioningUnknownTitle: string
    readonly provisioningUnknownBadge: string
    readonly provisioningFailedTitle: string
    readonly provisioningFailedBadge: string
    readonly provisioningFailedTerminalTitle: string
    readonly provisioningFailedTerminalBadge: string
    readonly readyTitle: string
    readonly readyBadge: string
    readonly readySubtitle: string
    readonly deniedTitle: string
    readonly deniedSubtitle: string
    readonly deniedNotice: string
    readonly deniedText: string
    readonly purchaseFactsLabel: string
    readonly verificationLabel: string
    readonly provisioningOrderLabel: string
    readonly confirmedFactsLabel: string
    readonly latestCheck: string
    readonly offer: string
    readonly offerPlan: string
    readonly purchaseRef: string
    readonly paymentAttempt: string
    readonly paymentStatusLabel: string
    readonly amountLabel: string
    readonly invoiceDue: string
    readonly invoicePaidAt: string
    readonly workspaceLabel: string
    readonly workspacePending: string
    /** Second fact band on the provisioning surface: billing cadence and renewal behavior. */
    readonly cadenceLabel: string
    readonly renewalLabel: string
    /** Cadence value for a one-time (never recurring) item. */
    readonly cadenceOneTime: string
    /** Cadence value for an item billed every cycle. */
    readonly cadenceRecurring: string
    /** Cadence value for a one-time setup followed by recurring billing. */
    readonly cadenceSetupRecurring: string
    /** Renewal value when the order auto-renews but publishes no date. */
    readonly renewalAuto: string
    /** Renewal value when the order auto-renews: "Auto-renews {date}". */
    readonly renewalAutoAt: (date: string) => string
    /** Renewal value when the owner re-authorizes manually by the published date. */
    readonly renewalManualAt: (date: string) => string
    /** Renewal value when re-authorization is manual and no date is published. */
    readonly renewalManual: string
    /** Renewal value for a one-time order that never renews. */
    readonly renewalNone: string
    readonly purchaseRow: string
    readonly invoiceRow: string
    readonly paidAmount: string
    readonly currentOperation: string
    readonly operationAdmit: string
    readonly purchaseLabel: string
    readonly timelineRead: string
    readonly timelineReadDetail: string
    readonly detailPaymentSettled: string
    readonly startedLabel: string
    readonly lastObservation: string
    readonly reconcileNote: string
    readonly checkProvider: string
    readonly checkAmount: string
    readonly checkCanonical: string
    readonly checkAdmission: string
    readonly checkPaymentVerified: string
    readonly checkEntitlement: string
    readonly checkConfigure: string
    readonly checkReadiness: string
    readonly detailAwaiting: string
    readonly detailEvaluated: string
    readonly detailNotEvaluated: string
    readonly detailWithheld: string
    readonly detailConfirmed: string
    readonly detailRefused: string
    readonly detailSourceRefused: string
    readonly detailLocked: string
    readonly detailAdmitted: string
    readonly detailWaitingAdmission: string
    readonly detailWaitingConfiguration: string
    readonly detailWaitingReadiness: string
    readonly detailOrderRecorded: string
    readonly lockedNotice: string
    readonly outcomeLabel: string
    readonly outcomeEntryWithheld: string
    readonly outcomeEntryReady: string
    readonly outcomeEntryDenied: string
    readonly outcomeProvisioningRetryable: string
    readonly outcomeProvisioningTerminal: string
    readonly checkPaymentAction: string
    readonly reconcilePaymentAction: string
    readonly refreshStatusAction: string
    readonly reconcileOrderAction: string
    readonly retryProvisionAction: string
    readonly retryProvisionCaption: string
    readonly viewProvisioningAction: string
    readonly enterWorkspaceAction: string
    readonly returnToList: string
    readonly backToWorkspaces: string
    /** Confirmed-facts row naming the provisioning owner identity. */
    readonly ownerLabel: string
    /** Confirmed-facts row naming the fenced provisioning attempt. */
    readonly attemptLabel: string
    readonly changeOffer: string
    readonly realtimeReconnect: string
    readonly stateDone: string
    readonly stateRunning: string
    readonly stateQueued: string
    readonly stateFailed: string
    readonly stateUnknown: string
    /** Recheck caption naming the exact attempt identity the action reconciles. */
    readonly rechecksOnly: (attempt: string) => string
    /** The provisioning heading naming the offer being prepared. */
    readonly preparingOffer: (offer: string) => string
    /** Timeline sentences reporting each source's own verbatim status. */
    readonly orderReports: (status: string) => string
    readonly invoiceReports: (status: string) => string
    /** The fact-strip sentence naming the settled amount. */
    readonly paidSentence: (amount: string) => string
    /** "Started {at} · {n} elapsed" for the running operation. */
    readonly startedSentence: (at: string, elapsed: string) => string
    /** "Last observation: {detail} at {at}" for the running operation. */
    readonly lastObservationSentence: (detail: string, at: string) => string
    /** Lifecycle label for one workspace provisioning operation status. */
    readonly operationStatus: (status: string) => string
    /** Trailing rail fact "Attempt {attempt}" naming the fenced attempt the order stands on. */
    readonly attemptFact: (attempt: number) => string
    /** The platform billing ledger's own label. */
    readonly ledgerLabel: string
    /** Notice shown where a source outage keeps one facet from answering. */
    readonly unavailableNotice: string
    /** The held-entitlement renewal action offered to the current owner. */
    readonly renewAction: string
    /** "On hold since {date}" for a held entitlement. */
    readonly heldSinceLabel: (date: string) => string
    /** "Paid through {date}" for a held entitlement. */
    readonly paidThroughLabel: (date: string) => string
    /** Notice shown when the entry boundary answers not-ready beside the purchase's real state. */
    readonly entryNotReadyNotice: string
    /** Notice shown when the observed identities disagree with the confirmed record. */
    readonly entryConflictNotice: string
    /** Lifecycle label of one purchase cursor state (`stateLabel.<state>`). */
    readonly purchaseStateLabel: (state: string) => string
    /** Display name of the source owning a facet (`sourceLabel.<source>`). */
    readonly sourceLabel: (source: string) => string
    /** Label of one source-read state (`sourceStateLabel.<state>`). */
    readonly sourceStateLabel: (state: string) => string
    /** Label of one ledger settlement state (`ledgerStateLabel.<state>`). */
    readonly ledgerStateLabel: (state: string) => string
    /** Label of one posted ledger entry kind (`ledgerEntryKindLabel.<kind>`). */
    readonly ledgerEntryKindLabel: (kind: string) => string
    /** Label of one refund projection state (`refundStateLabel.<state>`). */
    readonly refundStateLabel: (state: string) => string
    /** Label of one service-eligibility state (`holdStateLabel.<state>`). */
    readonly holdStateLabel: (state: string) => string
    /** Label of one attributable hold reason (`holdReasonLabel.<reason>`). */
    readonly holdReasonLabel: (reason: string) => string
    /** Label of one renewal-evidence value (`renewalEvidenceLabel.<evidence>`). */
    readonly renewalEvidenceLabel: (evidence: string) => string
    /** Label of one entry outcome status (`entryStateLabel.<status>`). */
    readonly entryStateLabel: (status: string) => string
    /** Label of one entry refusal code (`entryRefusalLabel.<code>`). */
    readonly entryRefusalLabel: (code: string) => string
    /** Label of one provisioning-owner disposition (`provisioningDispositionLabel.<disposition>`). */
    readonly provisioningDispositionLabel: (disposition: string) => string
}

/** The next-intl translator bound to `console.agentos.purchaseStatus`; its keys are checked against the catalog. */
type PurchaseStatusTranslator = ReturnType<
    typeof createTranslator<typeof enMessages, "console.agentos.purchaseStatus">
>

/** Narrow a free-form value from a source to one of the values the catalog labels, or `undefined`. */
const knownOf = <Known extends string>(known: ReadonlyArray<Known>, value: string): Known | undefined =>
    known.find((candidate) => candidate === value)

const OPERATION_STATUSES = [
    "waiting_capacity",
    "provisioning",
    "installing",
    "starting",
    "active",
    "ready",
    "failed",
    "suspended",
] as const
const PURCHASE_STATES = [
    "selected",
    "paymentNotStarted",
    "paymentPending",
    "paymentOutcomeUnknown",
    "paymentRefused",
    "paymentFailed",
    "paid",
    "provisioning",
    "provisioningRefused",
    "ready",
    "renewed",
    "paymentCancelled",
] as const
const SOURCE_NAMES = ["payment", "billing", "provisioning", "readiness"] as const
const SOURCE_STATES = ["none", "unavailable", "observed"] as const
const LEDGER_STATES = [
    "open",
    "pending",
    "paid",
    "refused",
    "failed",
    "cancelled",
    "unmatched-receipt",
    "disputed",
    "refund-pending",
    "refund-unresolved",
] as const
const LEDGER_ENTRY_KINDS = [
    "payment",
    "dispute",
    "refund-intent",
    "refund",
    "correction",
    "adjustment",
    "unmatched-receipt",
] as const
const REFUND_STATES = ["refund-started", "refunded", "refund-pending-reconciliation", "unavailable"] as const
const HOLD_STATES = ["eligible", "held", "none", "unavailable"] as const
const HOLD_REASONS = ["non-payment", "expiry", "cancellation"] as const
const RENEWAL_EVIDENCE = ["none", "pending", "unknown"] as const
const ENTRY_STATES = ["entry", "not-ready", "refused", "unavailable", "conflict"] as const
const ENTRY_REFUSALS = [
    "unauthenticated",
    "purchaser-not-admitted",
    "purchase-not-found-non-disclosing",
    "request-invalid",
    "owner-mismatch",
    "workspace-not-found-non-disclosing",
    "workspace-not-ready",
    "readiness-observation-stale",
    "entry-unsupported",
    "source-unavailable",
    "entry-owner-unavailable",
] as const
const DISPOSITIONS = [
    "admitted",
    "running",
    "outcome-unknown",
    "refused",
    "failed-retryable",
    "failed-terminal",
    "ready",
] as const

/**
 * Resolve the purchase-status copy without letting the view name catalog keys. The reconnect sentence is the
 * provisioning flows' own (`provisioningFlows.connecting`), handed in by the connected owner so it lives once.
 */
export const createPurchaseStatusCopy = (t: PurchaseStatusTranslator, realtimeReconnect: string): PurchaseStatusCopy => {
    const kebab = (value: string): string =>
        value.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase())
    return {
        path: t("path"),
        workspaces: t("workspaces"),
        purchases: t("purchases"),
        provisioning: t("provisioning"),
        loadingTitle: t("loadingTitle"),
        loadingText: t("loadingText"),
        loading: t("loading"),
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
        renewalAutoAt: (date) => t("renewalAutoAt", { date }),
        renewalManualAt: (date) => t("renewalManualAt", { date }),
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
        changeOffer: t("changeOffer"),
        realtimeReconnect,
        stateDone: t("stateDone"),
        stateRunning: t("stateRunning"),
        stateQueued: t("stateQueued"),
        stateFailed: t("stateFailed"),
        stateUnknown: t("stateUnknown"),
        rechecksOnly: (attempt) => t("rechecksOnly", { attempt }),
        preparingOffer: (offer) => t("preparingOffer", { offer }),
        orderReports: (status) => t("orderReports", { status }),
        invoiceReports: (status) => t("invoiceReports", { status }),
        paidSentence: (amount) => t("paidSentence", { amount }),
        startedSentence: (at, elapsed) => t("startedSentence", { at, elapsed }),
        lastObservationSentence: (detail, at) => t("lastObservationSentence", { detail, at }),
        operationStatus: (status) => {
            const known = knownOf(OPERATION_STATUSES, status)
            return known === undefined ? status : t(`operation.${known}`)
        },
        attemptFact: (attempt) => t("attemptFact", { attempt }),
        ledgerLabel: t("ledgerLabel"),
        unavailableNotice: t("unavailableNotice"),
        renewAction: t("renewAction"),
        heldSinceLabel: (date) => t("heldSinceLabel", { date }),
        paidThroughLabel: (date) => t("paidThroughLabel", { date }),
        entryNotReadyNotice: t("entryNotReadyNotice"),
        entryConflictNotice: t("entryConflictNotice"),
        purchaseStateLabel: (state) => {
            const known = knownOf(PURCHASE_STATES, kebab(state))
            return known === undefined ? state : t(`stateLabel.${known}`)
        },
        sourceLabel: (source) => {
            const sourceNames: Readonly<Record<string, string>> = {
                "payment-reconciliation": "payment",
                "platform-billing-ledger": "billing",
                "workspace-provisioning": "provisioning",
            }
            const known = knownOf(SOURCE_NAMES, sourceNames[source] ?? source)
            return known === undefined ? source : t(`sourceLabel.${known}`)
        },
        sourceStateLabel: (value) => {
            const known = knownOf(SOURCE_STATES, value)
            return known === undefined ? value : t(`sourceStateLabel.${known}`)
        },
        ledgerStateLabel: (value) => {
            const known = knownOf(LEDGER_STATES, value)
            return known === undefined ? value : t(`ledgerStateLabel.${known}`)
        },
        ledgerEntryKindLabel: (value) => {
            const known = knownOf(LEDGER_ENTRY_KINDS, value)
            return known === undefined ? value : t(`ledgerEntryKindLabel.${known}`)
        },
        refundStateLabel: (value) => {
            const known = knownOf(REFUND_STATES, value)
            return known === undefined ? value : t(`refundStateLabel.${known}`)
        },
        holdStateLabel: (value) => {
            const known = knownOf(HOLD_STATES, value)
            return known === undefined ? value : t(`holdStateLabel.${known}`)
        },
        holdReasonLabel: (value) => {
            const known = knownOf(HOLD_REASONS, value)
            return known === undefined ? value : t(`holdReasonLabel.${known}`)
        },
        renewalEvidenceLabel: (value) => {
            const known = knownOf(RENEWAL_EVIDENCE, value)
            return known === undefined ? value : t(`renewalEvidenceLabel.${known}`)
        },
        entryStateLabel: (value) => {
            const known = knownOf(ENTRY_STATES, value)
            return known === undefined ? value : t(`entryStateLabel.${known}`)
        },
        entryRefusalLabel: (value) => {
            const known = knownOf(ENTRY_REFUSALS, value)
            return known === undefined ? value : t(`entryRefusalLabel.${known}`)
        },
        provisioningDispositionLabel: (value) => {
            const known = knownOf(DISPOSITIONS, value)
            return known === undefined ? value : t(`provisioningDispositionLabel.${known}`)
        },
    }
}
