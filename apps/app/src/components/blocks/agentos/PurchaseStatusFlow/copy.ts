/**
 * The copy contract the purchase-status view consumes. Every phrase resolves through the next-intl
 * catalog (`console.agentos.purchaseStatus` in src/messages/{en,vi}.json); this module owns only
 * the shape so the presentational component never names a message key.
 */
export type PurchaseStatusCopy = {
    /** Accessible name of the breadcrumb trail. */
    readonly path: string;
    readonly workspaces: string;
    readonly purchases: string;
    readonly provisioning: string;
    readonly loadingTitle: string;
    readonly loadingText: string;
    readonly paymentPendingTitle: string;
    readonly paymentPendingBadge: string;
    readonly paymentPendingSubtitle: string;
    readonly paymentUnknownTitle: string;
    readonly paymentUnknownBadge: string;
    readonly paymentUnknownSubtitle: string;
    readonly paymentFailedTitle: string;
    readonly paymentFailedBadge: string;
    readonly paymentFailedSubtitle: string;
    readonly paidTitle: string;
    readonly paidBadge: string;
    readonly paidSubtitle: string;
    readonly provisioningTitle: string;
    readonly provisioningBadge: string;
    readonly provisioningSubtitle: string;
    readonly provisioningUnknownTitle: string;
    readonly provisioningUnknownBadge: string;
    readonly provisioningFailedTitle: string;
    readonly provisioningFailedBadge: string;
    readonly provisioningFailedTerminalTitle: string;
    readonly provisioningFailedTerminalBadge: string;
    readonly readyTitle: string;
    readonly readyBadge: string;
    readonly readySubtitle: string;
    readonly deniedTitle: string;
    readonly deniedSubtitle: string;
    readonly deniedNotice: string;
    readonly deniedText: string;
    readonly purchaseFactsLabel: string;
    readonly verificationLabel: string;
    readonly provisioningOrderLabel: string;
    readonly confirmedFactsLabel: string;
    readonly latestCheck: string;
    readonly offer: string;
    readonly offerPlan: string;
    readonly purchaseRef: string;
    readonly paymentAttempt: string;
    readonly paymentStatusLabel: string;
    readonly amountLabel: string;
    readonly invoiceDue: string;
    readonly invoicePaidAt: string;
    readonly workspaceLabel: string;
    readonly workspacePending: string;
    readonly purchaseRow: string;
    readonly invoiceRow: string;
    readonly paidAmount: string;
    readonly currentOperation: string;
    readonly operationAdmit: string;
    readonly purchaseLabel: string;
    readonly timelineRead: string;
    readonly timelineReadDetail: string;
    readonly detailPaymentSettled: string;
    readonly startedLabel: string;
    readonly lastObservation: string;
    readonly reconcileNote: string;
    readonly checkProvider: string;
    readonly checkAmount: string;
    readonly checkCanonical: string;
    readonly checkAdmission: string;
    readonly checkPaymentVerified: string;
    readonly checkEntitlement: string;
    readonly checkConfigure: string;
    readonly checkReadiness: string;
    readonly detailAwaiting: string;
    readonly detailEvaluated: string;
    readonly detailNotEvaluated: string;
    readonly detailWithheld: string;
    readonly detailConfirmed: string;
    readonly detailRefused: string;
    readonly detailSourceRefused: string;
    readonly detailLocked: string;
    readonly detailAdmitted: string;
    readonly detailWaitingAdmission: string;
    readonly detailWaitingConfiguration: string;
    readonly detailWaitingReadiness: string;
    readonly detailOrderRecorded: string;
    readonly lockedNotice: string;
    readonly outcomeLabel: string;
    readonly outcomeEntryWithheld: string;
    readonly outcomeEntryReady: string;
    readonly outcomeEntryDenied: string;
    readonly outcomeProvisioningRetryable: string;
    readonly outcomeProvisioningTerminal: string;
    readonly checkPaymentAction: string;
    readonly reconcilePaymentAction: string;
    readonly refreshStatusAction: string;
    readonly reconcileOrderAction: string;
    readonly retryProvisionAction: string;
    readonly retryProvisionCaption: string;
    readonly viewProvisioningAction: string;
    readonly enterWorkspaceAction: string;
    readonly returnToList: string;
    readonly backToWorkspaces: string;
    readonly changeOffer: string;
    readonly realtimeReconnect: string;
    readonly stateDone: string;
    readonly stateRunning: string;
    readonly stateQueued: string;
    readonly stateFailed: string;
    readonly stateUnknown: string;
    /** Recheck caption naming the exact attempt identity the action reconciles. */
    readonly rechecksOnly: (attempt: string) => string;
    /** The provisioning heading naming the offer being prepared. */
    readonly preparingOffer: (offer: string) => string;
    /** Timeline sentences reporting each source's own verbatim status. */
    readonly orderReports: (status: string) => string;
    readonly invoiceReports: (status: string) => string;
    /** The fact-strip sentence naming the settled amount. */
    readonly paidSentence: (amount: string) => string;
    /** "Started {at} · {n} elapsed" for the running operation. */
    readonly startedSentence: (at: string, elapsed: string) => string;
    /** "Last observation: {detail} at {at}" for the running operation. */
    readonly lastObservationSentence: (detail: string, at: string) => string;
    /** Lifecycle label for one workspace provisioning operation status. */
    readonly operationStatus: (status: string) => string;
};
