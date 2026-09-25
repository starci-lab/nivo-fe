import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { graphql } = vi.hoisted(() => ({ graphql: vi.fn() }));
vi.mock("./graphql", () => ({ graphql }));

import {
  approveAccountingCorrection, approveAccountingDocument, closeAccountingPeriod, commandAccountingAdmitEvidence,
  commandAccountingCorrect, commandAccountingException, commandAccountingRoutine, ingestAccountingDocument,
  initializeAccounting, postAccountingDocument, readAccountingEvidence, readAccountingResultDetail,
  readAccountingRoutineResult, readAccountingSummary, readAccountingWorkbench, reconcileAccounting,
  resolveAppliedAccountingContext, submitAccountingCorrection, submitAccountingDocument
} from "./accounting";

const operation = { amountMinor: null, contextVersionId: null, currency: "VND", details: {}, installationId: "installation-1", ledgerVersion: "7", operation: "accepted", resourceId: "resource-1", status: "accepted" };
const rawWorkbench = {
  capabilities: { canApproveCorrection: false, canSubmitCorrection: true, reason: "advisory", viewerRole: "owner" },
  corrections: [{ id: "correction-1", source_entry_id: "entry-1", effective_period_key: "2026-09-01", signed_delta_minor: "-50", currency: "VND", reason: "Fix source", status: "pending", submitted_by_user_id: "owner-1", approver_user_id: "approver-1", approved_by_user_id: null, version: "1", approved_ledger_id: null, created_at: "2026-09-06T00:00:00Z", approved_at: null }],
  currency: "VND",
  documents: [{ id: "document-1", file_name: "receipt.pdf", classification: "expense", amount_minor: "100", currency: "VND", period_key: "2026-08-01", status: "submitted", context_version_id: "context-1", context_digest: "digest-1", context_snapshot: {} }],
  events: [{ id: "event-1", operation: "submit", aggregate_type: "correction", aggregate_id: "correction-1", details: {}, created_at: "2026-09-06T00:00:00Z" }],
  installationId: "installation-1",
  ledger: [{ id: "entry-1", document_id: "document-1", correction_of_id: null, ledger_version: "7", period_key: "2026-08-01", signed_amount_minor: "-100", currency: "VND", kind: "document", reason: null, created_at: "2026-09-06T00:00:00Z" }],
  ledgerAmountMinor: "-100",
  ledgerVersion: "7",
  periods: [{ period_key: "2026-08-01", status: "closed", version: "1", closed_at: "2026-09-01T00:00:00Z" }],
  reconciliations: [{ id: "reconciliation-1", ledger_version_h: "7", currency: "VND", source_amount_minor: "0", ledger_amount_minor: "-100", difference_minor: "100", created_at: "2026-09-06T00:00:00Z" }]
};

