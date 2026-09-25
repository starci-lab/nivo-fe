import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  api: {
    approveAccountingCorrection: vi.fn(),
    approveAccountingDocument: vi.fn(),
    closeAccountingPeriod: vi.fn(),
    ingestAccountingDocument: vi.fn(),
    initializeAccounting: vi.fn(),
    postAccountingDocument: vi.fn(),
    reconcileAccounting: vi.fn(),
    submitAccountingCorrection: vi.fn(),
    submitAccountingDocument: vi.fn()
  },
  useNivoMutation: vi.fn((key, mutation, options) => ({ key, mutation, options }))
}));

vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }));
vi.mock("@/modules/api/accounting", () => mocks.api);

import {
  useMutateApproveAccountingCorrectionSwr,
  useMutateApproveAccountingDocumentSwr,
  useMutateCloseAccountingPeriodSwr,
  useMutateIngestAccountingDocumentSwr,
  useMutateInitializeAccountingSwr,
  useMutatePostAccountingDocumentSwr,
  useMutateReconcileAccountingSwr,
  useMutateSubmitAccountingCorrectionSwr,
  useMutateSubmitAccountingDocumentSwr
} from "./accounting";
import { accountingContextQueryKey, accountingWorkbenchQueryKey } from "../queries/accounting";

type MutationHook = {
  readonly key: unknown;
  readonly mutation: (input: Record<string, unknown>) => unknown;
  readonly options: { readonly shouldInvalidate: (answer: { readonly ok: boolean }) => boolean };
};

describe("useMutateInitializeAccountingSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("invalidates only current accounting projections after accepted initialize", () => {
    const hook = useMutateInitializeAccountingSwr("installation-1", "VND") as unknown as { readonly options: { readonly invalidates: Array<unknown>; readonly shouldInvalidate: (answer: { ok: boolean }) => boolean } };
    expect(hook.options.invalidates).toEqual([accountingContextQueryKey("installation-1"), accountingWorkbenchQueryKey("installation-1", "VND")]);
    expect(hook.options.shouldInvalidate({ ok: true })).toBe(true);
    expect(hook.options.shouldInvalidate({ ok: false })).toBe(false);
  });
});

describe("useMutateSubmitAccountingCorrectionSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("keeps submit and approval as separate press-local mutation identities", () => {
    const submit = useMutateSubmitAccountingCorrectionSwr("installation-1", "VND") as unknown as { readonly key: unknown };
    const approve = useMutateApproveAccountingCorrectionSwr("installation-1", "VND") as unknown as { readonly key: unknown };
    expect(submit.key).toEqual(["accounting", "correction-submit", "installation-1"]);
    expect(approve.key).toEqual(["accounting", "correction-approve", "installation-1"]);
    expect(submit.key).not.toEqual(approve.key);
  });
});

describe("useMutateIngestAccountingDocumentSwr", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("routes every command through its installation-scoped API binding", () => {
    const cases = [
      [useMutateInitializeAccountingSwr, mocks.api.initializeAccounting, { currency: "VND", openingBalance: 0 }],
      [useMutateIngestAccountingDocumentSwr, mocks.api.ingestAccountingDocument, { fileName: "invoice.pdf", contentType: "application/pdf", contentBase64: "AA==" }],
      [useMutateSubmitAccountingDocumentSwr, mocks.api.submitAccountingDocument, { documentId: "doc-1" }],
      [useMutateApproveAccountingDocumentSwr, mocks.api.approveAccountingDocument, { documentId: "doc-1" }],
      [useMutatePostAccountingDocumentSwr, mocks.api.postAccountingDocument, { documentId: "doc-1" }],
      [useMutateReconcileAccountingSwr, mocks.api.reconcileAccounting, { sourceAmount: 10, ledgerAmount: 10 }],
      [useMutateCloseAccountingPeriodSwr, mocks.api.closeAccountingPeriod, { periodEnd: "2026-09-30" }],
      [useMutateSubmitAccountingCorrectionSwr, mocks.api.submitAccountingCorrection, { documentId: "doc-1", reason: "Fix" }],
      [useMutateApproveAccountingCorrectionSwr, mocks.api.approveAccountingCorrection, { correctionId: "correction-1" }]
    ] as const;

    for (const [useHook, api, input] of cases) {
      const hook = useHook("installation-1", "VND") as unknown as MutationHook;
      hook.mutation(input);
      expect(api).toHaveBeenCalledWith({ installationId: "installation-1", ...input });
      expect(hook.options.shouldInvalidate({ ok: true })).toBe(true);
      expect(hook.options.shouldInvalidate({ ok: false })).toBe(false);
    }
    expect(mocks.useNivoMutation).toHaveBeenCalledTimes(cases.length);
  });
});