import { beforeEach, describe, expect, it, vi } from "vitest";

const { useNivoMutation } = vi.hoisted(() => ({ useNivoMutation: vi.fn((_key, mutation, options) => ({ key: _key, mutation, options })) }));
vi.mock("../use-nivo-mutation", () => ({ useNivoMutation }));
vi.mock("@/modules/api/accounting", () => ({
  approveAccountingCorrection: vi.fn(), approveAccountingDocument: vi.fn(), closeAccountingPeriod: vi.fn(), ingestAccountingDocument: vi.fn(), initializeAccounting: vi.fn(), postAccountingDocument: vi.fn(), reconcileAccounting: vi.fn(), submitAccountingCorrection: vi.fn(), submitAccountingDocument: vi.fn()
}));

import { useMutateApproveAccountingCorrectionSwr, useMutateInitializeAccountingSwr, useMutateSubmitAccountingCorrectionSwr } from "./accounting";
import { accountingContextQueryKey, accountingWorkbenchQueryKey } from "../queries/accounting";

describe("Accounting mutation ownership", () => {
  beforeEach(() => useNivoMutation.mockClear());

  it("invalidates only current accounting projections after accepted initialize", () => {
    const hook = useMutateInitializeAccountingSwr("installation-1", "VND") as unknown as { readonly options: { readonly invalidates: unknown[]; readonly shouldInvalidate: (answer: { ok: boolean }) => boolean } };
    expect(hook.options.invalidates).toEqual([accountingContextQueryKey("installation-1"), accountingWorkbenchQueryKey("installation-1", "VND")]);
    expect(hook.options.shouldInvalidate({ ok: true })).toBe(true);
    expect(hook.options.shouldInvalidate({ ok: false })).toBe(false);
  });

  it("keeps submit and approval as separate press-local mutation identities", () => {
    const submit = useMutateSubmitAccountingCorrectionSwr("installation-1", "VND") as unknown as { readonly key: unknown };
    const approve = useMutateApproveAccountingCorrectionSwr("installation-1", "VND") as unknown as { readonly key: unknown };
    expect(submit.key).toEqual(["accounting", "correction-submit", "installation-1"]);
    expect(approve.key).toEqual(["accounting", "correction-approve", "installation-1"]);
    expect(submit.key).not.toEqual(approve.key);
  });
});
