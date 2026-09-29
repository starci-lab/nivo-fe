import { describe, expect, it } from "vitest"

import {
    parseChatbotCommandResult,
    parseChatbotWorkbenchAnswer,
    parseProvisioningSaga,
    parseProvisioningSagaView,
    parseWorkspaceCheckoutAnswer,
    parseWorkspaceCheckoutEntryOutcome,
} from "./payload.guards"

const offer = {
    offerId: "o-1",
    offerVersion: "1",
    displayName: "Plan",
    includedOutcome: "x",
    amount: "1000",
    currency: "VND",
    billingCadence: "monthly",
    renewalMode: "auto",
    eligibility: "eligible",
}

const sourceFact = { source: "s", state: "ok", reference: null, observedAt: null }

const statusView = {
    purchaseId: "p-1",
    state: "paid",
    offer,
    payment: sourceFact,
    billing: sourceFact,
    provisioning: { ...sourceFact, disposition: null, reason: null },
    readiness: sourceFact,
    lastConfirmedAt: "t",
}

const sagaRow = {
    id: "s-1",
    jobId: "j-1",
    definitionKey: "prov",
    definitionVersion: 1,
    resourceKind: "workspace",
    resourceId: "w-1",
    ownerId: "o-1",
    status: "running_forward",
    direction: "forward",
    forwardCursor: 0,
    compensationCursor: null,
    sequence: 1,
    failureCode: null,
    failureReason: null,
    finishedAt: null,
    createdAt: "t",
    updatedAt: "t",
}

describe("parseChatbotWorkbenchAnswer", () => {
    it("refuses an answer whose workbench is malformed", () => {
        const workbench = {
            installationId: "i-1",
            lifecycleState: "ready",
            approvedVersion: null,
            channels: [],
            conversations: [],
            messages: [],
        }
        expect(parseChatbotWorkbenchAnswer({ chatbotWorkbench: workbench })).not.toBeNull()
        expect(parseChatbotWorkbenchAnswer({})).toBeNull()
        expect(parseChatbotWorkbenchAnswer({ chatbotWorkbench: { ...workbench, conversations: [{}] } })).toBeNull()
    })
})

describe("parseChatbotCommandResult", () => {
    it("refuses a result missing its state and a malformed authorization URL", () => {
        expect(parseChatbotCommandResult({ id: "c", installationId: "i", state: "accepted" })).not.toBeNull()
        expect(
            parseChatbotCommandResult({ id: "c", installationId: "i", state: "accepted", authorizationUrl: null }),
        ).not.toBeNull()
        expect(parseChatbotCommandResult({ id: "c" })).toBeNull()
        expect(
            parseChatbotCommandResult({ id: "c", installationId: "i", state: "accepted", authorizationUrl: 7 }),
        ).toBeNull()
    })
})

describe("parseWorkspaceCheckoutAnswer", () => {
    it("refuses a status outside the union and a malformed arm payload", () => {
        expect(
            parseWorkspaceCheckoutAnswer({
                status: "offers",
                offers: [offer],
                selection: { offerId: "o-1", offerVersion: "1", state: "current" },
            }),
        ).not.toBeNull()
        expect(
            parseWorkspaceCheckoutAnswer({ status: "prepared", purchaseId: null, purchase: statusView, paymentAction: null }),
        ).not.toBeNull()
        expect(parseWorkspaceCheckoutAnswer({ status: "refused", code: "request-invalid" })).not.toBeNull()
        expect(
            parseWorkspaceCheckoutAnswer({ status: "unavailable", code: "source-unavailable", source: "catalog" }),
        ).not.toBeNull()
        expect(parseWorkspaceCheckoutAnswer({ status: "mystery" })).toBeNull()
        expect(parseWorkspaceCheckoutAnswer({ status: "refused", code: "not-a-code" })).toBeNull()
        expect(
            parseWorkspaceCheckoutAnswer({ status: "prepared", purchaseId: null, purchase: { purchaseId: "p" } }),
        ).toBeNull()
    })
})

describe("parseWorkspaceCheckoutEntryOutcome", () => {
    it("refuses a status outside the union and a malformed destination", () => {
        const destination = {
            workspaceId: "w-1",
            ownerId: "o-1",
            routeName: "home",
            routeVersion: "1",
            context: {},
        }
        expect(
            parseWorkspaceCheckoutEntryOutcome({ status: "entry", purchaseId: null, workspaceId: "w-1", destination }),
        ).not.toBeNull()
        expect(
            parseWorkspaceCheckoutEntryOutcome({ status: "not-ready", purchaseId: null, purchase: statusView }),
        ).not.toBeNull()
        expect(parseWorkspaceCheckoutEntryOutcome({ status: "refused", code: "owner-mismatch" })).not.toBeNull()
        expect(parseWorkspaceCheckoutEntryOutcome({ status: "refused", code: "offer-unavailable" })).toBeNull()
        expect(parseWorkspaceCheckoutEntryOutcome({ status: "entry", workspaceId: "w", destination: {} })).toBeNull()
        expect(parseWorkspaceCheckoutEntryOutcome({ status: "conflict", code: "retry-identity-conflict" })).toBeNull()
    })
})

describe("parseProvisioningSaga", () => {
    it("refuses a row whose status or direction the closed sets do not name", () => {
        expect(parseProvisioningSaga(sagaRow)).not.toBeNull()
        expect(parseProvisioningSaga({ ...sagaRow, status: "halfway" })).toBeNull()
        expect(parseProvisioningSaga({ ...sagaRow, direction: "sideways" })).toBeNull()
    })
})

describe("parseProvisioningSagaView", () => {
    it("refuses a view whose saga or step rows are malformed", () => {
        const step = {
            id: "st-1",
            stepKey: "dns",
            ordinal: 0,
            isCompensable: true,
            forwardStatus: "pending",
            compensationStatus: "skipped",
            lastError: null,
            createdAt: "t",
            updatedAt: "t",
        }
        expect(parseProvisioningSagaView({ saga: sagaRow, steps: [step] })).not.toBeNull()
        expect(parseProvisioningSagaView({ saga: null, steps: [] })).toBeNull()
        expect(parseProvisioningSagaView({ saga: sagaRow, steps: [{ ...step, forwardStatus: "meh" }] })).toBeNull()
    })
})
