import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useNivoQuery: vi.fn((key: unknown, query: unknown) => ({ key, query })),
  useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } })),
  api: { readSalesAction: vi.fn(async () => ({ ok: true })) }
}));
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }));
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }));
vi.mock("@/modules/api/sales", () => mocks.api);

import { salesActionQueryKey, useQuerySalesActionSwr } from "./useQuerySalesActionSwr";

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" };
type ReadShape = { readonly key: unknown; readonly query: () => Promise<unknown> };

describe("useQuerySalesActionSwr", () => {
  it("keys one action inside one installation, never across installations", () => {
    expect(salesActionQueryKey(SCOPE, { actionId: "action-1" })).toEqual(["sales", "action", "workspace-1", "instance-1", "installation-1", "action-1"]);
    expect(salesActionQueryKey(SCOPE, { actionId: "action-1" }))
      .not.toEqual(salesActionQueryKey({ ...SCOPE, installationId: "installation-2" }, { actionId: "action-1" }));
  });

  it("addresses nothing while it is held or no session holds a token", () => {
    expect((useQuerySalesActionSwr(SCOPE, { actionId: "action-1" }, false) as unknown as ReadShape).key).toBeNull();
    mocks.useSession.mockReturnValueOnce({ state: { status: "signed-out", accessToken: undefined } } as never);
    expect((useQuerySalesActionSwr(SCOPE, { actionId: "action-1" }) as unknown as ReadShape).key).toBeNull();
  });

  it("reads the action that discloses the stored state a recovery door needs", async () => {
    const hook = useQuerySalesActionSwr(SCOPE, { actionId: "action-1" }) as unknown as ReadShape;
    await hook.query();
    expect(mocks.api.readSalesAction).toHaveBeenCalledWith("access-token", SCOPE, { actionId: "action-1" }, "sales.action@1/installation-1/action-1");
  });
});