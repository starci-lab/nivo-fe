import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useNivoMutation: vi.fn((key: unknown, mutation: unknown, options: unknown) => ({ key, mutation, options })),
  useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } })),
  api: { commandAccountingRoutine: vi.fn(async () => ({ ok: true })) }
}));
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }));
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }));
vi.mock("@/modules/api/accounting", () => mocks.api);

import { accountingRoutineResultQueryKey } from "../queries/useQueryAccountingRoutineResultSwr";
import { useMutateAccountingRoutineSwr } from "./useMutateAccountingRoutineSwr";

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" };
const COMMIT = { action: "commit" as const, itemId: "item-1", evidenceIds: ["evidence-1"], intentId: "intent-1", policyRevision: "policy-7", expectedItemRevision: 3 };
const RETRY = { action: "retry" as const, intentId: "intent-1", oldAttemptId: "attempt-1", notStartedProofRef: "proof-1", newAttemptId: "attempt-2" };
type MutationShape = {
  readonly key: unknown;
  readonly options: { readonly invalidates: (trigger: { readonly input: typeof COMMIT | typeof RETRY }, answer: unknown) => ReadonlyArray<unknown>; readonly shouldInvalidate: (answer: { readonly ok: boolean; readonly code?: string }) => boolean };
  readonly mutation: (input: { readonly requestId: string; readonly input: typeof COMMIT | typeof RETRY }) => Promise<unknown>;
};

describe("useMutateAccountingRoutineSwr", () => {
  it("keeps the command on its installation-qualified identity and holds it while disabled", () => {
    expect((useMutateAccountingRoutineSwr(SCOPE) as unknown as MutationShape).key).toEqual(["accounting", "routine", "workspace-1", "instance-1", "installation-1"]);
    expect((useMutateAccountingRoutineSwr(SCOPE, false) as unknown as MutationShape).key).toBeNull();
  });

  it("sends a commit and a proof-referenced retry through the same routine address", async () => {
    const hook = useMutateAccountingRoutineSwr(SCOPE) as unknown as MutationShape;
    await hook.mutation({ requestId: "request-1", input: COMMIT });
    expect(mocks.api.commandAccountingRoutine).toHaveBeenCalledWith("access-token", SCOPE, COMMIT, "request-1");
    await hook.mutation({ requestId: "request-2", input: RETRY });
    expect(mocks.api.commandAccountingRoutine).toHaveBeenLastCalledWith("access-token", SCOPE, RETRY, "request-2");
  });

  it("refreshes only the intent the press names, and only when the effect may exist", () => {
    const hook = useMutateAccountingRoutineSwr(SCOPE) as unknown as MutationShape;
    expect(hook.options.invalidates({ input: RETRY }, { ok: true })).toEqual([accountingRoutineResultQueryKey(SCOPE, { intentId: "intent-1" })]);
    expect(hook.options.shouldInvalidate({ ok: false, code: "outcome_unknown" })).toBe(true);
    expect(hook.options.shouldInvalidate({ ok: false, code: "validation" })).toBe(false);
  });
});