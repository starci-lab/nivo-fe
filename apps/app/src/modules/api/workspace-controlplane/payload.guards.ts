/**
 * The parsers of the workspace-controlplane documents' payloads.
 *
 * One parser per shape the chatbot, checkout and purchase-saga operations select. Each returns the
 * freshly built value or null; the caller maps null to its `unavailable`/`FAILED` outcome, so a
 * malformed payload is never a thrown error and never a domain value under a borrowed name.
 *
 * THE OUTCOME UNIONS ARE CLOSED: `WorkspaceCheckoutAnswer` and
 * `WorkspaceCheckoutEntryOutcome` discriminate on `status`, and each arm checks only the fields it
 * declares. An arm that fails to parse is null, never a best-effort reading.
 */

import { isBoolean, isNullableNumber, isNullableString, isNumber, isOneOf, isRecord, isString, parseEach } from "@nivo/api"
import type {
    ChatbotActionPayload,
    ChatbotChannelPayload,
    ChatbotConversationPayload,
    ChatbotMessagePayload,
    ChatbotWorkbenchQuery,
} from "../__generated__/agentos-controlplane"
import type {
    WorkspaceCheckoutAnswer,
    WorkspaceCheckoutEntryOutcome,
} from "./checkout-types"
import type {
    WorkspaceBillingEntryType,
    WorkspaceEntryDestinationType,
    WorkspaceOfferSelectionType,
    WorkspaceOfferType,
    WorkspacePaymentActionType,
    WorkspaceProvisioningFactType,
    WorkspacePurchaseLedgerFactType,
    WorkspacePurchaseStatusType,
    WorkspaceReadinessFactType,
    WorkspaceRefundStatusFactType,
    WorkspaceServiceEligibilityFactType,
    WorkspaceSourceFactType,
} from "../__generated__/core"

const parseChatbotChannelBinding = (value: unknown): ChatbotChannelPayload | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.installationId) &&
    isString(value.provider) &&
    isString(value.accountRef) &&
    isString(value.state) &&
    isNullableString(value.credentialRef)
        ? {
              id: value.id,
              installationId: value.installationId,
              provider: value.provider,
              accountRef: value.accountRef,
              state: value.state,
              credentialRef: value.credentialRef,
          }
        : null

const parseChatbotConversation = (value: unknown): ChatbotConversationPayload | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.installationId) &&
    isString(value.participantRef) &&
    isString(value.handoffState) &&
    isNumber(value.authorityEpoch) &&
    isNullableNumber(value.approvedVersion) &&
    isString(value.lastMessageAt)
        ? {
              id: value.id,
              installationId: value.installationId,
              participantRef: value.participantRef,
              handoffState: value.handoffState,
              authorityEpoch: value.authorityEpoch,
              approvedVersion: value.approvedVersion,
              lastMessageAt: value.lastMessageAt,
          }
        : null

const parseChatbotMessage = (value: unknown): ChatbotMessagePayload | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.conversationId) &&
    isString(value.direction) &&
    isString(value.sequence) &&
    isString(value.body) &&
    isString(value.deliveryState) &&
    isNullableString(value.providerOutboxId) &&
    isNullableString(value.failureCode) &&
    isString(value.occurredAt)
        ? {
              id: value.id,
              conversationId: value.conversationId,
              direction: value.direction,
              sequence: value.sequence,
              body: value.body,
              deliveryState: value.deliveryState,
              providerOutboxId: value.providerOutboxId,
              failureCode: value.failureCode,
              occurredAt: value.occurredAt,
          }
        : null

const parseChatbotWorkbench = (value: unknown): ChatbotWorkbenchQuery["chatbotWorkbench"] | null => {
    if (!isRecord(value) || !isString(value.installationId) || !isString(value.lifecycleState)) return null
    if (!isNullableNumber(value.approvedVersion)) return null
    const channels = parseEach(value.channels, parseChatbotChannelBinding)
    const conversations = parseEach(value.conversations, parseChatbotConversation)
    const messages = parseEach(value.messages, parseChatbotMessage)
    if (channels === null || conversations === null || messages === null) return null
    return {
        installationId: value.installationId,
        lifecycleState: value.lifecycleState,
        approvedVersion: value.approvedVersion,
        channels,
        conversations,
        messages,
    }
}

