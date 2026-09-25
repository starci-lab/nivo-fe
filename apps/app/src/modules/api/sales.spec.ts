import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  commandSalesClarifyCommand, commandSalesClose, commandSalesConfigurePolicy, commandSalesDecideProposal,
  commandSalesPrepareHandoff, commandSalesRecoverAction, commandSalesSubmitCommand, commandSalesSubmitHandoff,
  readSalesAction, readSalesCommand, readSalesDecisionRequest, readSalesHandoff, readSalesOpportunity,
  readSalesPipeline, readSalesPolicy, readSalesReadiness, SALES_MUTATION_NAMES, SALES_QUERY_NAMES,
  SALES_RECONCILIATIONS, SALES_RESULT_TAGS, salesOperationAddress
} from "./sales";

const WORKSPACE = "11111111-1111-4111-8111-111111111111";
const INSTANCE = "22222222-2222-4222-8222-222222222222";
const INSTALLATION = "33333333-3333-4333-8333-333333333333";
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.access-token.signature";
const INTENT = "b7b7c1f0-1f4a-4a3e-9a2b-3a1c5d6e7f80";
const SCOPE = { workspaceId: WORKSPACE, instanceId: INSTANCE, installationId: INSTALLATION };
const OPERATIONS_PATH = `/api/v1/agentos/workspaces/${WORKSPACE}/instances/${INSTANCE}/installations/${INSTALLATION}/operations/`;
const CORE_ORIGIN = new URL(process.env.NEXT_PUBLIC_CORE_API_URL ?? "http://localhost:3068/graphql").origin;
const FINGERPRINT = "a".repeat(64);

const POLICY_REQUEST = { salesInstallationId: INSTALLATION, requestId: null };
const READINESS_REQUEST = { salesInstallationId: INSTALLATION };
const OPPORTUNITY_REQUEST = { opportunityId: "opportunity-1" };
const PIPELINE_REQUEST = { scopeFingerprint: FINGERPRINT, statusFilter: null, after: null, limit: 25 };
const COMMAND_REQUEST = { commandId: "command-1" };
const DECISION_REQUEST = { decisionRequestId: "decision-1" };
const ACTION_REQUEST = { actionId: "action-1" };
const HANDOFF_REQUEST = { handoffId: "handoff-1" };
const CONFIGURE_POLICY_REQUEST = { requestId: INTENT, salesInstallationId: INSTALLATION, expectedPolicyRevision: null, values: { routineCadence: null, responseTarget: null, contactPolicy: null, catalogueReference: null, capacityLimits: null } };
const SUBMIT_COMMAND_REQUEST = { commandId: "command-1", commandRevision: 1, scope: { customerRefs: ["customer-1"], opportunityIds: [], offerRefs: [] }, requestedActions: ["qualify"] as const, fingerprint: FINGERPRINT, expectedOpportunityRevisions: { "opportunity-1": 2 } };
const CLARIFY_COMMAND_REQUEST = { commandId: "command-1", clarificationRevision: 1, permittedFact: { opportunityId: "opportunity-1" } };
const DECIDE_PROPOSAL_REQUEST = { decisionRequestId: "decision-1", proposalVersion: 1, proposalFingerprint: FINGERPRINT, answer: "approve" as const, expectedDecisionRevision: 1 };
const CLOSE_REQUEST = { intentId: INTENT, opportunityId: "opportunity-1", outcome: "lost" as const, evidenceRefs: ["evidence-1"], confirmedOrder: null, expectedRevision: 2 };
const PREPARE_HANDOFF_REQUEST = { handoffId: "handoff-1", opportunityId: "opportunity-1", orderRevision: 3, destinationAccountingInstallationId: "installation-2", consentRef: "consent-1", fingerprint: FINGERPRINT, expectedRevision: 4 };
const SUBMIT_HANDOFF_REQUEST = { handoffId: "handoff-1", confirmedOrderRevision: 3, fingerprint: FINGERPRINT, expectedHandoffRevision: 1 };
const RETRY_ACTION_REQUEST = { operation: "retryNoStart" as const, actionId: "action-1", attemptGeneration: 1, receiverIntentId: "receiver-intent-1", receiverAttemptId: "receiver-attempt-1", receiverNoStartProofRef: "proof-1", oldWriterFence: { claimTokenHash: FINGERPRINT, fencedAt: "2026-09-25T00:00:00.000Z" }, fingerprint: FINGERPRINT, expectedRevision: 2 };
const STOP_ACTION_REQUEST = { operation: "cancelNoStart" as const, actionId: "action-1", attemptGeneration: 1, noStartProof: { proofRef: "proof-1" }, oldWriterFence: { claimTokenHash: FINGERPRINT, fencedAt: "2026-09-25T00:00:00.000Z" }, expectedRevision: 2 };

