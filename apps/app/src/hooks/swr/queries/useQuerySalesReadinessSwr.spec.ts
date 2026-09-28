import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useNivoQuery: vi.fn((key: unknown, query: unknown) => ({ key, query })),
  useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } })),
  api: { readSalesReadiness: vi.fn(async () => ({ ok: true })) }
}));
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }));
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }));
vi.mock("@/modules/api/sales", () => mocks.api);

import { salesReadinessQueryKey, useQuerySalesReadinessSwr } from "./useQuerySalesReadinessSwr";

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" };
type ReadShape = { readonly key: unknown; readonly query: () => Promise<unknown> };

describe("useQuerySalesReadinessSwr", () => {
  it("keys one installation's readiness inside its own installation coordinates", () => {
    expect(salesReadinessQueryKey(SCOPE, { salesInstallationId: "installation-1" })).toEqual(["sales", "readiness", "workspace-1", "instance-1", "installation-1", "installation-1"]);
    expect(salesReadinessQueryKey(SCOPE, { salesInstallationId: "installation-1" }))
      .not.toEqual(salesReadinessQueryKey(SCOPE, { salesInstallationId: "installation-2" }));
  });

  it("addresses nothing while it is held or no session holds a token", () => {
    expect((useQuerySalesReadinessSwr(SCOPE, { salesInstallationId: "installation-1" }, false) as unknown as ReadShape).key).toBeNull();
    mocks.useSession.mockReturnValueOnce({ state: { status: "signed-out", accessToken: undefined } } as never);
    expect((useQuerySalesReadinessSwr(SCOPE, { salesInstallationId: "installation-1" }) as unknown as ReadShape).key).toBeNull();
  });

  it("reads readiness through its registered operation address", async () => {
    const hook = useQuerySalesReadinessSwr(SCOPE, { salesInstallationId: "installation-1" }) as unknown as ReadShape;
    await hook.query();
    expect(mocks.api.readSalesReadiness).toHaveBeenCalledWith("access-token", SCOPE, { salesInstallationId: "installation-1" }, "sales.readiness@1/installation-1/installation-1");
  });
});