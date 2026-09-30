/**
 * The parsers of the eight Sales operation payloads.
 *
 * One parser per served value the registered operations answer, beside the wire types they name.
 * Each returns the freshly built value or null; `narrowSalesAnswer` turns null into the existing
 * `MALFORMED_ANSWER` failure, so a malformed served value is never a thrown error and never a
 * domain value under a borrowed name.
 */

import { isNumber, isNullableString, isRecord, isString, isStringArray } from "@nivo/api"
import type {
    SalesActionValue,
    SalesCommandValue,
    SalesDecisionValue,
    SalesHandoffValue,
    SalesOpportunityValue,
    SalesPipelineItem,
    SalesPipelineValue,
    SalesPolicyValue,
    SalesReadinessValue,
} from "./types"

/** Parse one Sales policy operation payload. */
export const parseSalesPolicyValue = (value: unknown): SalesPolicyValue | null => {
    if (
        !isRecord(value) ||
        !isString(value.salesInstallationId) ||
        !isNumber(value.revision) ||
        !isNullableString(value.requestId) ||
        !isRecord(value.values) ||
        !isStringArray(value.unsetItems) ||
        !isNullableString(value.configuredBy) ||
        !isNullableString(value.recordedAt)
    ) {
        return null
    }
    return {
        salesInstallationId: value.salesInstallationId,
        revision: value.revision,
        requestId: value.requestId,
        values: value.values,
        unsetItems: value.unsetItems,
        configuredBy: value.configuredBy,
        recordedAt: value.recordedAt,
    }
}

/** Parse one Sales readiness operation payload. */
export const parseSalesReadinessValue = (value: unknown): SalesReadinessValue | null => {
    if (
        !isRecord(value) ||
        !isString(value.salesInstallationId) ||
        !isString(value.lifecycleIntentId) ||
        !isString(value.configurationRevision) ||
        !isNumber(value.setupAuthorityGeneration) ||
        !isNullableString(value.runtimeGeneration) ||
        !isString(value.sourceRevision) ||
        !isString(value.observedAt) ||
        typeof value.ready !== "boolean" ||
        !isNumber(value.revision)
    ) {
        return null
    }
    return {
        salesInstallationId: value.salesInstallationId,
        lifecycleIntentId: value.lifecycleIntentId,
        configurationRevision: value.configurationRevision,
        setupAuthorityGeneration: value.setupAuthorityGeneration,
        runtimeGeneration: value.runtimeGeneration,
        sourceRevision: value.sourceRevision,
        observedAt: value.observedAt,
        ready: value.ready,
        revision: value.revision,
    }
}

/** Parse one Sales opportunity operation payload. */
export const parseSalesOpportunityValue = (value: unknown): SalesOpportunityValue | null => {
    if (
        !isRecord(value) ||
        !isString(value.opportunityId) ||
        !isString(value.customerRef) ||
        !isString(value.purpose) ||
        !isString(value.status) ||
        !isString(value.workState) ||
        !isNullableString(value.reason) ||
        !isStringArray(value.evidenceRefs) ||
        !isNumber(value.revision) ||
        !isNullableString(value.closedAt)
    ) {
        return null
    }
    return {
        opportunityId: value.opportunityId,
        customerRef: value.customerRef,
        purpose: value.purpose,
        status: value.status,
        workState: value.workState,
        reason: value.reason,
        evidenceRefs: value.evidenceRefs,
        revision: value.revision,
        closedAt: value.closedAt,
    }
}

const parseSalesPipelineItem = (value: unknown): SalesPipelineItem | null => {
    if (
        !isRecord(value) ||
        !isString(value.opportunityId) ||
        !isString(value.customerRef) ||
        !isString(value.purpose) ||
        !isString(value.status) ||
        !isString(value.workState) ||
        !isNumber(value.revision)
    ) {
        return null
    }
    return {
        opportunityId: value.opportunityId,
        customerRef: value.customerRef,
        purpose: value.purpose,
        status: value.status,
        workState: value.workState,
        revision: value.revision,
    }
}