describe("modules/api/accounting", () => {
  beforeEach(() => graphql.mockReset());

  it("uses one-root reads and narrows snake-case JSON rows", async () => {
    graphql.mockResolvedValueOnce({ ok: true, data: rawWorkbench });
    const answer = await readAccountingWorkbench("installation-1", "VND", "7");
    expect(answer).toMatchObject({ ok: true, data: { ledgerAmountMinor: "-100", documents: [{ fileName: "receipt.pdf" }], ledger: [{ signedAmountMinor: "-100" }], corrections: [{ signedDeltaMinor: "-50" }], reconciliations: [{ sourceAmountMinor: "0" }] } });
    expect(graphql).toHaveBeenCalledWith(expect.stringMatching(/^query ReadAccountingWorkbench[\s\S]+\{ readAccountingWorkbench\(input: \$input\) \{ success message error data \{ capabilities \{ canApproveCorrection canSubmitCorrection reason viewerRole \} corrections currency documents events installationId ledger ledgerAmountMinor ledgerVersion periods reconciliations \} \} \}$/), { input: { installationId: "installation-1", currency: "VND", ledgerVersion: "7" } });
  });

  it("refuses malformed JSON rows at the API boundary", async () => {
    graphql.mockResolvedValueOnce({ ok: true, data: { ...rawWorkbench, ledger: [{ id: "entry-1" }] } });
    expect(await readAccountingWorkbench("installation-1", "VND")).toEqual({ ok: false, code: "MALFORMED_ACCOUNTING_WORKBENCH", reason: "Malformed accounting row: document_id" });
  });

  it("dispatches every backend operation with its exact input type and one root field", async () => {
    graphql.mockResolvedValue({ ok: true, data: operation });
    await resolveAppliedAccountingContext("installation-1");
    await readAccountingWorkbench("installation-1", "VND");
    await initializeAccounting({ installationId: "installation-1", approverUserId: "approver-1", requestToken: "token" });
    await ingestAccountingDocument({ installationId: "installation-1", amountMinor: "100", classification: "expense", contentBase64: "ZGF0YQ==", currency: "VND", fileName: "receipt.pdf", mimeType: "application/pdf", periodKey: "2026-09-01", requestToken: "token" });
    await submitAccountingDocument({ installationId: "installation-1", documentId: "document-1", requestToken: "token" });
    await approveAccountingDocument({ installationId: "installation-1", documentId: "document-1", requestToken: "token" });
    await postAccountingDocument({ installationId: "installation-1", documentId: "document-1", requestToken: "token" });
    await reconcileAccounting({ installationId: "installation-1", currency: "VND", sourceAmountMinor: "0", requestToken: "token" });
    await closeAccountingPeriod({ installationId: "installation-1", periodKey: "2026-09-01", requestToken: "token" });
    await submitAccountingCorrection({ installationId: "installation-1", sourceEntryId: "entry-1", effectivePeriodKey: "2026-10-01", signedDeltaMinor: "-50", reason: "Fix", requestToken: "token" });
    await approveAccountingCorrection({ installationId: "installation-1", correctionId: "correction-1", requestToken: "token" });
    expect(graphql).toHaveBeenCalledTimes(11);
    const documents = graphql.mock.calls.map(([document]) => String(document));
    expect(documents).toEqual(expect.arrayContaining([
      expect.stringContaining("resolveAppliedAccountingContext(input: $input)"),
      expect.stringContaining("initializeAccounting(input: $input)"),
      expect.stringContaining("approveAccountingCorrection(input: $input)")
    ]));
    for (const document of documents) {
      expect((document.match(/\(input: \$input\)/g) ?? [])).toHaveLength(1);
    }
    expect(documents[0]).toMatch(/success message error data \{ digest installationId snapshot versionId \}/);
    expect(documents[1]).toMatch(/success message error data \{ capabilities \{ canApproveCorrection canSubmitCorrection reason viewerRole \} corrections currency documents events installationId ledger ledgerAmountMinor ledgerVersion periods reconciliations \}/);
    for (const document of documents.slice(2)) expect(document).toMatch(/success message error data \{ amountMinor contextVersionId currency details installationId ledgerVersion operation resourceId status \}/);
    expect(documents.every(document => !document.includes("payload"))).toBe(true);
  });
});

/* -------------------------------------------------------------------------------------------------
 * The installation operation client: one bearer POST per operation, and no answer promoted.
 * ----------------------------------------------------------------------------------------------- */

const WORKSPACE = "11111111-1111-4111-8111-111111111111";
const INSTANCE = "22222222-2222-4222-8222-222222222222";
const INSTALLATION = "33333333-3333-4333-8333-333333333333";
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.access-token.signature";
const INTENT = "b7b7c1f0-1f4a-4a3e-9a2b-3a1c5d6e7f80";
const SCOPE = { workspaceId: WORKSPACE, instanceId: INSTANCE, installationId: INSTALLATION };
const OPERATIONS_PATH = `/api/v1/agentos/workspaces/${WORKSPACE}/instances/${INSTANCE}/installations/${INSTALLATION}/operations/`;
const CORE_ORIGIN = new URL(process.env.NEXT_PUBLIC_CORE_API_URL ?? "http://localhost:3068/graphql").origin;

let fetchMock: ReturnType<typeof vi.fn>;

