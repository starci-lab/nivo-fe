import type { createTranslator } from "next-intl"
import type enMessages from "@/messages/en.json"

import type { PurchaseStatusCopy } from "./copy.contract"

export type { PurchaseStatusCopy } from "./copy.contract"

/** The next-intl translator bound to `console.agentos.purchaseStatus`; its keys are checked against the catalog. */
type PurchaseStatusTranslator = ReturnType<typeof createTranslator<typeof enMessages, "console.agentos.purchaseStatus">>

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
export const createPurchaseStatusCopy = (
    t: PurchaseStatusTranslator,
    realtimeReconnect: string,
): PurchaseStatusCopy => {
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
