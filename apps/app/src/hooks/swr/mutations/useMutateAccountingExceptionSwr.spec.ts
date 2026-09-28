import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useNivoMutation: vi.fn((key: unknown, mutation: unknown, options: unknown) => ({ key, mutation, options })),
  useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } })),
  api: { commandAccountingException: vi.fn(async () => ({ ok: true })) }
}));
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }));
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }));
vi.mock("@/modules/api/accounting", () => mocks.api);

import { useMutateAccountingExceptionSwr } from "./useMutateAccountingExceptionSwr";

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" };
const ANSWER = { action: "answer" as const, exceptionId: "exception-1", answer: { choiceCode: "recognize-now", suppliedFacts: [], reason: null }, answerEvidenceRefs: ["evidence-1"], expectedRevision: 4 };
const DEFER = { action: "defer" as const, exceptionId: "exception-1", reason: "waiting on the supplier", expectedRevision: 4 };
type MutationShape = { readonly key: unknown; readonly options: unknown; readonly mutation: (input: { readonly requestId: string; readonly input: typeof ANSWER | typeof DEFER }) => Promise<unknown> };

describe("useMutateAccountingExceptionSwr", () => {
  it("keeps the command on its installation-qualified identity and holds it while disabled", () => {
    expect((useMutateAccountingExceptionSwr(SCOPE) as unknown as MutationShape).key).toEqual(["accounting", "exception", "workspace-1", "instance-1", "installation-1"]);
    expect((useMutateAccountingExceptionSwr(SCOPE, false) as unknown as MutationShape).key).toBeNull();
  });

  it("sends an answer and a non-answer disposition as revision-fenced commands", async () => {
    const hook = useMutateAccountingExceptionSwr(SCOPE) as unknown as MutationShape;
    await hook.mutation({ requestId: "request-1", input: ANSWER });
    expect(mocks.api.commandAccountingException).toHaveBeenCalledWith("access-token", SCOPE, ANSWER, "request-1");
    await hook.mutation({ requestId: "request-2", input: DEFER });
    expect(mocks.api.commandAccountingException).toHaveBeenLastCalledWith("access-token", SCOPE, DEFER, "request-2");
  });

  it("registers no reconciliation read, because no read discloses an exception identity", () => {
    expect((useMutateAccountingExceptionSwr(SCOPE) as unknown as MutationShape).options).toBeUndefined();
  });
});