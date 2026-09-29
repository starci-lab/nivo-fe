import { describe, expect, it } from "vitest"
import type {
    SalesActionValue,
    SalesCommandValue,
    SalesDecisionValue,
    SalesHandoffValue,
    SalesOpportunityValue,
    SalesPipelineValue,
    SalesPolicyValue,
    SalesReadinessValue,
} from "@/modules/api/sales"
import {
    parseSalesActionValue,
    parseSalesCommandValue,
    parseSalesDecisionValue,
    parseSalesHandoffValue,
    parseSalesOpportunityValue,
    parseSalesPipelineValue,
    parseSalesPolicyValue,
    parseSalesReadinessValue,
} from "./sales-workbench.guards"
import { salesWriterFence } from "./sales-workbench"

const POLICY = {
    salesInstallationId: "installation-1",
    revision: 2,
    requestId: null,
    values: {},
    unsetItems: ["routineCadence"],
    configuredBy: null,
    recordedAt: null,
} satisfies SalesPolicyValue

const READINESS = {
    salesInstallationId: "installation-1",
    lifecycleIntentId: "intent-1",
    configurationRevision: "3",
    setupAuthorityGeneration: 1,
    runtimeGeneration: null,
    sourceRevision: "revision-1",
    observedAt: "2026-09-30T00:00:00Z",
    ready: true,
    revision: 4,
} satisfies SalesReadinessValue

const OPPORTUNITY = {
    opportunityId: "opportunity-1",
    customerRef: "customer-1",
    purpose: "Confirm a date",
    status: "open",
    workState: "waiting",
    reason: null,
    evidenceRefs: [],
    revision: 3,
    closedAt: null,
} satisfies SalesOpportunityValue

const PIPELINE = {
    observedAt: "2026-09-30T00:00:00Z",
    scopeFingerprint: "workspace-1~instance-1~installation-1",
    items: [
        {
            opportunityId: "opportunity-1",
            customerRef: "customer-1",
            purpose: "Confirm a date",
            status: "open",
            workState: "waiting",
            revision: 3,
        },
    ],
    nextAfter: null,
    livePagination: true,
} satisfies SalesPipelineValue

const COMMAND = {
    commandId: "command-1",
    commandRevision: 2,
    status: "accepted",
    clarification: null,
    actionIds: ["action-1"],
    revision: 3,
} satisfies SalesCommandValue

const DECISION = {
    decisionRequestId: "decision-1",
    opportunityId: "opportunity-1",
    proposalVersion: 4,
    proposalFingerprint: "sha256:proposal",
    status: "pending",
    revision: 2,
} satisfies SalesDecisionValue

const ACTION = {
    actionId: "action-1",
    attemptGeneration: 1,
    status: "not-started",
    receiverReceipt: null,
    observationGap: false,
    revision: 2,
} satisfies SalesActionValue

const HANDOFF = {
    handoffId: "handoff-1",
    status: "prepared",
    orderRevision: 4,
    actionId: null,
    revision: 2,
} satisfies SalesHandoffValue

describe("Sales workbench operation payload parsers", () => {
    it("accepts and rejects policy payloads by their declared fields", () => {
        expect(parseSalesPolicyValue(POLICY)).toEqual(POLICY)
        expect(parseSalesPolicyValue({ ...POLICY, revision: "2" })).toBeNull()
    })

    it("accepts and rejects readiness payloads by their declared fields", () => {
        expect(parseSalesReadinessValue(READINESS)).toEqual(READINESS)
        expect(parseSalesReadinessValue({ ...READINESS, ready: "true" })).toBeNull()
    })

    it("accepts and rejects opportunity payloads by their declared fields", () => {
        expect(parseSalesOpportunityValue(OPPORTUNITY)).toEqual(OPPORTUNITY)
        expect(parseSalesOpportunityValue({ ...OPPORTUNITY, evidenceRefs: [1] })).toBeNull()
    })

    it("accepts and rejects pipeline payloads including every item", () => {
        expect(parseSalesPipelineValue(PIPELINE)).toEqual(PIPELINE)
        expect(
            parseSalesPipelineValue({
                ...PIPELINE,
                items: [{ ...PIPELINE.items[0], revision: "3" }],
            }),
        ).toBeNull()
    })

    it("accepts and rejects command payloads by their declared fields", () => {
        expect(parseSalesCommandValue(COMMAND)).toEqual(COMMAND)
        expect(parseSalesCommandValue({ ...COMMAND, actionIds: null })).toBeNull()
    })

    it("accepts and rejects decision payloads by their declared fields", () => {
        expect(parseSalesDecisionValue(DECISION)).toEqual(DECISION)
        expect(parseSalesDecisionValue({ ...DECISION, proposalVersion: "4" })).toBeNull()
    })

    it("accepts and rejects action payloads by their declared fields", () => {
        expect(parseSalesActionValue(ACTION)).toEqual(ACTION)
        expect(parseSalesActionValue({ ...ACTION, observationGap: 0 })).toBeNull()
    })

    it("accepts and rejects handoff payloads by their declared fields", () => {
        expect(parseSalesHandoffValue(HANDOFF)).toEqual(HANDOFF)
        expect(parseSalesHandoffValue({ ...HANDOFF, orderRevision: null })).toBeNull()
    })
})

describe("Sales writer fence projection", () => {
    it("returns only a complete fence from the action receipt", () => {
        const action = {
            ...ACTION,
            receiverReceipt: {
                writerFence: { claimTokenHash: "claim-1", fencedAt: "2026-09-30T00:00:00Z" },
            },
        } satisfies SalesActionValue
        expect(salesWriterFence(action)).toEqual({ claimTokenHash: "claim-1", fencedAt: "2026-09-30T00:00:00Z" })
        expect(
            salesWriterFence({
                ...action,
                receiverReceipt: { writerFence: { claimTokenHash: 1, fencedAt: "2026-09-30T00:00:00Z" } },
            }),
        ).toBeNull()
    })
})