/** Parse the `chatbotWorkbench` result from the control-plane schema. */
export const parseChatbotWorkbenchAnswer = (input: unknown): ChatbotWorkbenchQuery["chatbotWorkbench"] | null =>
    parseChatbotWorkbench(input)

/** Parse one command result from the control-plane schema. */
export const parseChatbotCommandResult = (input: unknown): ChatbotActionPayload | null => {
    if (
        !isRecord(input) ||
        !isString(input.id) ||
        !isString(input.installationId) ||
        !isString(input.state) ||
        !isNullableString(input.authorizationUrl)
    ) {
        return null
    }
    return {
        id: input.id,
        installationId: input.installationId,
        state: input.state,
        authorizationUrl: input.authorizationUrl,
    }
}

const CHECKOUT_STATES = [
    "selected",
    "payment-not-started",
    "payment-pending",
    "payment-outcome-unknown",
    "payment-refused",
    "payment-failed",
    "paid",
    "provisioning",
    "provisioning-refused",
    "ready",
    "renewed",
    "payment-cancelled",
] as const

const parseCheckoutOffer = (value: unknown): WorkspaceOfferType | null =>
    isRecord(value) &&
    isString(value.offerId) &&
    isString(value.offerVersion) &&
    isString(value.displayName) &&
    isString(value.includedOutcome) &&
    isString(value.amount) &&
    isString(value.currency) &&
    isString(value.billingCadence) &&
    isString(value.renewalMode) &&
    isString(value.eligibility)
        ? {
              offerId: value.offerId,
              offerVersion: value.offerVersion,
              displayName: value.displayName,
              includedOutcome: value.includedOutcome,
              amount: value.amount,
              currency: value.currency,
              billingCadence: value.billingCadence,
              renewalMode: value.renewalMode,
              eligibility: value.eligibility,
          }
        : null

const parseCheckoutSelection = (value: unknown): WorkspaceOfferSelectionType | null =>
    isRecord(value) &&
    isString(value.offerId) &&
    isString(value.offerVersion) &&
    isOneOf(value.state, ["current", "stale", "unavailable"])
        ? { offerId: value.offerId, offerVersion: value.offerVersion, state: value.state }
        : null

const parseSourceFact = (value: unknown): WorkspaceSourceFactType | null =>
    isRecord(value) &&
    isString(value.source) &&
    isString(value.state) &&
    isNullableString(value.reference) &&
    isNullableString(value.observedAt)
        ? {
              source: value.source,
              state: value.state,
              reference: value.reference,
              observedAt: value.observedAt,
          }
        : null

const parseProvisioningFact = (value: unknown): WorkspaceProvisioningFactType | null => {
    if (!isRecord(value) || !isNullableString(value.disposition) || !isNullableString(value.reason)) return null
    const fact = parseSourceFact(value)
    return fact === null
        ? null
        : {
              source: fact.source,
              state: fact.state,
              reference: fact.reference,
              observedAt: fact.observedAt,
              disposition: value.disposition,
              reason: value.reason,
          }
}

const parseRenewalAction = (
    value: unknown,
): NonNullable<WorkspaceServiceEligibilityFactType["renewalAction"]> | null =>
    isRecord(value) &&
    isString(value.operation) &&
    isString(value.offerId) &&
    isString(value.offerVersion) &&
    isString(value.amount) &&
    isString(value.currency)
        ? {
              operation: value.operation,
              offerId: value.offerId,
              offerVersion: value.offerVersion,
              amount: value.amount,
              currency: value.currency,
          }
        : null

