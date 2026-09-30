import { CORE_API_ORIGIN as CORE_ORIGIN } from "@/modules/config"
import {
    API_SPEC_INSTALLATION as INSTALLATION,
    API_SPEC_INSTANCE as INSTANCE,
    API_SPEC_INTENT as INTENT,
    API_SPEC_OPERATIONS_PATH as OPERATIONS_PATH,
    API_SPEC_TOKEN as TOKEN,
    API_SPEC_WORKSPACE as WORKSPACE,
    apiSpecScope,
    createApiFetchSpec,
} from "../spec-helpers"

const SCOPE = apiSpecScope()
const FINGERPRINT = "a".repeat(64)

const POLICY_REQUEST = { salesInstallationId: INSTALLATION, requestId: null }
const READINESS_REQUEST = { salesInstallationId: INSTALLATION }
const OPPORTUNITY_REQUEST = { opportunityId: "opportunity-1" }
const PIPELINE_REQUEST = { scopeFingerprint: FINGERPRINT, statusFilter: null, after: null, limit: 25 }
const COMMAND_REQUEST = { commandId: "command-1" }
const DECISION_REQUEST = { decisionRequestId: "decision-1" }
const ACTION_REQUEST = { actionId: "action-1" }
const HANDOFF_REQUEST = { handoffId: "handoff-1" }
const CONFIGURE_POLICY_REQUEST = {
    requestId: INTENT,
    salesInstallationId: INSTALLATION,
    expectedPolicyRevision: null,
    values: {
        routineCadence: null,
        responseTarget: null,
        contactPolicy: null,
        catalogueReference: null,
        capacityLimits: null,
    },
}
const SUBMIT_COMMAND_REQUEST = {
    commandId: "command-1",
    commandRevision: 1,
    scope: { customerRefs: ["customer-1"], opportunityIds: [], offerRefs: [] },
    requestedActions: ["qualify"] as const,
    fingerprint: FINGERPRINT,
    expectedOpportunityRevisions: { "opportunity-1": 2 },
}
const CLARIFY_COMMAND_REQUEST = {
    commandId: "command-1",
    clarificationRevision: 1,
    permittedFact: { opportunityId: "opportunity-1" },
}
const DECIDE_PROPOSAL_REQUEST = {
    decisionRequestId: "decision-1",
    proposalVersion: 1,
    proposalFingerprint: FINGERPRINT,
    answer: "approve" as const,
    expectedDecisionRevision: 1,
}
const CLOSE_REQUEST = {
    intentId: INTENT,
    opportunityId: "opportunity-1",
    outcome: "lost" as const,
    evidenceRefs: ["evidence-1"],
    confirmedOrder: null,
    expectedRevision: 2,
}
const PREPARE_HANDOFF_REQUEST = {
    handoffId: "handoff-1",
    opportunityId: "opportunity-1",
    orderRevision: 3,
    destinationAccountingInstallationId: "installation-2",
    consentRef: "consent-1",
    fingerprint: FINGERPRINT,
    expectedRevision: 4,
}
const SUBMIT_HANDOFF_REQUEST = {
    handoffId: "handoff-1",
    confirmedOrderRevision: 3,
    fingerprint: FINGERPRINT,
    expectedHandoffRevision: 1,
}
const RETRY_ACTION_REQUEST = {
    operation: "retryNoStart" as const,
    actionId: "action-1",
    attemptGeneration: 1,
    receiverIntentId: "receiver-intent-1",
    receiverAttemptId: "receiver-attempt-1",
    receiverNoStartProofRef: "proof-1",
    oldWriterFence: { claimTokenHash: FINGERPRINT, fencedAt: "2026-09-25T00:00:00.000Z" },
    fingerprint: FINGERPRINT,
    expectedRevision: 2,
}
const STOP_ACTION_REQUEST = {
    operation: "cancelNoStart" as const,
    actionId: "action-1",
    attemptGeneration: 1,
    noStartProof: { proofRef: "proof-1" },
    oldWriterFence: { claimTokenHash: FINGERPRINT, fencedAt: "2026-09-25T00:00:00.000Z" },
    expectedRevision: 2,
}

const fetchSpec = createApiFetchSpec()
const { answerWith, sentUrls, sentInit, sentBody } = fetchSpec
const served = (operation: string, result: unknown) => ({ kind: "sales_result", operation, requestId: INTENT, result })

/** Shared sales spec fixtures and request controls. */
export const salesSpec = {
    WORKSPACE,
    INSTANCE,
    INSTALLATION,
    TOKEN,
    INTENT,
    SCOPE,
    OPERATIONS_PATH,
    CORE_ORIGIN,
    FINGERPRINT,
    POLICY_REQUEST,
    READINESS_REQUEST,
    OPPORTUNITY_REQUEST,
    PIPELINE_REQUEST,
    COMMAND_REQUEST,
    DECISION_REQUEST,
    ACTION_REQUEST,
    HANDOFF_REQUEST,
    CONFIGURE_POLICY_REQUEST,
    SUBMIT_COMMAND_REQUEST,
    CLARIFY_COMMAND_REQUEST,
    DECIDE_PROPOSAL_REQUEST,
    CLOSE_REQUEST,
    PREPARE_HANDOFF_REQUEST,
    SUBMIT_HANDOFF_REQUEST,
    RETRY_ACTION_REQUEST,
    STOP_ACTION_REQUEST,
    answerWith,
    sentUrls,
    sentInit,
    sentBody,
    served,
    get fetchMock() {
        return fetchSpec.fetchMock
    },
}
