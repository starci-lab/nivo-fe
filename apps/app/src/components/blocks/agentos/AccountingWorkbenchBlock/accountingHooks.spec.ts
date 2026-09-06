import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  api: {
    approveAccountingCorrection: vi.fn(),
    approveAccountingDocument: vi.fn(),
    closeAccountingPeriod: vi.fn(),
    ingestAccountingDocument: vi.fn(),
    initializeAccounting: vi.fn(),
    postAccountingDocument: vi.fn(),
    readAccountingWorkbench: vi.fn(),
    reconcileAccounting: vi.fn(),
    resolveAppliedAccountingContext: vi.fn(),
    submitAccountingCorrection: vi.fn(),
    submitAccountingDocument: vi.fn()
  },
  useNivoMutation: vi.fn((key, mutation, options) => ({ key, mutation, options })),
  useNivoQuery: vi.fn((key, query) => ({ key, query }))
}));

vi.mock("@/modules/api/accounting", () => mocks.api);
vi.mock("@/hooks/swr/use-nivo-mutation", () => ({ useNivoMutation: mocks.useNivoMutation }));
vi.mock("@/hooks/swr/use-nivo-query", () => ({ useNivoQuery: mocks.useNivoQuery }));

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
} from "@/hooks/swr/mutations/accounting";
import {
  accountingContextQueryKey,
  accountingWorkbenchQueryKey,
  useQueryAccountingWorkbenchSwr,
  useQueryAppliedAccountingContextSwr
} from "@/hooks/swr/queries/accounting";

type MutationHook = {
  readonly key: unknown;
  readonly mutation: (input: Record<string, unknown>) => unknown;
  readonly options: { readonly shouldInvalidate: (answer: { readonly ok: boolean }) => boolean };
};

describe("Accounting SWR hook bindings", () => {
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

  it("routes current and historical reads through the correct cache identities", () => {
    const context = useQueryAppliedAccountingContextSwr("installation-1") as unknown as { readonly key: unknown; readonly query: () => unknown };
    const current = useQueryAccountingWorkbenchSwr("installation-1", "VND") as unknown as { readonly key: unknown; readonly query: () => unknown };
    const historical = useQueryAccountingWorkbenchSwr("installation-1", "VND", "7") as unknown as { readonly key: unknown; readonly query: () => unknown };

    context.query();
    current.query();
    historical.query();

    expect(context.key).toEqual(accountingContextQueryKey("installation-1"));
    expect(current.key).toEqual(accountingWorkbenchQueryKey("installation-1", "VND"));
    expect(historical.key).toEqual(accountingWorkbenchQueryKey("installation-1", "VND", "7"));
    expect(mocks.api.resolveAppliedAccountingContext).toHaveBeenCalledWith("installation-1");
    expect(mocks.api.readAccountingWorkbench).toHaveBeenNthCalledWith(1, "installation-1", "VND", undefined);
    expect(mocks.api.readAccountingWorkbench).toHaveBeenNthCalledWith(2, "installation-1", "VND", "7");
  });
});
