import { act, cleanup, render, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { accountingQuery, contextQuery, runtimeQuery, mutationHooks } = vi.hoisted(() => ({
  accountingQuery: vi.fn(),
  contextQuery: vi.fn(),
  runtimeQuery: vi.fn(),
  mutationHooks: Array.from({ length: 9 }, () => vi.fn()),
}));

vi.mock("@/hooks/swr/queries/accounting", () => ({
  useQueryAccountingWorkbenchSwr: accountingQuery,
  useQueryAppliedAccountingContextSwr: contextQuery,
}));
vi.mock("@/hooks/swr/queries/console", () => ({ useQueryMyAgentosModuleRuntimeSwr: runtimeQuery }));
vi.mock("@/hooks/swr/mutations/accounting", () => ({
  useMutateInitializeAccountingSwr: mutationHooks[0],
  useMutateIngestAccountingDocumentSwr: mutationHooks[1],
  useMutateSubmitAccountingDocumentSwr: mutationHooks[2],
  useMutateApproveAccountingDocumentSwr: mutationHooks[3],
  useMutatePostAccountingDocumentSwr: mutationHooks[4],
  useMutateReconcileAccountingSwr: mutationHooks[5],
  useMutateCloseAccountingPeriodSwr: mutationHooks[6],
  useMutateSubmitAccountingCorrectionSwr: mutationHooks[7],
  useMutateApproveAccountingCorrectionSwr: mutationHooks[8],
}));
vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) => key,
}));

import { useAccountingWorkbench } from "./useAccountingWorkbench";
import { AccountingWorkbenchBlock } from ".";

const accepted = { ok: true, data: { operation: "submit-document" } } as const;
const readback = { ok: true, data: { capabilities: {}, ledger: [], documents: [], reconciliations: [], periods: [], corrections: [] } } as const;
const contextReadback = { ok: true, data: { versionId: "context-2", digest: "digest-2", snapshot: { accountingScope: { classifications: ["income", "expense"] }, currencyAndLocale: { functionalCurrency: "USD" } } } } as const;
const translate = (key: string, values?: Readonly<Record<string, string | number | undefined>>) => `${key}${values?.reason === undefined ? "" : `:${values.reason}`}`;
const event = { preventDefault: vi.fn() } as never;

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
};