const parseEligibilityFact = (value: unknown): WorkspaceServiceEligibilityFactType | null => {
    if (
        !isRecord(value) ||
        !isNullableString(value.reason) ||
        !isNullableString(value.heldSince) ||
        !isNullableString(value.paidThrough) ||
        !isString(value.renewalEvidence)
    ) {
        return null
    }
    const fact = parseSourceFact(value)
    if (fact === null) return null
    const renewalAction =
        value.renewalAction === null || value.renewalAction === undefined
            ? null
            : parseRenewalAction(value.renewalAction)
    if (value.renewalAction !== null && value.renewalAction !== undefined && renewalAction === null) return null
    return {
        source: fact.source,
        state: fact.state,
        reference: fact.reference,
        observedAt: fact.observedAt,
        reason: value.reason,
        heldSince: value.heldSince,
        paidThrough: value.paidThrough,
        renewalAction,
        renewalEvidence: value.renewalEvidence,
    }
}

const parseBillingEntry = (value: unknown): WorkspaceBillingEntryType | null =>
    isRecord(value) &&
    isString(value.entryId) &&
    isString(value.purchaseId) &&
    isString(value.billingReceiptId) &&
    isString(value.kind) &&
    isString(value.amount) &&
    isString(value.currency) &&
    isNullableString(value.linkedEntryId) &&
    isNullableString(value.observationId) &&
    isNullableString(value.actorPrincipal) &&
    isNullableString(value.reason) &&
    isNullableString(value.paymentRail) &&
    isNullableString(value.providerTransactionRef) &&
    isString(value.accountingCopyState) &&
    isString(value.postedAt)
        ? {
              entryId: value.entryId,
              purchaseId: value.purchaseId,
              billingReceiptId: value.billingReceiptId,
              kind: value.kind,
              amount: value.amount,
              currency: value.currency,
              linkedEntryId: value.linkedEntryId,
              observationId: value.observationId,
              actorPrincipal: value.actorPrincipal,
              reason: value.reason,
              paymentRail: value.paymentRail,
              providerTransactionRef: value.providerTransactionRef,
              accountingCopyState: value.accountingCopyState,
              postedAt: value.postedAt,
          }
        : null

const parseLedgerFact = (value: unknown): WorkspacePurchaseLedgerFactType | null => {
    if (
        !isRecord(value) ||
        !isString(value.source) ||
        !isString(value.state) ||
        !isNullableString(value.ledgerState) ||
        !isNullableString(value.observedAt)
    ) {
        return null
    }
    const entries = parseEach(value.entries, parseBillingEntry)
    if (entries === null) return null
    return {
        source: value.source,
        state: value.state,
        ledgerState: value.ledgerState,
        entries,
        observedAt: value.observedAt,
    }
}

const parseRefundFact = (value: unknown): WorkspaceRefundStatusFactType | null => {
    if (!isRecord(value) || !isString(value.projection) || !isNullableString(value.refundEntryId)) return null
    const fact = parseSourceFact(value)
    return fact === null
        ? null
        : {
              source: fact.source,
              state: fact.state,
              reference: fact.reference,
              observedAt: fact.observedAt,
              projection: value.projection,
              refundEntryId: value.refundEntryId,
          }
}

const parseReadinessFact = (value: unknown): WorkspaceReadinessFactType | null =>
    isRecord(value) &&
    isString(value.source) &&
    isString(value.state) &&
    isNullableString(value.reference) &&
    isNullableString(value.observedAt) &&
    isNullableString(value.observationId)
        ? {
              source: value.source,
              state: value.state,
              reference: value.reference,
              observedAt: value.observedAt,
              observationId: value.observationId,
          }
        : null

