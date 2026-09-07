import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AccountingWorkbenchBlockBase } from "./component";

const noop = vi.fn();
const idle = { isMutating: false };
const document = (status: string, id = status) => ({ id, fileName: `${status}.pdf`, classification: "expense", amountMinor: "1250000", currency: "VND", periodKey: "2026-09-01", status, contextVersionId: "context-1", contextDigest: "digest-1" });
const ledger = { id: "ledger-1", documentId: "posted", correctionOfId: null, ledgerVersion: "7", periodKey: "2026-09-01", signedAmountMinor: "1250000", currency: "VND", kind: "document", reason: "posted", createdAt: "2026-09-06T00:00:00Z" };
const correction = { id: "correction-1", sourceEntryId: "ledger-1", effectivePeriodKey: "2026-10-01", signedDeltaMinor: "-50000", currency: "VND", reason: "late adjustment", status: "pending", submittedByUserId: "owner-1", approverUserId: "approver-1", approvedByUserId: null, version: "1", approvedLedgerId: null, createdAt: "2026-09-06T00:00:00Z", approvedAt: null };
const model = {
  installationId: "module-1", currency: "VND", ledgerVersion: "7", ledgerAmountMinor: "1250000",
  capabilities: { viewerRole: "owner", canSubmitCorrection: true, canApproveCorrection: false, reason: "allowed" },
  documents: [document("draft"), document("submitted"), document("approved"), document("posted")], ledger: [ledger],
  periods: [{ periodKey: "2026-10-01", status: "open", version: "1", closedAt: null }],
  reconciliations: [{ id: "reconciliation-1", ledgerVersionH: "7", currency: "VND", sourceAmountMinor: "1200000", ledgerAmountMinor: "1250000", differenceMinor: "-50000", createdAt: "2026-09-06T00:00:00Z" }],
  corrections: [correction], events: [],
};
const answer = { ok: true, data: model } as const;
const contextAnswer = { ok: true, data: { installationId: "module-1", versionId: "context-1", digest: "digest-1", snapshot: {} } } as const;
const translate = (key: string, values?: Readonly<Record<string, string | number | undefined>>) => `${key}${values === undefined ? "" : ` ${Object.values(values).join(" ")}`}`;

