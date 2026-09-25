import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useNivoQuery: vi.fn((key: unknown, query: unknown) => ({ key, query })),
  useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } })),
  api: { readSalesDecisionRequest: vi.fn(async () => ({ ok: true })) }
}));
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }));
vi.mock("@/modules/auth/session", () => ({ useSession: mocks.useSession }));
vi.mock("@/modules/api/sales", () => mocks.api);

import { salesDecisionRequestQueryKey, useQuerySalesDecisionRequestSwr } from "./useQuerySalesDecisionRequestSwr";

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" };
type ReadShape = { readonly key: unknown; readonly query: () => Promise<unknown> };

describe("useQuerySalesDecisionRequestSwr", () => {
  it("keys one decision request inside one installation, never across installations", () => {
    expect(salesDecisionRequestQueryKey(SCOPE, { decisionRequestId: "decision-1" })).toEqual(["sales", "decision-request", "workspace-1", "instance-1", "installation-1", "decision-1"]);
    expect(salesDecisionRequestQueryKey(SCOPE, { decisionRequestId: "decision-1" }))
      .not.toEqual(salesDecisionRequestQueryKey({ ...SCOPE, installationId: "installation-2" }, { decisionRequestId: "decision-1" }));
  });

  it("addresses nothing while it is held or no session holds a token", () => {
    expect((useQuerySalesDecisionRequestSwr(SCOPE, { decisionRequestId: "decision-1" }, false) as unknown as ReadShape).key).toBeNull();
    mocks.useSession.mockReturnValueOnce({ state: { status: "signed-out", accessToken: undefined } } as never);
    expect((useQuerySalesDecisionRequestSwr(SCOPE, { decisionRequestId: "decision-1" }) as unknown as ReadShape).key).toBeNull();
  });

  it("settles an answer from the decision request's own committed state", async () => {
    const hook = useQuerySalesDecisionRequestSwr(SCOPE, { decisionRequestId: "decision-1" }) as unknown as ReadShape;
    await hook.query();
    expect(mocks.api.readSalesDecisionRequest).toHaveBeenCalledWith("access-token", SCOPE, { decisionRequestId: "decision-1" }, "sales.decisionRequest@1/installation-1/decision-1");
  });
});