const parseStatusView = (value: unknown): WorkspacePurchaseStatusType | null => {
    if (!isRecord(value) || !isString(value.purchaseId) || !isOneOf(value.state, CHECKOUT_STATES)) return null
    const offer = parseCheckoutOffer(value.offer)
    const payment = parseSourceFact(value.payment)
    const billing = parseSourceFact(value.billing)
    const provisioning = parseProvisioningFact(value.provisioning)
    const readiness = parseReadinessFact(value.readiness)
    if (offer === null || payment === null || billing === null || provisioning === null || readiness === null) {
        return null
    }
    const serviceEligibility = value.serviceEligibility === null ? null : parseEligibilityFact(value.serviceEligibility)
    const ledger = value.ledger === null ? null : parseLedgerFact(value.ledger)
    const refund = value.refund === null ? null : parseRefundFact(value.refund)
    const refundStatus = value.refundStatus === null ? null : parseSourceFact(value.refundStatus)
    if (
        (value.serviceEligibility !== null && serviceEligibility === null) ||
        (value.ledger !== null && ledger === null) ||
        (value.refund !== null && refund === null) ||
        (value.refundStatus !== null && refundStatus === null) ||
        !isString(value.lastConfirmedAt)
    ) {
        return null
    }
    return {
        purchaseId: value.purchaseId,
        state: value.state,
        offer,
        payment,
        billing,
        provisioning,
        readiness,
        serviceEligibility,
        ledger,
        refund,
        refundStatus,
        lastConfirmedAt: value.lastConfirmedAt,
    }
}

const parsePaymentAction = (value: unknown): WorkspacePaymentActionType | null =>
    isRecord(value) &&
    isString(value.paymentAttemptId) &&
    isString(value.provider) &&
    isString(value.kind) &&
    isRecord(value.payload)
        ? {
              paymentAttemptId: value.paymentAttemptId,
              provider: value.provider,
              kind: value.kind,
              payload: value.payload,
          }
        : null

const CHECKOUT_REFUSAL_CODES = [
    "unauthenticated",
    "purchaser-not-admitted",
    "offer-unavailable",
    "offer-version-stale",
    "retry-identity-conflict",
    "purchase-not-found-non-disclosing",
    "source-unavailable",
    "outcome-unknown",
    "request-invalid",
    "payment-refused",
    "payment-failed",
    "observed-identity-mismatch",
] as const

type CheckoutRefused = Extract<WorkspaceCheckoutAnswer, { readonly status: "refused" }>

const parseCheckoutRefused = (value: Record<string, unknown>): CheckoutRefused | null => {
    if (!isOneOf(value.code, CHECKOUT_REFUSAL_CODES)) return null
    const answer: {
        status: "refused"
        code: CheckoutRefused["code"]
        nextAction?: "login-sign-in" | "login-register" | "login-verify-email"
        purchaseId?: string
        offers?: ReadonlyArray<WorkspaceOfferType>
        purchase?: WorkspacePurchaseStatusType
    } = { status: "refused", code: value.code }
    if (value.nextAction !== null) {
        if (!isOneOf(value.nextAction, ["login-sign-in", "login-register", "login-verify-email"])) return null
        answer.nextAction = value.nextAction
    }
    if (value.purchaseId !== null) {
        if (!isString(value.purchaseId)) return null
        answer.purchaseId = value.purchaseId
    }
    if (value.offers !== null) {
        const offers = parseEach(value.offers, parseCheckoutOffer)
        if (offers === null) return null
        answer.offers = offers
    }
    if (value.purchase !== null) {
        const purchase = parseStatusView(value.purchase)
        if (purchase === null) return null
        answer.purchase = purchase
    }
    return answer
}

