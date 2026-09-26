import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useNivoMutation: vi.fn((key: unknown, mutation: unknown, options: unknown) => ({ key, mutation, options })),
  api: { recoverWorkspacePurchase: vi.fn(async () => ({ ok: true })), readWorkspaceCheckoutStatus: vi.fn(async () => ({ ok: true })) }
}));
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }));
vi.mock("@/modules/api/workspace-controlplane", () => mocks.api);

import { workspaceCheckoutStatusQueryKey } from "../queries/useQueryWorkspaceCheckoutStatusSwr";
import { useMutateRecoverWorkspacePurchaseSwr } from "./useMutateRecoverWorkspacePurchaseSwr";

const RECOVER = { purchaseId: "purchase-1", lastObserved: { paymentAttemptId: "attempt-1", providerReference: "vnpay-tx-1" } } as const;
type RecoverShape = {
  readonly key: unknown;
  readonly mutation: (request: typeof RECOVER) => Promise<unknown>;
  readonly options: { readonly invalidates: (request: typeof RECOVER, answer: { readonly ok: boolean }) => ReadonlyArray<unknown> };
};

describe("useMutateRecoverWorkspacePurchaseSwr", () => {
  it("keeps the recovery on its own press-local identity", () => {
    expect((useMutateRecoverWorkspacePurchaseSwr() as unknown as RecoverShape).key).toEqual(["workspace-checkout", "recover"]);
  });

  it("reconciles through the boundary command with the observed identities unchanged", async () => {
    const hook = useMutateRecoverWorkspacePurchaseSwr() as unknown as RecoverShape;

    await hook.mutation(RECOVER);

    expect(mocks.api.recoverWorkspacePurchase).toHaveBeenCalledWith(RECOVER);
  });

  it("refreshes the purchase the recovery named, whatever the answer says", () => {
    const hook = useMutateRecoverWorkspacePurchaseSwr() as unknown as RecoverShape;

    expect(hook.options.invalidates(RECOVER, { ok: true })).toEqual([workspaceCheckoutStatusQueryKey("purchase-1")]);
    expect(hook.options.invalidates(RECOVER, { ok: false })).toEqual([workspaceCheckoutStatusQueryKey("purchase-1")]);
  });
});