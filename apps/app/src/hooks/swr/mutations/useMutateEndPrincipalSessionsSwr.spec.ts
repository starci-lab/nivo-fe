import { beforeEach, describe, expect, it, vi } from "vitest";

const { useSWRMutation, endPrincipalSessions } = vi.hoisted(() => ({
  useSWRMutation: vi.fn((key: unknown, mutation: unknown) => ({ key, mutation })),
  endPrincipalSessions: vi.fn()
}));
vi.mock("swr/mutation", () => ({ default: useSWRMutation }));
vi.mock("@/modules/api/auth", () => ({ endPrincipalSessions }));

import { useMutateEndPrincipalSessionsSwr } from "./useMutateEndPrincipalSessionsSwr";

type HookShape = {
  readonly key: unknown;
  readonly mutation: (key: unknown, trigger: { readonly arg: unknown }) => Promise<unknown>;
};

describe("useMutateEndPrincipalSessionsSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("keeps the administrator session ending on its own session-lifecycle command identity", () => {
    const hook = useMutateEndPrincipalSessionsSwr() as unknown as HookShape;
    expect(hook.key).toEqual(["NIVO_AUTH_MUTATION", "end-principal-sessions"]);
  });

  it("hands the request identity, the named principal and the authority context to the transport and returns its answer unchanged", async () => {
    const answer = { ok: true, data: { kind: "undecided", authorityEndingConfirmed: null } };
    endPrincipalSessions.mockResolvedValue(answer);
    const hook = useMutateEndPrincipalSessionsSwr() as unknown as HookShape;
    const trigger = { arg: { requestId: "ending-7", targetPrincipal: "linh@nivo.vn", workspaceId: "ws-support" } };
    const settled = await hook.mutation(undefined, trigger);
    expect(endPrincipalSessions).toHaveBeenCalledTimes(1);
    expect(endPrincipalSessions).toHaveBeenCalledWith(trigger.arg);
    expect(settled).toBe(answer);
  });
});