describe("useAccountingWorkbench settlement", () => {
  let trigger: ReturnType<typeof vi.fn>;
  let mutateWorkbench: ReturnType<typeof vi.fn>;
  let mutateContext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    trigger = vi.fn().mockResolvedValue(accepted);
    mutateWorkbench = vi.fn().mockResolvedValue(readback);
    mutateContext = vi.fn().mockResolvedValue(contextReadback);
    accountingQuery.mockReturnValue({ data: readback, error: undefined, mutate: mutateWorkbench });
    contextQuery.mockReturnValue({ data: contextReadback, error: undefined, mutate: mutateContext });
    runtimeQuery.mockReturnValue({ data: { ok: true, data: { participants: [{ userId: "approver-1" }, { userId: "approver-1" }] } }, error: undefined, mutate: vi.fn() });
    mutationHooks.forEach(hook => hook.mockReturnValue({ isMutating: false, trigger }));
  });

  it("does not announce success until both owning readbacks settle", async () => {
    const workbench = deferred<typeof readback>();
    const context = deferred<typeof contextReadback>();
    mutateWorkbench.mockReturnValue(workbench.promise);
    mutateContext.mockReturnValue(context.promise);
    const { result } = renderHook(() => useAccountingWorkbench("module-1", "en", translate));

    act(() => result.current.documentCommand("submit", "document-1"));
    await waitFor(() => expect(trigger).toHaveBeenCalledOnce());
    expect(result.current.notice).toBeNull();
    await act(async () => { workbench.resolve(readback); await Promise.resolve(); });
    expect(result.current.notice).toBeNull();
    await act(async () => { context.resolve(contextReadback); await context.promise; });
    await waitFor(() => expect(result.current.notice).toEqual({ kind: "success", message: "operationAccepted" }));
    expect(mutateWorkbench).toHaveBeenCalledOnce();
    expect(mutateContext).toHaveBeenCalledOnce();
  });

  it("keeps command refusal distinct and performs no readback", async () => {
    trigger.mockResolvedValue({ ok: false, reason: "forbidden" });
    const { result } = renderHook(() => useAccountingWorkbench("module-1", "en", translate));
    act(() => result.current.documentCommand("approve", "document-1"));
    await waitFor(() => expect(result.current.notice).toEqual({ kind: "refused", message: "operationRefused:forbidden" }));
    expect(mutateWorkbench).not.toHaveBeenCalled();
    expect(mutateContext).not.toHaveBeenCalled();
  });

  it.each([
    ["workbench", undefined, contextReadback],
    ["context", readback, { ok: false, reason: "context-denied" }],
  ])("refuses success when the %s readback is not accepted", async (_name, workbenchAnswer, contextAnswer) => {
    mutateWorkbench.mockResolvedValue(workbenchAnswer);
    mutateContext.mockResolvedValue(contextAnswer);
    const { result } = renderHook(() => useAccountingWorkbench("module-1", "en", translate));
    act(() => result.current.approvePendingCorrection("correction-1"));
    await waitFor(() => expect(result.current.notice).toEqual({ kind: "refused", message: "transportError" }));
    expect(mutateWorkbench).toHaveBeenCalledOnce();
    expect(mutateContext).toHaveBeenCalledOnce();
  });

  it("turns a command transport exception into a recoverable refusal", async () => {
    trigger.mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useAccountingWorkbench("module-1", "en", translate));
    act(() => result.current.documentCommand("post", "document-1"));
    await waitFor(() => expect(result.current.notice).toEqual({ kind: "refused", message: "transportError" }));
  });

  it("reuses an idempotency token while the same refused command is retried", async () => {
    trigger.mockResolvedValue({ ok: false, reason: "temporarily-blocked" });
    const { result } = renderHook(() => useAccountingWorkbench("module-1", "en", translate));
    act(() => result.current.documentCommand("submit", "document-1"));
    await waitFor(() => expect(trigger).toHaveBeenCalledTimes(1));
    const firstToken = trigger.mock.calls[0][0].requestToken;
    act(() => result.current.documentCommand("submit", "document-1"));
    await waitFor(() => expect(trigger).toHaveBeenCalledTimes(2));
    expect(trigger.mock.calls[1][0].requestToken).toBe(firstToken);
  });

  it("exercises each public command route with valid business inputs", async () => {
    const { result } = renderHook(() => useAccountingWorkbench("module-1", "en", translate));
    act(() => {
      result.current.setApproverId("approver-1");
      result.current.setSourceAmount("100");
      result.current.setCloseMonth("2026-09");
    });
    act(() => result.current.onInitialize(event));
    act(() => result.current.onReconcile(event));
    act(() => result.current.onClose(event));
    act(() => result.current.documentCommand("submit", "document-1"));
    act(() => result.current.documentCommand("approve", "document-1"));
    act(() => result.current.documentCommand("post", "document-1"));
    act(() => result.current.approvePendingCorrection("correction-1"));
    await waitFor(() => expect(trigger.mock.calls.length).toBeGreaterThanOrEqual(7));
  });

  it("reports evidence-file read failure without retaining stale file facts", async () => {
    const { result } = renderHook(() => useAccountingWorkbench("module-1", "en", translate));
    const file = { name: "invoice.pdf", type: "application/pdf", size: 10, arrayBuffer: vi.fn().mockRejectedValue(new Error("unreadable")) } as unknown as File;
    await act(async () => result.current.onFileSelected(file));
    expect(result.current.notice).toEqual({ kind: "refused", message: "fileReadFailed" });
    expect(result.current.fileName).toBe("");
    expect(result.current.fileSize).toBe(0);
  });

  it("defaults an evidence file without a MIME type and ignores incomplete forms", async () => {
    const { result } = renderHook(() => useAccountingWorkbench("module-1", "en", translate));
    const file = { name: "evidence", type: "", size: 1, arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([1]).buffer) } as unknown as File;
    await act(async () => result.current.onFileSelected(file));
    act(() => {
      result.current.onIngest(event);
      result.current.onCorrection(event);
    });
    expect(trigger).not.toHaveBeenCalled();
    expect(result.current.fileName).toBe("evidence");
  });

  it("submits valid evidence and correction forms through their command paths", async () => {
    const modelWithLedger = {
      ...readback.data,
      capabilities: { viewerRole: "owner", canSubmitCorrection: true, canApproveCorrection: false },
      ledger: [{ id: "ledger-1", correctionOfId: null, documentId: "document-1", ledgerVersion: "1", periodKey: "2026-09-01", signedAmountMinor: "100", currency: "VND", kind: "document", reason: null, createdAt: "2026-09-06T00:00:00Z" }],
    };
    accountingQuery.mockReturnValue({ data: { ok: true, data: modelWithLedger }, error: undefined, mutate: mutateWorkbench });
    const { result } = renderHook(() => useAccountingWorkbench("module-1", "en", translate));
    const file = { name: "invoice.pdf", type: "application/pdf", size: 4, arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]).buffer) } as unknown as File;
    await act(async () => result.current.onFileSelected(file));
    act(() => {
      result.current.setDocumentAmount("100");
      result.current.setDocumentMonth("2026-09");
      result.current.setSourceEntryId("ledger-1");
      result.current.setEffectiveMonth("2026-10");
      result.current.setDeltaAmount("-50");
      result.current.setCorrectionReason("late evidence");
    });
    act(() => result.current.onIngest(event));
    act(() => result.current.onCorrection(event));
    await waitFor(() => expect(trigger.mock.calls.length).toBeGreaterThanOrEqual(2));
    expect(trigger.mock.calls.find(call => call[0].fileName === "invoice.pdf")?.[0]).toMatchObject({ currency: "USD", classification: "expense" });
    expect(result.current.correctionAccess({ status: "pending", effectivePeriodKey: "2026-10-01", submittedByUserId: "owner-1", approverUserId: "approver-1" } as never).approvalReason).toBe("not-owner");
  });

  it("does not send document intake when the applied Setup intake policy is invalid", async () => {
    contextQuery.mockReturnValue({ data: { ok: true, data: { versionId: "context-2", digest: "digest-2", snapshot: {} } }, error: undefined, mutate: mutateContext });
    const { result } = renderHook(() => useAccountingWorkbench("module-1", "en", translate));
    const file = { name: "invoice.pdf", type: "application/pdf", size: 1, arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([1]).buffer) } as unknown as File;
    await act(async () => result.current.onFileSelected(file));
    act(() => { result.current.setDocumentAmount("100"); result.current.setDocumentMonth("2026-09"); });
    act(() => result.current.onIngest(event));
    expect(result.current.intakeReady).toBe(false);
    expect(trigger).not.toHaveBeenCalled();
  });

  it("connects the installed block through locale and translation owners", () => {
    const { container } = render(<AccountingWorkbenchBlock moduleId="module-1" kindKey="accounting" workbenchVersion="1" />);
    expect(container.querySelector('[data-contract="GAP-5 MEASURE-2"]')).not.toBeNull();
  });
});
