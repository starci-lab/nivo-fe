import { describe, expect, it } from "vitest"

import {
    parseSalesActionValue,
    parseSalesCommandValue,
    parseSalesDecisionValue,
    parseSalesHandoffValue,
    parseSalesOpportunityValue,
    parseSalesPipelineValue,
    parseSalesPolicyValue,
    parseSalesReadinessValue,
} from "./payload.guards"

describe("parseSalesPolicyValue", () => {
    it("refuses a payload whose revision is not a number", () => {
        const value = {
            salesInstallationId: "s",
            revision: 1,
            requestId: null,
            values: {},
            unsetItems: [],
            configuredBy: null,
            recordedAt: null,
        }
        expect(parseSalesPolicyValue(value)).not.toBeNull()
        expect(parseSalesPolicyValue({ ...value, revision: "1" })).toBeNull()
        expect(parseSalesPolicyValue({ ...value, values: [] })).toBeNull()
    })
})

describe("parseSalesReadinessValue", () => {
    it("refuses a payload whose ready flag is not boolean", () => {
        const value = {
            salesInstallationId: "s",
            lifecycleIntentId: "l",
            configurationRevision: "r",
            setupAuthorityGeneration: 1,
            runtimeGeneration: null,
            sourceRevision: "r",
            observedAt: "t",
            ready: true,
            revision: 1,
        }
        expect(parseSalesReadinessValue(value)).not.toBeNull()
        expect(parseSalesReadinessValue({ ...value, ready: "yes" })).toBeNull()
    })
})

describe("parseSalesOpportunityValue", () => {
    it("refuses a payload missing the opportunity identity", () => {
        const value = {
            opportunityId: "o",
            customerRef: "c",
            purpose: "p",
            status: "open",
            workState: "active",
            reason: null,
            evidenceRefs: [],
            revision: 1,
            closedAt: null,
        }
        expect(parseSalesOpportunityValue(value)).not.toBeNull()
        expect(parseSalesOpportunityValue({ ...value, opportunityId: 7 })).toBeNull()
    })
})

describe("parseSalesPipelineValue", () => {
    it("refuses a page whose items hold a malformed row or a malformed cursor", () => {
        const item = {
            opportunityId: "o",
            customerRef: "c",
            purpose: "p",
            status: "open",
            workState: "active",
            revision: 1,
        }
        const value = { observedAt: "t", scopeFingerprint: "f", items: [item], nextAfter: null, livePagination: false }
        expect(parseSalesPipelineValue(value)).not.toBeNull()
        expect(parseSalesPipelineValue({ ...value, items: [{ ...item, revision: "x" }] })).toBeNull()
        expect(parseSalesPipelineValue({ ...value, nextAfter: { lastOpportunityId: 5 } })).toBeNull()
    })
})

describe("parseSalesCommandValue", () => {
    it("refuses a payload whose clarification is a malformed non-null value", () => {
        const value = {
            commandId: "c",
            commandRevision: 1,
            status: "s",
            clarification: null,
            actionIds: [],
            revision: 1,
        }
        expect(parseSalesCommandValue(value)).not.toBeNull()
        expect(parseSalesCommandValue({ ...value, clarification: "?" })).toBeNull()
    })
})

describe("parseSalesDecisionValue", () => {
    it("refuses a payload missing the proposal fingerprint", () => {
        const value = {
            decisionRequestId: "d",
            opportunityId: "o",
            proposalVersion: 1,
            proposalFingerprint: "f",
            status: "s",
            revision: 1,
        }
        expect(parseSalesDecisionValue(value)).not.toBeNull()
        expect(parseSalesDecisionValue({ ...value, proposalFingerprint: null })).toBeNull()
    })
})

describe("parseSalesActionValue", () => {
    it("refuses a payload whose observation-gap flag is not boolean", () => {
        const value = {
            actionId: "a",
            attemptGeneration: 1,
            status: "s",
            receiverReceipt: null,
            observationGap: false,
            revision: 1,
        }
        expect(parseSalesActionValue(value)).not.toBeNull()
        expect(parseSalesActionValue({ ...value, observationGap: "none" })).toBeNull()
    })
})

describe("parseSalesHandoffValue", () => {
    it("refuses a payload missing the order revision", () => {
        const value = { handoffId: "h", status: "s", orderRevision: 1, actionId: null, revision: 1 }
        expect(parseSalesHandoffValue(value)).not.toBeNull()
        expect(parseSalesHandoffValue({ ...value, orderRevision: "1" })).toBeNull()
    })
})