/** Parse the `data` of the workspace-checkout documents: the whole closed outcome union. */
export const parseWorkspaceCheckoutAnswer = (input: unknown): WorkspaceCheckoutAnswer | null => {
    if (!isRecord(input) || !isString(input.status)) return null
    switch (input.status) {
        case "offers": {
            const offers = parseEach(input.offers, parseCheckoutOffer)
            const selection = parseCheckoutSelection(input.selection)
            if (offers === null || selection === null) return null
            return { status: "offers", offers, selection }
        }
        case "prepared": {
            if (!isNullableString(input.purchaseId)) return null
            const purchase = parseStatusView(input.purchase)
            if (purchase === null) return null
            const paymentAction = input.paymentAction === null ? null : parsePaymentAction(input.paymentAction)
            if (input.paymentAction !== null && paymentAction === null) return null
            return { status: "prepared", purchaseId: input.purchaseId, purchase, paymentAction }
        }
        case "status": {
            if (!isNullableString(input.purchaseId)) return null
            const purchase = parseStatusView(input.purchase)
            return purchase === null ? null : { status: "status", purchaseId: input.purchaseId, purchase }
        }
        case "refused":
            return parseCheckoutRefused(input)
        case "unavailable": {
            if (input.code !== "source-unavailable" || !isString(input.source)) return null
            const purchaseId = input.purchaseId
            if (purchaseId !== null && !isString(purchaseId)) return null
            return purchaseId === null
                ? { status: "unavailable", code: "source-unavailable", source: input.source }
                : { status: "unavailable", code: "source-unavailable", source: input.source, purchaseId }
        }
        case "conflict": {
            if (!isOneOf(input.code, ["retry-identity-conflict", "observed-identity-mismatch"])) return null
            const purchaseId = input.purchaseId
            if (purchaseId !== null && !isString(purchaseId)) return null
            return purchaseId === null
                ? { status: "conflict", code: input.code }
                : { status: "conflict", code: input.code, purchaseId }
        }
        case "outcome-unknown": {
            if (input.code !== "outcome-unknown") return null
            const purchaseId = input.purchaseId
            if (purchaseId !== null && !isString(purchaseId)) return null
            return purchaseId === null
                ? { status: "outcome-unknown", code: "outcome-unknown" }
                : { status: "outcome-unknown", code: "outcome-unknown", purchaseId }
        }
        default:
            return null
    }
}

const parseEntryDestination = (value: unknown): WorkspaceEntryDestinationType | null =>
    isRecord(value) &&
    isString(value.workspaceId) &&
    isString(value.ownerId) &&
    isString(value.routeName) &&
    isString(value.routeVersion) &&
    isRecord(value.context)
        ? {
              workspaceId: value.workspaceId,
              ownerId: value.ownerId,
              routeName: value.routeName,
              routeVersion: value.routeVersion,
              context: value.context,
          }
        : null

const ENTRY_REFUSAL_CODES = [
    "unauthenticated",
    "purchaser-not-admitted",
    "purchase-not-found-non-disclosing",
    "request-invalid",
    "owner-mismatch",
    "workspace-not-found-non-disclosing",
    "workspace-not-ready",
    "readiness-observation-stale",
    "entry-unsupported",
] as const

const optionalPurchaseId = (value: Record<string, unknown>): { purchaseId?: string } | null => {
    if (value.purchaseId === null) return {}
    if (!isString(value.purchaseId)) return null
    return { purchaseId: value.purchaseId }
}

/** Parse the `data` of `workspacePurchaseEntry`: the whole closed entry-outcome union. */
export const parseWorkspaceCheckoutEntryOutcome = (input: unknown): WorkspaceCheckoutEntryOutcome | null => {
    if (!isRecord(input) || !isString(input.status)) return null
    switch (input.status) {
        case "entry": {
            if (!isNullableString(input.purchaseId) || !isString(input.workspaceId)) return null
            const destination = parseEntryDestination(input.destination)
            return destination === null
                ? null
                : { status: "entry", purchaseId: input.purchaseId, workspaceId: input.workspaceId, destination }
        }
        case "not-ready": {
            if (!isNullableString(input.purchaseId)) return null
            const purchase = parseStatusView(input.purchase)
            return purchase === null
                ? null
                : { status: "not-ready", purchaseId: input.purchaseId, purchase }
        }
        case "refused": {
            if (!isOneOf(input.code, ENTRY_REFUSAL_CODES)) return null
            const purchaseId = optionalPurchaseId(input)
            return purchaseId === null ? null : { status: "refused", code: input.code, ...purchaseId }
        }
        case "unavailable": {
            if (!isOneOf(input.code, ["source-unavailable", "entry-owner-unavailable"]) || !isString(input.source)) {
                return null
            }
            const purchaseId = optionalPurchaseId(input)
            return purchaseId === null
                ? null
                : { status: "unavailable", code: input.code, source: input.source, ...purchaseId }
        }
        case "conflict": {
            if (input.code !== "observed-identity-mismatch") return null
            const purchaseId = optionalPurchaseId(input)
            return purchaseId === null
                ? null
                : { status: "conflict", code: "observed-identity-mismatch", ...purchaseId }
        }
        default:
            return null
    }
}