/** Parse one Sales pipeline operation payload. */
export const parseSalesPipelineValue = (value: unknown): SalesPipelineValue | null => {
    if (!isRecord(value) || !isString(value.observedAt) || !isString(value.scopeFingerprint)) return null
    if (!Array.isArray(value.items)) return null
    const rawItems: ReadonlyArray<unknown> = value.items
    const items: Array<SalesPipelineItem> = []
    for (const item of rawItems) {
        const parsed = parseSalesPipelineItem(item)
        if (parsed === null) return null
        items.push(parsed)
    }
    const nextAfter = value.nextAfter
    let parsedNextAfter: SalesPipelineValue["nextAfter"]
    if (nextAfter === null) {
        parsedNextAfter = null
    } else {
        if (!isRecord(nextAfter)) return null
        const lastOpportunityId = nextAfter.lastOpportunityId
        if (lastOpportunityId !== null && !isString(lastOpportunityId)) return null
        parsedNextAfter = { lastOpportunityId }
    }
    if (typeof value.livePagination !== "boolean") return null
    return {
        observedAt: value.observedAt,
        scopeFingerprint: value.scopeFingerprint,
        items,
        nextAfter: parsedNextAfter,
        livePagination: value.livePagination,
    }
}

/** Parse one Sales command operation payload. */
export const parseSalesCommandValue = (value: unknown): SalesCommandValue | null => {
    if (
        !isRecord(value) ||
        !isString(value.commandId) ||
        !isNumber(value.commandRevision) ||
        !isString(value.status) ||
        !(value.clarification === null || isRecord(value.clarification)) ||
        !isStringArray(value.actionIds) ||
        !isNumber(value.revision)
    ) {
        return null
    }
    return {
        commandId: value.commandId,
        commandRevision: value.commandRevision,
        status: value.status,
        clarification: value.clarification,
        actionIds: value.actionIds,
        revision: value.revision,
    }
}

/** Parse one Sales decision operation payload. */
export const parseSalesDecisionValue = (value: unknown): SalesDecisionValue | null => {
    if (
        !isRecord(value) ||
        !isString(value.decisionRequestId) ||
        !isString(value.opportunityId) ||
        !isNumber(value.proposalVersion) ||
        !isString(value.proposalFingerprint) ||
        !isString(value.status) ||
        !isNumber(value.revision)
    ) {
        return null
    }
    return {
        decisionRequestId: value.decisionRequestId,
        opportunityId: value.opportunityId,
        proposalVersion: value.proposalVersion,
        proposalFingerprint: value.proposalFingerprint,
        status: value.status,
        revision: value.revision,
    }
}

/** Parse one Sales action operation payload. */
export const parseSalesActionValue = (value: unknown): SalesActionValue | null => {
    if (
        !isRecord(value) ||
        !isString(value.actionId) ||
        !isNumber(value.attemptGeneration) ||
        !isString(value.status) ||
        !(value.receiverReceipt === null || isRecord(value.receiverReceipt)) ||
        typeof value.observationGap !== "boolean" ||
        !isNumber(value.revision)
    ) {
        return null
    }
    return {
        actionId: value.actionId,
        attemptGeneration: value.attemptGeneration,
        status: value.status,
        receiverReceipt: value.receiverReceipt,
        observationGap: value.observationGap,
        revision: value.revision,
    }
}

/** Parse one Sales handoff operation payload. */
export const parseSalesHandoffValue = (value: unknown): SalesHandoffValue | null => {
    if (
        !isRecord(value) ||
        !isString(value.handoffId) ||
        !isString(value.status) ||
        !isNumber(value.orderRevision) ||
        !isNullableString(value.actionId) ||
        !isNumber(value.revision)
    ) {
        return null
    }
    return {
        handoffId: value.handoffId,
        status: value.status,
        orderRevision: value.orderRevision,
        actionId: value.actionId,
        revision: value.revision,
    }
}