let fetchMock: ReturnType<typeof vi.fn>;

const answerWith = (status: number, body: unknown): void => {
  fetchMock.mockResolvedValue({ status, json: async () => body });
};
const sentUrls = (): Array<string> => fetchMock.mock.calls.map(call => String(call[0]));
const sentInit = (index = 0): RequestInit => fetchMock.mock.calls[index]?.[1] as RequestInit;
const sentBody = (index = 0): Record<string, unknown> => JSON.parse(String(sentInit(index).body)) as Record<string, unknown>;
const served = (operation: string, result: unknown) => ({ kind: "sales_result", operation, requestId: INTENT, result });

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("salesOperationAddress", () => {
  it("builds the one registered address of each operation from the installation coordinates", () => {
    expect(salesOperationAddress(SCOPE, "sales.policy@1")).toBe(`${CORE_ORIGIN}${OPERATIONS_PATH}sales.policy@1`);
    expect(salesOperationAddress(SCOPE, "sales.recoverAction@1")).toBe(`${CORE_ORIGIN}${OPERATIONS_PATH}sales.recoverAction@1`);
  });

  it("percent-encodes the caller-held coordinates", () => {
    expect(salesOperationAddress({ workspaceId: "a/b", instanceId: "c d", installationId: "e?f" }, "sales.handoff@1"))
      .toBe(`${CORE_ORIGIN}/api/v1/agentos/workspaces/a%2Fb/instances/c%20d/installations/e%3Ff/operations/sales.handoff@1`);
  });
});

