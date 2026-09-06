import { beforeEach, describe, expect, it, vi } from "vitest";

const { graphql } = vi.hoisted(() => ({ graphql: vi.fn() }));
vi.mock("./graphql", () => ({ graphql }));

import {
  approveAccountingCorrection, approveAccountingDocument, closeAccountingPeriod, ingestAccountingDocument,
  initializeAccounting, postAccountingDocument, readAccountingWorkbench, reconcileAccounting,
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

describe("Accounting GraphQL API", () => {
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