const view = (overrides: Record<string, unknown> = {}) => ({
  t: translate, locale: "en", currency: "VND", classifications: ["income", "expense", "receivable", "payable"], intakeReady: true, intakeLoading: false, asOfDraft: "", setAsOfDraft: noop, ledgerVersion: undefined, setLedgerVersion: noop,
  notice: null, approverId: "", setApproverId: noop, fileName: "", fileSize: 0, classification: "expense", setClassification: noop,
  documentAmount: "", setDocumentAmount: noop, documentMonth: "", setDocumentMonth: noop, sourceAmount: "", setSourceAmount: noop,
  closeMonth: "", setCloseMonth: noop, sourceEntryId: "", setSourceEntryId: noop, effectiveMonth: "", setEffectiveMonth: noop,
  deltaAmount: "", setDeltaAmount: noop, correctionReason: "", setCorrectionReason: noop,
  workbench: { data: answer, error: undefined, mutate: vi.fn() }, context: { data: contextAnswer, error: undefined, mutate: vi.fn() },
  runtime: { data: undefined, error: undefined, mutate: vi.fn() }, participantUserIds: [], initialize: idle, ingest: idle,
  submitDocument: idle, approveDocument: idle, postDocument: idle, reconcile: idle, close: idle, submitCorrection: idle, approveCorrection: idle,
  answer, model, role: "owner", isAsOf: false, correctionSubmitAllowed: true, pendingCorrections: [correction], eligibleSourceEntries: [ledger],
  sourceEntryEligible: false, documentAmountMinor: null, sourceAmountMinor: null, deltaAmountMinor: null,
  onFileSelected: noop, onInitialize: noop, onIngest: noop, onReconcile: noop, reconcileCurrent: noop, onClose: noop, onCorrection: noop, submitCurrentCorrection: noop,
  documentCommand: vi.fn(), correctionAccess: vi.fn(() => ({ submit: true, approve: false, approvalReason: "not-owner" })), approvePendingCorrection: vi.fn(),
  ...overrides,
}) as never;

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("AccountingWorkbenchBlock adverse states", () => {
  it("keeps the complete tree mounted and marks loading as busy", () => {
    const loading = view({ answer: undefined, model: undefined, role: undefined, pendingCorrections: [], eligibleSourceEntries: [], workbench: { data: undefined, error: undefined, mutate: vi.fn() }, context: { data: undefined, error: undefined, mutate: vi.fn() } });
    const { container } = render(<AccountingWorkbenchBlockBase view={loading} />);
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.getByText("statementSnapshot")).toBeTruthy();
  });

  it("announces a command refusal assertively", () => {
    const { container } = render(<AccountingWorkbenchBlockBase view={view({ notice: { kind: "refused", message: "permission denied" } })} />);
    expect(container.querySelector('[aria-live="assertive"]')?.textContent).toContain("permission denied");
  });

  it("wraps workbench transport failure in an alert and retries the owning read", () => {
    const mutate = vi.fn();
    render(<AccountingWorkbenchBlockBase view={view({ workbench: { data: undefined, error: new Error("offline"), mutate }, answer: undefined, model: undefined })} />);
    expect(screen.getByRole("alert")).toBeTruthy();
    fireEvent.click(screen.getByText("retry"));
    expect(mutate).toHaveBeenCalledOnce();
  });

  it("wraps refused workbench reads in an alert and retries", () => {
    const mutate = vi.fn();
    render(<AccountingWorkbenchBlockBase view={view({ workbench: { data: { ok: false, reason: "forbidden" }, error: undefined, mutate }, answer: { ok: false, reason: "forbidden" }, model: undefined })} />);
    expect(screen.getByRole("alert").textContent).toContain("readRefused forbidden");
    fireEvent.click(screen.getByText("retry"));
    expect(mutate).toHaveBeenCalledOnce();
  });

  it("gives applied-context transport failure its own alert and retry", () => {
    const mutate = vi.fn();
    render(<AccountingWorkbenchBlockBase view={view({ context: { data: undefined, error: new Error("offline"), mutate } })} />);
    expect(screen.getByRole("alert")).toBeTruthy();
    fireEvent.click(screen.getByText("retry"));
    expect(mutate).toHaveBeenCalledOnce();
  });

  it("announces an applied-context permission refusal assertively", () => {
    const { container } = render(<AccountingWorkbenchBlockBase view={view({ context: { data: { ok: false, reason: "forbidden" }, error: undefined, mutate: vi.fn() } })} />);
    expect(container.querySelector('[aria-live="assertive"]')?.textContent).toContain("readRefused forbidden");
  });

  it("renders loaded business facts and dispatches owner document actions", () => {
    const documentCommand = vi.fn();
    const { container } = render(<AccountingWorkbenchBlockBase view={view({ documentCommand })} />);
    expect(screen.getByText("appliedSetup")).toBeTruthy();
    expect(screen.getByText("ledgerBalance")).toBeTruthy();
    expect(container.querySelector("#accounting-classification")?.className).toContain("min-h-11");
    expect(container.querySelector("#accounting-document-month")?.className).toContain("min-h-11");
    expect(screen.getByRole("button", { name: "chooseEvidenceFile" }).className).toContain("button--lg");
    expect(screen.getByRole("button", { name: "addDocument" }).className).toContain("button--lg");
    expect(screen.getByRole("button", { name: "closePeriodAction" }).className).toContain("button--lg");
    expect(screen.getByRole("button", { name: "submitCorrection" }).className).toContain("button--lg");
    expect(screen.getByText("draft.pdf")).toBeTruthy();
    expect(screen.getByText("late adjustment")).toBeTruthy();
    expect(screen.getByText(/reconciliationDifference/)).toBeTruthy();
    fireEvent.click(screen.getByText("submitDocument"));
    fireEvent.click(screen.getByText("postDocument"));
    expect(documentCommand).toHaveBeenCalledWith("submit", "draft");
    expect(documentCommand).toHaveBeenCalledWith("post", "approved");
  });

  it("dispatches approver document and correction actions", () => {
    const documentCommand = vi.fn();
    const approvePendingCorrection = vi.fn();
    const approverModel = { ...model, capabilities: { ...model.capabilities, viewerRole: "approver", canSubmitCorrection: false, canApproveCorrection: true } };
    render(<AccountingWorkbenchBlockBase view={view({ answer: { ok: true, data: approverModel }, model: approverModel, role: "approver", correctionSubmitAllowed: false, documentCommand, correctionAccess: vi.fn(() => ({ submit: false, approve: true, approvalReason: "allowed" })), approvePendingCorrection })} />);
    fireEvent.click(screen.getByText("approveDocument"));
    fireEvent.click(screen.getByText("approveCorrection"));
    expect(documentCommand).toHaveBeenCalledWith("approve", "submitted");
    expect(approvePendingCorrection).toHaveBeenCalledWith("correction-1");
  });

  it("dispatches reconciliation and correction commands from explicit button presses", () => {
    const reconcileCurrent = vi.fn();
    const submitCurrentCorrection = vi.fn();
    render(<AccountingWorkbenchBlockBase view={view({ sourceAmount: "-1,250,000", sourceAmountMinor: "-1250000", sourceEntryId: "ledger-1", sourceEntryEligible: true, effectiveMonth: "2026-10", deltaAmount: "-50,000", deltaAmountMinor: "-50000", correctionReason: "late adjustment", reconcileCurrent, submitCurrentCorrection })} />);
    fireEvent.click(screen.getByRole("button", { name: "reconcile" }));
    fireEvent.click(screen.getByRole("button", { name: "submitCorrection" }));
    expect(reconcileCurrent).toHaveBeenCalledOnce();
    expect(submitCurrentCorrection).toHaveBeenCalledOnce();
  });

  it("forwards native controls, historical navigation, file choice and setup recovery", () => {
    const setLedgerVersion = vi.fn();
    const setAsOfDraft = vi.fn();
    const setClassification = vi.fn();
    const setDocumentMonth = vi.fn();
    const setCloseMonth = vi.fn();
    const setSourceEntryId = vi.fn();
    const setEffectiveMonth = vi.fn();
    const onFileSelected = vi.fn();
    const first = render(<AccountingWorkbenchBlockBase view={view({ asOfDraft: "7", setLedgerVersion, setAsOfDraft, setClassification, setDocumentMonth, setCloseMonth, setSourceEntryId, setEffectiveMonth, onFileSelected })} />);
    fireEvent.click(screen.getByText("viewAsOf"));
    fireEvent.change(first.container.querySelector("#accounting-classification")!, { target: { value: "income" } });
    fireEvent.change(first.container.querySelector("#accounting-document-month")!, { target: { value: "2026-09" } });
    fireEvent.change(first.container.querySelector("#accounting-close-month")!, { target: { value: "2026-10" } });
    fireEvent.change(first.container.querySelector("#accounting-source-entry")!, { target: { value: "ledger-1" } });
    fireEvent.change(first.container.querySelector("#accounting-effective-month")!, { target: { value: "2026-10" } });
    fireEvent.change(first.container.querySelector('input[type="file"]')!, { target: { files: [new File(["evidence"], "invoice.pdf", { type: "application/pdf" })] } });
    expect(setLedgerVersion).toHaveBeenCalledWith("7");
    expect(onFileSelected).toHaveBeenCalledOnce();
    expect(setClassification).toHaveBeenCalledWith("income");
    first.unmount();

    render(<AccountingWorkbenchBlockBase view={view({ ledgerVersion: "7", isAsOf: true, setLedgerVersion, setAsOfDraft })} />);
    fireEvent.click(screen.getByText("returnCurrent"));
    expect(setLedgerVersion).toHaveBeenCalledWith(undefined);
    expect(setAsOfDraft).toHaveBeenCalledWith("");
    cleanup();

    const mutateRuntime = vi.fn();
    render(<AccountingWorkbenchBlockBase view={view({ answer: undefined, model: undefined, role: undefined, participantUserIds: [], workbench: { data: undefined, error: undefined, mutate: vi.fn() }, runtime: { data: undefined, error: new Error("offline"), mutate: mutateRuntime } })} />);
    fireEvent.click(screen.getByText("retry"));
    expect(mutateRuntime).toHaveBeenCalledOnce();
    cleanup();

    const setApproverId = vi.fn();
    const participantRuntime = { ok: true, data: { participants: [{ userId: "approver-1" }] } };
    const last = render(<AccountingWorkbenchBlockBase view={view({ answer: undefined, model: undefined, role: undefined, participantUserIds: ["approver-1"], workbench: { data: undefined, error: undefined, mutate: vi.fn() }, runtime: { data: participantRuntime, error: undefined, mutate: vi.fn() }, setApproverId })} />);
    fireEvent.change(last.container.querySelector("#accounting-approver")!, { target: { value: "approver-1" } });
    expect(setApproverId).toHaveBeenCalledWith("approver-1");
  });
});