const answerWith = (status: number, body: unknown): void => {
  fetchMock.mockResolvedValue({ status, json: async () => body });
};
const sentUrls = (): Array<string> => fetchMock.mock.calls.map(call => String(call[0]));
const sentInit = (index = 0): RequestInit => fetchMock.mock.calls[index]?.[1] as RequestInit;
const sentBody = (index = 0): Record<string, unknown> => JSON.parse(String(sentInit(index).body)) as Record<string, unknown>;
const accountingResult = (op: string, payload: Record<string, unknown>) => ({ kind: "accounting_result", operation: "accounting.evidence@1", requestId: INTENT, result: { ok: true, result: { op, payload } } });

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("accounting", () => {
  it("sends each of the eight operations as exactly one bearer POST to its registered name", async () => {
    answerWith(200, accountingResult("evidence", { evidenceId: "evidence-1", state: "admitted", revision: 1, missingFacts: [] }));
    await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT);
    await readAccountingRoutineResult(TOKEN, SCOPE, { intentId: "intent-1" }, INTENT);
    await readAccountingSummary(TOKEN, SCOPE, { periodStart: "2026-09-01", periodEndExclusive: "2026-10-01", currency: "VND", pageSize: 25, cursor: null }, INTENT);
    await readAccountingResultDetail(TOKEN, SCOPE, { action: "current", resultId: "result-1" }, INTENT);
    await commandAccountingAdmitEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1", sourceKind: "statement-import", sourceRef: "s3://source-1", sourceRevision: "2", fingerprint: "fingerprint-1", expectedRevision: 1 }, INTENT);
    await commandAccountingRoutine(TOKEN, SCOPE, { action: "commit", itemId: "item-1", evidenceIds: ["evidence-1"], intentId: "intent-1", policyRevision: "policy-1", expectedItemRevision: 3 }, INTENT);
    await commandAccountingException(TOKEN, SCOPE, { action: "answer", exceptionId: "exception-1", answer: { choiceCode: "code-1", suppliedFacts: [], reason: null }, answerEvidenceRefs: [], expectedRevision: 4 }, INTENT);
    await commandAccountingCorrect(TOKEN, SCOPE, { action: "append", correctionId: "correction-1", attemptId: "attempt-1", expectedRevision: 1 }, INTENT);

    expect(sentUrls()).toEqual([
      `${CORE_ORIGIN}${OPERATIONS_PATH}accounting.evidence@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}accounting.routineResult@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}accounting.summary@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}accounting.resultDetail@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}accounting.admitEvidence@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}accounting.routine@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}accounting.exception@1`,
      `${CORE_ORIGIN}${OPERATIONS_PATH}accounting.correct@1`
    ]);
    for (const index of [0, 1, 2, 3, 4, 5, 6, 7]) {
      expect(sentInit(index).method).toBe("POST");
      expect(sentInit(index).credentials).toBe("omit");
      expect(sentInit(index).headers).toEqual({ "Authorization": `Bearer ${TOKEN}`, "Content-Type": "application/json" });
      expect(sentBody(index).requestId).toBe(INTENT);
    }
    expect(sentBody(2).input).toEqual({ op: "summary", input: { periodStart: "2026-09-01", periodEndExclusive: "2026-10-01", currency: "VND", pageSize: 25, cursor: null } });
    expect(sentBody(5).input).toEqual({ op: "routine", input: { action: "commit", itemId: "item-1", evidenceIds: ["evidence-1"], intentId: "intent-1", policyRevision: "policy-1", expectedItemRevision: 3 } });
    expect(fetchMock).toHaveBeenCalledTimes(8);
  });

  it("hands the receiver's own tagged variant through on success", async () => {
    answerWith(200, accountingResult("evidence", { evidenceId: "evidence-1", state: "reading", revision: 2, missingFacts: ["fingerprint"] }));
    expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toEqual({ ok: true, data: { op: "evidence", payload: { evidenceId: "evidence-1", state: "reading", revision: 2, missingFacts: ["fingerprint"] } } });
  });

  it("keeps an unknown outcome unknown, names the matching read, and never re-sends", async () => {
    answerWith(200, { kind: "outcome_unknown", operation: "accounting.routine@1", requestId: INTENT });
    expect(await commandAccountingRoutine(TOKEN, SCOPE, { action: "retry", intentId: "intent-1", oldAttemptId: "attempt-1", notStartedProofRef: "proof-1", newAttemptId: "attempt-2" }, INTENT)).toEqual({ ok: false, code: "outcome_unknown", operation: "accounting.routine@1", requestId: INTENT, reconciles: "accounting.routineResult@1" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("treats a receiver outcome-unknown failure as the same unknown rather than a refusal", async () => {
    answerWith(200, { kind: "accounting_result", operation: "accounting.admitEvidence@1", requestId: INTENT, result: { ok: false, failure: { op: "admitEvidence", error: "outcome-unknown", reasonCode: "controlplane-wait" } } });
    expect(await commandAccountingAdmitEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1", sourceKind: "statement-import", sourceRef: "s3://source-1", sourceRevision: "2", fingerprint: "fingerprint-1", expectedRevision: 1 }, INTENT)).toEqual({ ok: false, code: "outcome_unknown", operation: "accounting.admitEvidence@1", requestId: INTENT, reconciles: "accounting.evidence@1" });
  });

  it("names no read for a command whose surface registers none", async () => {
    answerWith(200, { kind: "outcome_unknown", operation: "accounting.exception@1", requestId: INTENT });
    const answer = await commandAccountingException(TOKEN, SCOPE, { action: "defer", exceptionId: "exception-1", reason: "awaiting owner", expectedRevision: 4 }, INTENT);
    expect(answer).toEqual({ ok: false, code: "outcome_unknown", operation: "accounting.exception@1", requestId: INTENT, reconciles: null });
  });

  it("keeps a deadline a refusal that still names the read of the same identity", async () => {
    answerWith(200, { kind: "DEADLINE_EXCEEDED", reason: "core-wait" });
    const answer = await commandAccountingRoutine(TOKEN, SCOPE, { action: "retry", intentId: "intent-1", oldAttemptId: "attempt-1", notStartedProofRef: "proof-1", newAttemptId: "attempt-2" }, INTENT);
    expect(answer).toEqual({ ok: false, code: "DEADLINE_EXCEEDED", operation: "accounting.routine@1", requestId: INTENT, reason: "core-wait", reconciles: "accounting.routineResult@1" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refuses an unregistered installation operation by its closed name", async () => {
    answerWith(200, { kind: "OPERATION_NOT_REGISTERED_FOR_INSTALLATION", reason: "not-installed" });
    const answer = await readAccountingSummary(TOKEN, SCOPE, { periodStart: "2026-09-01", periodEndExclusive: "2026-10-01", currency: null, pageSize: 25, cursor: null }, INTENT);
    expect(answer).toMatchObject({ ok: false, code: "OPERATION_NOT_REGISTERED_FOR_INSTALLATION", operation: "accounting.summary@1", reason: "not-installed" });
  });

  it("never translates another module's result kind", async () => {
    answerWith(200, { kind: "sales_result", operation: "accounting.summary@1", requestId: INTENT, result: { ok: true, result: { op: "summary", payload: {} } } });
    expect(await readAccountingSummary(TOKEN, SCOPE, { periodStart: "2026-09-01", periodEndExclusive: "2026-10-01", currency: null, pageSize: 25, cursor: null }, INTENT)).toMatchObject({ ok: false, code: "UNEXPECTED_RESULT_KIND" });
  });

  it("refuses a variant that is not the one the operation asked for", async () => {
    answerWith(200, { kind: "accounting_result", operation: "accounting.evidence@1", requestId: INTENT, result: { ok: true, result: { op: "summary", payload: {} } } });
    expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toMatchObject({ ok: false, code: "UNEXPECTED_RESULT_TAG" });
  });

  it("refuses a result kind the route does not declare", async () => {
    answerWith(200, { kind: "someday_new_kind", reason: "unknown" });
    expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toMatchObject({ ok: false, code: "UNEXPECTED_RESULT_KIND" });
  });

  it("refuses an answer that echoes an identity this call did not send", async () => {
    answerWith(200, { kind: "accounting_result", operation: "accounting.evidence@1", requestId: "another-intent", result: { ok: true, result: { op: "evidence", payload: {} } } });
    expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toMatchObject({ ok: false, code: "ECHOED_IDENTITY_MISMATCH" });
  });

  it("sends nothing at all without an access token", async () => {
    expect(await readAccountingEvidence(null, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toMatchObject({ ok: false, code: "UNAUTHENTICATED", requestId: null });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses an intent identity the route itself would reject, before any request", async () => {
    expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, "")).toMatchObject({ ok: false, code: "BAD_REQUEST" });
    expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, "x".repeat(513))).toMatchObject({ ok: false, code: "BAD_REQUEST" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports a refused bearer token as UNAUTHENTICATED rather than as a served answer", async () => {
    answerWith(401, { kind: "UNAUTHENTICATED" });
    expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toMatchObject({ ok: false, code: "UNAUTHENTICATED" });
  });

  it("fails closed when the transport or the body is not an answer at all", async () => {
    fetchMock.mockRejectedValueOnce(new Error("socket closed"));
    expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toMatchObject({ ok: false, code: "UNREACHABLE" });
    fetchMock.mockResolvedValueOnce({ status: 200, json: async () => { throw new Error("not json"); } });
    expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toMatchObject({ ok: false, code: "MALFORMED_ANSWER" });
    answerWith(200, "not an envelope");
    expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toMatchObject({ ok: false, code: "MALFORMED_ANSWER" });
  });
});
