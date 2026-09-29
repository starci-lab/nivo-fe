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

/** The narrow translator adapter needed by this purchase-status catalog namespace. */
export type PurchaseStatusTranslator = {
    readonly text: (key: string, values?: Readonly<Record<string, string | number>>) => string
    readonly has: (key: string) => boolean
}

/** Resolve the purchase-status copy without letting the view name catalog keys. */
export const createPurchaseStatusCopy = (translate: PurchaseStatusTranslator): PurchaseStatusCopy => {
    const kebab = (value: string): string => value.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase())
    const keyed = (prefix: string) => (value: string) => {
        const key = `${prefix}.${value}`
        return translate.has(key) ? translate.text(key) : value
    }
    return {
        path: translate.text("path"),
        workspaces: translate.text("workspaces"),
        purchases: translate.text("purchases"),
        provisioning: translate.text("provisioning"),
        loadingTitle: translate.text("loadingTitle"),
        loadingText: translate.text("loadingText"),
        loading: translate.text("loading"),
        paymentPendingTitle: translate.text("paymentPendingTitle"),
        paymentPendingBadge: translate.text("paymentPendingBadge"),
        paymentPendingSubtitle: translate.text("paymentPendingSubtitle"),
        paymentUnknownTitle: translate.text("paymentUnknownTitle"),
        paymentUnknownBadge: translate.text("paymentUnknownBadge"),
        paymentUnknownSubtitle: translate.text("paymentUnknownSubtitle"),
        paymentFailedTitle: translate.text("paymentFailedTitle"),
        paymentFailedBadge: translate.text("paymentFailedBadge"),
        paymentFailedSubtitle: translate.text("paymentFailedSubtitle"),
        paidTitle: translate.text("paidTitle"),
        paidBadge: translate.text("paidBadge"),
        paidSubtitle: translate.text("paidSubtitle"),
        provisioningTitle: translate.text("provisioningTitle"),
        provisioningBadge: translate.text("provisioningBadge"),
        provisioningSubtitle: translate.text("provisioningSubtitle"),
        provisioningUnknownTitle: translate.text("provisioningUnknownTitle"),
        provisioningUnknownBadge: translate.text("provisioningUnknownBadge"),
        provisioningFailedTitle: translate.text("provisioningFailedTitle"),
        provisioningFailedBadge: translate.text("provisioningFailedBadge"),
        provisioningFailedTerminalTitle: translate.text("provisioningFailedTerminalTitle"),
        provisioningFailedTerminalBadge: translate.text("provisioningFailedTerminalBadge"),
        readyTitle: translate.text("readyTitle"),
        readyBadge: translate.text("readyBadge"),
        readySubtitle: translate.text("readySubtitle"),
        deniedTitle: translate.text("deniedTitle"),
        deniedSubtitle: translate.text("deniedSubtitle"),
        deniedNotice: translate.text("deniedNotice"),
        deniedText: translate.text("deniedText"),
        purchaseFactsLabel: translate.text("purchaseFactsLabel"),
        verificationLabel: translate.text("verificationLabel"),
        provisioningOrderLabel: translate.text("provisioningOrderLabel"),
        confirmedFactsLabel: translate.text("confirmedFactsLabel"),
        latestCheck: translate.text("latestCheck"),
        offer: translate.text("offer"),
        offerPlan: translate.text("offerPlan"),
        purchaseRef: translate.text("purchaseRef"),
        paymentAttempt: translate.text("paymentAttempt"),
        paymentStatusLabel: translate.text("paymentStatusLabel"),
        amountLabel: translate.text("amountLabel"),
        invoiceDue: translate.text("invoiceDue"),
        invoicePaidAt: translate.text("invoicePaidAt"),
        workspaceLabel: translate.text("workspaceLabel"),
        workspacePending: translate.text("workspacePending"),
        cadenceLabel: translate.text("cadenceLabel"),
        renewalLabel: translate.text("renewalLabel"),
        cadenceOneTime: translate.text("cadenceOneTime"),
        cadenceRecurring: translate.text("cadenceRecurring"),
        cadenceSetupRecurring: translate.text("cadenceSetupRecurring"),
        renewalAuto: translate.text("renewalAuto"),
        renewalAutoAt: (date) => translate.text("renewalAutoAt", { date }),
        renewalManualAt: (date) => translate.text("renewalManualAt", { date }),
        renewalManual: translate.text("renewalManual"),
        renewalNone: translate.text("renewalNone"),
        purchaseRow: translate.text("purchaseRow"),
        invoiceRow: translate.text("invoiceRow"),
        paidAmount: translate.text("paidAmount"),
        currentOperation: translate.text("currentOperation"),
        operationAdmit: translate.text("operationAdmit"),
        purchaseLabel: translate.text("purchaseLabel"),
        timelineRead: translate.text("timelineRead"),
        timelineReadDetail: translate.text("timelineReadDetail"),
        detailPaymentSettled: translate.text("detailPaymentSettled"),
        startedLabel: translate.text("startedLabel"),
        lastObservation: translate.text("lastObservation"),
        reconcileNote: translate.text("reconcileNote"),
        checkProvider: translate.text("checkProvider"),
        checkAmount: translate.text("checkAmount"),
        checkCanonical: translate.text("checkCanonical"),
        checkAdmission: translate.text("checkAdmission"),
        checkPaymentVerified: translate.text("checkPaymentVerified"),
        checkEntitlement: translate.text("checkEntitlement"),
        checkConfigure: translate.text("checkConfigure"),
        checkReadiness: translate.text("checkReadiness"),
        detailAwaiting: translate.text("detailAwaiting"),
        detailEvaluated: translate.text("detailEvaluated"),
        detailNotEvaluated: translate.text("detailNotEvaluated"),
        detailWithheld: translate.text("detailWithheld"),
        detailConfirmed: translate.text("detailConfirmed"),
        detailRefused: translate.text("detailRefused"),
        detailSourceRefused: translate.text("detailSourceRefused"),
        detailLocked: translate.text("detailLocked"),
        detailAdmitted: translate.text("detailAdmitted"),
        detailWaitingAdmission: translate.text("detailWaitingAdmission"),
        detailWaitingConfiguration: translate.text("detailWaitingConfiguration"),
        detailWaitingReadiness: translate.text("detailWaitingReadiness"),
        detailOrderRecorded: translate.text("detailOrderRecorded"),
        lockedNotice: translate.text("lockedNotice"),
        outcomeLabel: translate.text("outcomeLabel"),
        outcomeEntryWithheld: translate.text("outcomeEntryWithheld"),
        outcomeEntryReady: translate.text("outcomeEntryReady"),
        outcomeEntryDenied: translate.text("outcomeEntryDenied"),
        outcomeProvisioningRetryable: translate.text("outcomeProvisioningRetryable"),
        outcomeProvisioningTerminal: translate.text("outcomeProvisioningTerminal"),
        checkPaymentAction: translate.text("checkPaymentAction"),
        reconcilePaymentAction: translate.text("reconcilePaymentAction"),
        refreshStatusAction: translate.text("refreshStatusAction"),
        reconcileOrderAction: translate.text("reconcileOrderAction"),
        retryProvisionAction: translate.text("retryProvisionAction"),
        retryProvisionCaption: translate.text("retryProvisionCaption"),
        viewProvisioningAction: translate.text("viewProvisioningAction"),
        enterWorkspaceAction: translate.text("enterWorkspaceAction"),
        returnToList: translate.text("returnToList"),
        backToWorkspaces: translate.text("backToWorkspaces"),
        ownerLabel: translate.text("ownerLabel"),
        attemptLabel: translate.text("attemptLabel"),
        changeOffer: translate.text("changeOffer"),
        realtimeReconnect: translate.text("realtimeReconnect"),
        stateDone: translate.text("stateDone"),
        stateRunning: translate.text("stateRunning"),
        stateQueued: translate.text("stateQueued"),
        stateFailed: translate.text("stateFailed"),
        stateUnknown: translate.text("stateUnknown"),
        rechecksOnly: (attempt) => translate.text("rechecksOnly", { attempt }),
        preparingOffer: (offer) => translate.text("preparingOffer", { offer }),
        orderReports: (status) => translate.text("orderReports", { status }),
        invoiceReports: (status) => translate.text("invoiceReports", { status }),
        paidSentence: (amount) => translate.text("paidSentence", { amount }),
        startedSentence: (at, elapsed) => translate.text("startedSentence", { at, elapsed }),
        lastObservationSentence: (detail, at) => translate.text("lastObservationSentence", { detail, at }),
        operationStatus: (status) => {
            const key = `operation.${status}`
            return translate.has(key) ? translate.text(key) : status
        },
        attemptFact: (attempt) => translate.text("attemptFact", { attempt }),
        ledgerLabel: translate.text("ledgerLabel"),
        unavailableNotice: translate.text("unavailableNotice"),
        renewAction: translate.text("renewAction"),
        heldSinceLabel: (date) => translate.text("heldSinceLabel", { date }),
        paidThroughLabel: (date) => translate.text("paidThroughLabel", { date }),
        entryNotReadyNotice: translate.text("entryNotReadyNotice"),
        entryConflictNotice: translate.text("entryConflictNotice"),
        purchaseStateLabel: (state) => {
            const key = `stateLabel.${kebab(state)}`
            return translate.has(key) ? translate.text(key) : state
        },
        sourceLabel: (source) => {
            const sourceNames: Readonly<Record<string, string>> = {
                "payment-reconciliation": "payment",
                "platform-billing-ledger": "billing",
                "workspace-provisioning": "provisioning",
            }
            const name = sourceNames[source] ?? source
            const key = `sourceLabel.${name}`
            return translate.has(key) ? translate.text(key) : source
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
        provisioningDispositionLabel: keyed("provisioningDispositionLabel"),
    }
}
