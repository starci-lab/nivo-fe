import { beforeEach, describe, expect, it, vi } from "vitest";

const { useSWRMutation, signOut } = vi.hoisted(() => ({
  useSWRMutation: vi.fn((key: unknown, mutation: unknown) => ({ key, mutation })),
  signOut: vi.fn()
}));
vi.mock("swr/mutation", () => ({ default: useSWRMutation }));
vi.mock("@/modules/api/auth", () => ({ signOut }));

import { useMutateSignOutSwr } from "./useMutateSignOutSwr";

type HookShape = {
  readonly key: unknown;
  readonly mutation: (key: unknown, trigger: { readonly arg: unknown }) => Promise<unknown>;
};

describe("useMutateSignOutSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("keeps sign-out on its own signed-out authentication command identity", () => {
    const hook = useMutateSignOutSwr() as unknown as HookShape;
    expect(hook.key).toEqual(["NIVO_AUTH_MUTATION", "sign-out"]);
  });

  it("returns the whole sign-out envelope, siblings included, instead of unwrapping its payload", async () => {
    const envelope = { ok: true, data: true, remoteRevocationObserved: false, authorityEndingConfirmed: true };
    signOut.mockResolvedValue(envelope);
    const hook = useMutateSignOutSwr() as unknown as HookShape;
    const trigger = { arg: { scope: "everywhere" } };
    const settled = await hook.mutation(undefined, trigger);
    expect(signOut).toHaveBeenCalledWith(trigger.arg);
    expect(settled).toBe(envelope);
    expect(settled).toMatchObject({ remoteRevocationObserved: false, authorityEndingConfirmed: true });
  });
});