describe("sales", () => {
  it("registers exactly the contract's sixteen operations, eight queries then eight mutations", () => {
    expect(SALES_QUERY_NAMES).toEqual([
      "sales.policy@1", "sales.readiness@1", "sales.opportunity@1", "sales.pipeline@1",
      "sales.command@1", "sales.decisionRequest@1", "sales.action@1", "sales.handoff@1"
    ]);
    expect(SALES_MUTATION_NAMES).toEqual([
      "sales.configurePolicy@1", "sales.submitCommand@1", "sales.clarifyCommand@1", "sales.decideProposal@1",
      "sales.close@1", "sales.prepareHandoff@1", "sales.submitHandoff@1", "sales.recoverAction@1"
    ]);
    // The closed set is callable and nothing else: every name carries one variant and one read, and a
    // query registers none.
    const registered = [...SALES_QUERY_NAMES, ...SALES_MUTATION_NAMES];
    expect(new Set(registered).size).toBe(16);
    expect(Object.keys(SALES_RESULT_TAGS).sort()).toEqual([...registered].sort());
    expect(Object.keys(SALES_RECONCILIATIONS).sort()).toEqual([...SALES_MUTATION_NAMES].sort());
  });

  it("sends each of the eight queries as exactly one bearer POST to its registered name", async () => {
    answerWith(200, served("sales.policy@1", { status: "completed", value: { salesInstallationId: INSTALLATION, revision: 1, requestId: null, values: {}, unsetItems: [], configuredBy: null, recordedAt: null } }));
    await readSalesPolicy(TOKEN, SCOPE, POLICY_REQUEST, INTENT);
    answerWith(200, served("sales.readiness@1", { status: "completed", value: { ready: true } }));
    await readSalesReadiness(TOKEN, SCOPE, READINESS_REQUEST, INTENT);
    answerWith(200, served("sales.opportunity@1", { status: "completed", value: { opportunityId: "opportunity-1" } }));
    await readSalesOpportunity(TOKEN, SCOPE, OPPORTUNITY_REQUEST, INTENT);
    answerWith(200, served("sales.pipeline@1", { status: "completed", value: { items: [] } }));
    await readSalesPipeline(TOKEN, SCOPE, PIPELINE_REQUEST, INTENT);
    answerWith(200, served("sales.command@1", { status: "completed", value: { commandId: "command-1" } }));
    await readSalesCommand(TOKEN, SCOPE, COMMAND_REQUEST, INTENT);
    answerWith(200, served("sales.decisionRequest@1", { status: "completed", value: { decisionRequestId: "decision-1" } }));
    await readSalesDecisionRequest(TOKEN, SCOPE, DECISION_REQUEST, INTENT);
    answerWith(200, served("sales.action@1", { status: "completed", value: { actionId: "action-1" } }));
    await readSalesAction(TOKEN, SCOPE, ACTION_REQUEST, INTENT);
    answerWith(200, served("sales.handoff@1", { status: "completed", value: { handoffId: "handoff-1" } }));
    await readSalesHandoff(TOKEN, SCOPE, HANDOFF_REQUEST, INTENT);

    expect(sentUrls()).toEqual([
      `${CORE_ORIGIN}${OPERATIONS_PATH}sales.policy@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}sales.readiness@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}sales.opportunity@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}sales.pipeline@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}sales.command@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}sales.decisionRequest@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}sales.action@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}sales.handoff@1`
    ]);
    for (const index of [0, 1, 2, 3, 4, 5, 6, 7]) {
      expect(sentInit(index).method).toBe("POST");
      expect(sentInit(index).credentials).toBe("omit");
      expect(sentInit(index).headers).toEqual({ "Authorization": `Bearer ${TOKEN}`, "Content-Type": "application/json" });
      expect(sentBody(index).requestId).toBe(INTENT);
    }
    expect(sentBody(0).input).toEqual({ operation: "policy", salesInstallationId: INSTALLATION, requestId: null });
    expect(sentBody(3).input).toEqual({ operation: "pipeline", scopeFingerprint: FINGERPRINT, statusFilter: null, after: null, limit: 25 });
    expect(fetchMock).toHaveBeenCalledTimes(8);
  });

  it("sends each of the eight mutations as exactly one bearer POST under the caller's stable identity", async () => {
    answerWith(200, served("sales.configurePolicy@1", { status: "completed", value: { revision: 2 } }));
    await commandSalesConfigurePolicy(TOKEN, SCOPE, CONFIGURE_POLICY_REQUEST, INTENT);
    answerWith(200, served("sales.submitCommand@1", { status: "completed", value: { commandId: "command-1" } }));
    await commandSalesSubmitCommand(TOKEN, SCOPE, SUBMIT_COMMAND_REQUEST, INTENT);
    answerWith(200, served("sales.clarifyCommand@1", { status: "completed", value: { commandId: "command-1" } }));
    await commandSalesClarifyCommand(TOKEN, SCOPE, CLARIFY_COMMAND_REQUEST, INTENT);
    answerWith(200, served("sales.decideProposal@1", { status: "completed", value: { decisionRequestId: "decision-1" } }));
    await commandSalesDecideProposal(TOKEN, SCOPE, DECIDE_PROPOSAL_REQUEST, INTENT);
    answerWith(200, served("sales.close@1", { status: "lost", value: { opportunityId: "opportunity-1" } }));
    await commandSalesClose(TOKEN, SCOPE, CLOSE_REQUEST, INTENT);
    answerWith(200, served("sales.prepareHandoff@1", { status: "completed", value: { handoffId: "handoff-1" } }));
    await commandSalesPrepareHandoff(TOKEN, SCOPE, PREPARE_HANDOFF_REQUEST, INTENT);
    answerWith(200, served("sales.submitHandoff@1", { status: "completed", value: { handoffId: "handoff-1" } }));
    await commandSalesSubmitHandoff(TOKEN, SCOPE, SUBMIT_HANDOFF_REQUEST, INTENT);
    answerWith(200, served("sales.recoverAction@1", { status: "completed", value: { actionId: "action-1" } }));
    await commandSalesRecoverAction(TOKEN, SCOPE, RETRY_ACTION_REQUEST, INTENT);
    answerWith(200, served("sales.recoverAction@1", { status: "completed", value: { actionId: "action-1" } }));
    await commandSalesRecoverAction(TOKEN, SCOPE, STOP_ACTION_REQUEST, INTENT);

    expect(sentUrls()).toEqual([
      `${CORE_ORIGIN}${OPERATIONS_PATH}sales.configurePolicy@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}sales.submitCommand@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}sales.clarifyCommand@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}sales.decideProposal@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}sales.close@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}sales.prepareHandoff@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}sales.submitHandoff@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}sales.recoverAction@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}sales.recoverAction@1`
    ]);
    expect(sentBody(1).input).toEqual({ operation: "executeCommand", ...SUBMIT_COMMAND_REQUEST });
    expect(sentBody(3).input).toEqual({ operation: "answerDecision", ...DECIDE_PROPOSAL_REQUEST });
    expect(sentBody(5).input).toEqual({ operation: "prepareHandoff", ...PREPARE_HANDOFF_REQUEST });
    expect(sentBody(6).input).toEqual({ operation: "submitPreparedHandoff", ...SUBMIT_HANDOFF_REQUEST });
    // The one registered name that opens two recovery doors sends the discriminant its own input names.
    expect(sentBody(7).input).toEqual(RETRY_ACTION_REQUEST);
    expect(sentBody(8).input).toEqual(STOP_ACTION_REQUEST);
    // An exact replay of one identity is one press under the same requestId, never a new identity.
    expect(sentBody(7).requestId).toBe(sentBody(8).requestId);
    expect(sentBody(0).input).toEqual({ operation: "configurePolicy", ...CONFIGURE_POLICY_REQUEST });
    expect(fetchMock).toHaveBeenCalledTimes(9);
  });

  it("hands the receiver's own variant through with the tag the operation registers", async () => {
    answerWith(200, served("sales.close@1", { status: "won", value: { opportunityId: "opportunity-1", revision: 3 } }));
    expect(await commandSalesClose(TOKEN, SCOPE, CLOSE_REQUEST, INTENT)).toEqual({ ok: true, operation: "sales.close@1", variant: "sales_opportunity", value: { opportunityId: "opportunity-1", revision: 3 } });
    answerWith(200, served("sales.readiness@1", { status: "pending", value: { ready: false, revision: 1 } }));
    expect(await readSalesReadiness(TOKEN, SCOPE, READINESS_REQUEST, INTENT)).toEqual({ ok: true, operation: "sales.readiness@1", variant: "sales_readiness", value: { ready: false, revision: 1 } });
  });

  it("surfaces DENIED as its own typed failure and keeps the receiver's code", async () => {
    answerWith(200, served("sales.opportunity@1", { status: "denied", code: "SALES_OPPORTUNITY_NOT_FOUND" }));
    expect(await readSalesOpportunity(TOKEN, SCOPE, OPPORTUNITY_REQUEST, INTENT)).toEqual({
      ok: false, code: "SALES_REFUSED_DENIED", operation: "sales.opportunity@1", requestId: INTENT, reconciles: null, reason: null,
      refusal: { reason: "DENIED", code: "SALES_OPPORTUNITY_NOT_FOUND", item: null, currentRevision: null }
    });
  });

  it("surfaces INVALID with the one item the receiver named, and nothing else's item", async () => {
    answerWith(200, served("sales.configurePolicy@1", { status: "denied", code: "SALES_POLICY_VALUE_INVALID", value: { item: "contact-policy" } }));
    expect(await commandSalesConfigurePolicy(TOKEN, SCOPE, CONFIGURE_POLICY_REQUEST, INTENT)).toMatchObject({
      ok: false, code: "SALES_REFUSED_INVALID", operation: "sales.configurePolicy@1",
      reconciles: "sales.policy@1", refusal: { reason: "INVALID", code: "SALES_POLICY_VALUE_INVALID", item: "contact-policy", currentRevision: null }
    });
    answerWith(200, served("sales.opportunity@1", { status: "denied", code: "SALES_OPPORTUNITY_NOT_FOUND", value: { item: "not-a-policy-item" } }));
    expect(await readSalesOpportunity(TOKEN, SCOPE, OPPORTUNITY_REQUEST, INTENT)).toMatchObject({ code: "SALES_REFUSED_DENIED", refusal: { reason: "DENIED", item: "not-a-policy-item" } });
  });

  it("surfaces CONFLICT with the current revision the stored value carries", async () => {
    answerWith(200, served("sales.configurePolicy@1", { status: "conflict", code: "SALES_POLICY_REVISION_CONFLICT", value: { salesInstallationId: INSTALLATION, revision: 4 } }));
    expect(await commandSalesConfigurePolicy(TOKEN, SCOPE, CONFIGURE_POLICY_REQUEST, INTENT)).toMatchObject({
      ok: false, code: "SALES_REFUSED_CONFLICT", reconciles: "sales.policy@1",
      refusal: { reason: "CONFLICT", code: "SALES_POLICY_REVISION_CONFLICT", item: null, currentRevision: 4 }
    });
  });

  it("prefers an explicit currentRevision and accepts no re-spelled or non-positive one", async () => {
    answerWith(200, served("sales.configurePolicy@1", { status: "conflict", code: "SALES_POLICY_REVISION_CONFLICT", value: { currentRevision: 7, revision: 4 } }));
    expect(await commandSalesConfigurePolicy(TOKEN, SCOPE, CONFIGURE_POLICY_REQUEST, INTENT)).toMatchObject({ refusal: { currentRevision: 7 } });
    answerWith(200, served("sales.configurePolicy@1", { status: "conflict", code: "SALES_POLICY_REVISION_CONFLICT", value: { currentRevision: "7" } }));
    expect(await commandSalesConfigurePolicy(TOKEN, SCOPE, CONFIGURE_POLICY_REQUEST, INTENT)).toMatchObject({ refusal: { currentRevision: null } });
    answerWith(200, served("sales.configurePolicy@1", { status: "conflict", code: "SALES_POLICY_REVISION_CONFLICT", value: { revision: 0 } }));
    expect(await commandSalesConfigurePolicy(TOKEN, SCOPE, CONFIGURE_POLICY_REQUEST, INTENT)).toMatchObject({ refusal: { currentRevision: null } });
  });

  it("surfaces UNAVAILABLE as its own typed failure", async () => {
    answerWith(200, served("sales.readiness@1", { status: "unavailable", code: "SALES_READINESS_NOT_OBSERVED" }));
    expect(await readSalesReadiness(TOKEN, SCOPE, READINESS_REQUEST, INTENT)).toEqual({
      ok: false, code: "SALES_REFUSED_UNAVAILABLE", operation: "sales.readiness@1", requestId: INTENT, reconciles: null, reason: null,
      refusal: { reason: "UNAVAILABLE", code: "SALES_READINESS_NOT_OBSERVED", item: null, currentRevision: null }
    });
  });

  it("fails closed on a refusal status the contract does not declare, and on a refusal with no code", async () => {
    answerWith(200, served("sales.opportunity@1", { status: "someday", code: "SALES_SOMEDAY" }));
    expect(await readSalesOpportunity(TOKEN, SCOPE, OPPORTUNITY_REQUEST, INTENT)).toMatchObject({ ok: false, code: "UNEXPECTED_RESULT_STATUS" });
    answerWith(200, served("sales.opportunity@1", { status: "denied", code: "" }));
    expect(await readSalesOpportunity(TOKEN, SCOPE, OPPORTUNITY_REQUEST, INTENT)).toMatchObject({ ok: false, code: "MALFORMED_ANSWER" });
    answerWith(200, served("sales.opportunity@1", { status: "denied", code: 42 }));
    expect(await readSalesOpportunity(TOKEN, SCOPE, OPPORTUNITY_REQUEST, INTENT)).toMatchObject({ ok: false, code: "MALFORMED_ANSWER" });
  });

  it("fails closed on a served status the contract does not declare, and reads a lifecycle denial as a variant", async () => {
    answerWith(200, served("sales.opportunity@1", { status: "someday", value: {} }));
    expect(await readSalesOpportunity(TOKEN, SCOPE, OPPORTUNITY_REQUEST, INTENT)).toMatchObject({ ok: false, code: "UNEXPECTED_RESULT_STATUS" });
    // A lifecycle denial is the readiness fact, not a refusal of the read: it carries no code.
    answerWith(200, served("sales.readiness@1", { status: "denied", value: { ready: false, revision: 2 } }));
    expect(await readSalesReadiness(TOKEN, SCOPE, READINESS_REQUEST, INTENT)).toEqual({ ok: true, operation: "sales.readiness@1", variant: "sales_readiness", value: { ready: false, revision: 2 } });
  });

  it("fails closed when the served result is not a result object at all", async () => {
    answerWith(200, served("sales.handoff@1", "not a result"));
    expect(await readSalesHandoff(TOKEN, SCOPE, HANDOFF_REQUEST, INTENT)).toMatchObject({ ok: false, code: "MALFORMED_ANSWER" });
    answerWith(200, served("sales.handoff@1", { value: { handoffId: "handoff-1" } }));
    expect(await readSalesHandoff(TOKEN, SCOPE, HANDOFF_REQUEST, INTENT)).toMatchObject({ ok: false, code: "MALFORMED_ANSWER" });
    answerWith(200, served("sales.handoff@1", { status: 7, value: {} }));
    expect(await readSalesHandoff(TOKEN, SCOPE, HANDOFF_REQUEST, INTENT)).toMatchObject({ ok: false, code: "MALFORMED_ANSWER" });
    answerWith(200, served("sales.handoff@1", { status: "completed" }));
    expect(await readSalesHandoff(TOKEN, SCOPE, HANDOFF_REQUEST, INTENT)).toMatchObject({ ok: false, code: "MALFORMED_ANSWER" });
  });

  it("keeps an unknown outcome unknown, names the one read of the same identity, and never re-sends", async () => {
    answerWith(200, { kind: "outcome_unknown", operation: "sales.close@1", requestId: INTENT });
    expect(await commandSalesClose(TOKEN, SCOPE, CLOSE_REQUEST, INTENT)).toEqual({
      ok: false, code: "outcome_unknown", operation: "sales.close@1", requestId: INTENT, reconciles: "sales.opportunity@1", refusal: null, reason: null
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps a deadline a refusal that still names the read of the same identity", async () => {
    answerWith(200, { kind: "DEADLINE_EXCEEDED", reason: "receiver-deadline" });
    expect(await commandSalesSubmitHandoff(TOKEN, SCOPE, SUBMIT_HANDOFF_REQUEST, INTENT)).toEqual({
      ok: false, code: "DEADLINE_EXCEEDED", operation: "sales.submitHandoff@1", requestId: INTENT, reconciles: "sales.handoff@1", refusal: null, reason: "receiver-deadline"
    });
    answerWith(200, { kind: "DEADLINE_EXCEEDED" });
    expect(await readSalesPipeline(TOKEN, SCOPE, PIPELINE_REQUEST, INTENT)).toMatchObject({ ok: false, code: "DEADLINE_EXCEEDED", reconciles: null, reason: null });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("binds every mutation to exactly the one read the contract registers", async () => {
    expect(SALES_RECONCILIATIONS).toEqual({
      "sales.configurePolicy@1": "sales.policy@1",
      "sales.submitCommand@1": "sales.command@1",
      "sales.clarifyCommand@1": "sales.command@1",
      "sales.decideProposal@1": "sales.decisionRequest@1",
      "sales.close@1": "sales.opportunity@1",
      "sales.prepareHandoff@1": "sales.handoff@1",
      "sales.submitHandoff@1": "sales.handoff@1",
      "sales.recoverAction@1": "sales.action@1"
    });
    answerWith(200, { kind: "outcome_unknown", operation: "sales.prepareHandoff@1", requestId: INTENT });
    expect(await commandSalesPrepareHandoff(TOKEN, SCOPE, PREPARE_HANDOFF_REQUEST, INTENT)).toMatchObject({ reconciles: "sales.handoff@1" });
    answerWith(200, { kind: "outcome_unknown", operation: "sales.recoverAction@1", requestId: INTENT });
    expect(await commandSalesRecoverAction(TOKEN, SCOPE, STOP_ACTION_REQUEST, INTENT)).toMatchObject({ reconciles: "sales.action@1" });
    answerWith(200, { kind: "outcome_unknown", operation: "sales.clarifyCommand@1", requestId: INTENT });
    expect(await commandSalesClarifyCommand(TOKEN, SCOPE, CLARIFY_COMMAND_REQUEST, INTENT)).toMatchObject({ reconciles: "sales.command@1" });
  });

  it("never translates OPERATION_NOT_REGISTERED_FOR_INSTALLATION into a Sales state", async () => {
    answerWith(200, { kind: "OPERATION_NOT_REGISTERED_FOR_INSTALLATION", reason: "installation-serves-no-such-package" });
    const answer = await readSalesReadiness(TOKEN, SCOPE, READINESS_REQUEST, INTENT);
    expect(answer).toEqual({
      ok: false, code: "OPERATION_NOT_REGISTERED_FOR_INSTALLATION", operation: "sales.readiness@1", requestId: INTENT, reconciles: null, refusal: null, reason: "installation-serves-no-such-package"
    });
    expect(answer).not.toHaveProperty("value");
  });

  it("keeps every other closed route error its own name", async () => {
    for (const kind of ["BAD_REQUEST", "REFUSED", "UNSUPPORTED_OPERATION_VERSION", "CURRENT_AUTHORITY_UNAVAILABLE", "CONTROLPLANE_UNAVAILABLE"]) {
      answerWith(200, { kind, reason: "route-reason" });
      expect(await readSalesCommand(TOKEN, SCOPE, COMMAND_REQUEST, INTENT)).toMatchObject({ ok: false, code: kind, reason: "route-reason", refusal: null });
    }
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it("never translates another module's result kind", async () => {
    answerWith(200, { kind: "accounting_result", operation: "sales.policy@1", requestId: INTENT, result: { ok: true, result: { op: "policy", payload: {} } } });
    expect(await readSalesPolicy(TOKEN, SCOPE, POLICY_REQUEST, INTENT)).toMatchObject({ ok: false, code: "UNEXPECTED_RESULT_KIND" });
  });

  it("refuses a result kind the route does not declare", async () => {
    answerWith(200, { kind: "someday_new_kind", reason: "unknown" });
    expect(await readSalesHandoff(TOKEN, SCOPE, HANDOFF_REQUEST, INTENT)).toMatchObject({ ok: false, code: "UNEXPECTED_RESULT_KIND" });
  });

  it("refuses an answer that echoes an identity this call did not send", async () => {
    answerWith(200, { kind: "outcome_unknown", operation: "sales.close@1", requestId: INTENT });
    expect(await commandSalesSubmitCommand(TOKEN, SCOPE, SUBMIT_COMMAND_REQUEST, INTENT)).toMatchObject({ ok: false, code: "ECHOED_IDENTITY_MISMATCH" });
    answerWith(200, served("sales.submitCommand@1", { status: "lost", value: {} }));
    expect(await commandSalesClose(TOKEN, SCOPE, CLOSE_REQUEST, INTENT)).toMatchObject({ ok: false, code: "ECHOED_IDENTITY_MISMATCH" });
    answerWith(200, served("sales.close@1", { status: "lost", value: {} }));
    expect(await commandSalesClose(TOKEN, SCOPE, { ...CLOSE_REQUEST, intentId: "another-intent" }, "another-intent")).toMatchObject({ ok: false, code: "ECHOED_IDENTITY_MISMATCH" });
  });

  it("sends nothing at all without an access token", async () => {
    expect(await readSalesPolicy(null, SCOPE, POLICY_REQUEST, INTENT)).toMatchObject({ ok: false, code: "UNAUTHENTICATED", requestId: null });
    expect(await commandSalesClose("", SCOPE, CLOSE_REQUEST, INTENT)).toMatchObject({ ok: false, code: "UNAUTHENTICATED", requestId: null });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses an operation identity the route itself would reject, before any request", async () => {
    expect(await readSalesAction(TOKEN, SCOPE, ACTION_REQUEST, "")).toMatchObject({ ok: false, code: "BAD_REQUEST" });
    expect(await readSalesAction(TOKEN, SCOPE, ACTION_REQUEST, "x".repeat(513))).toMatchObject({ ok: false, code: "BAD_REQUEST" });
    expect(await readSalesAction(TOKEN, SCOPE, ACTION_REQUEST, "control\u007fbyte")).toMatchObject({ ok: false, code: "BAD_REQUEST" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports a refused bearer token as UNAUTHENTICATED rather than as a served answer", async () => {
    answerWith(401, { kind: "UNAUTHENTICATED" });
    expect(await readSalesAction(TOKEN, SCOPE, ACTION_REQUEST, INTENT)).toMatchObject({ ok: false, code: "UNAUTHENTICATED", requestId: INTENT });
  });

  it("fails closed when the transport or the body is not an answer at all", async () => {
    fetchMock.mockRejectedValueOnce(new Error("socket closed"));
    expect(await readSalesAction(TOKEN, SCOPE, ACTION_REQUEST, INTENT)).toMatchObject({ ok: false, code: "UNREACHABLE" });
    fetchMock.mockRejectedValueOnce("not an error");
    expect(await readSalesAction(TOKEN, SCOPE, ACTION_REQUEST, INTENT)).toMatchObject({ ok: false, code: "UNREACHABLE", reason: expect.stringContaining("unknown") });
    fetchMock.mockResolvedValueOnce({ status: 200, json: async () => { throw new Error("not json"); } });
    expect(await readSalesAction(TOKEN, SCOPE, ACTION_REQUEST, INTENT)).toMatchObject({ ok: false, code: "MALFORMED_ANSWER" });
    answerWith(200, "not an envelope");
    expect(await readSalesAction(TOKEN, SCOPE, ACTION_REQUEST, INTENT)).toMatchObject({ ok: false, code: "MALFORMED_ANSWER" });
  });
});