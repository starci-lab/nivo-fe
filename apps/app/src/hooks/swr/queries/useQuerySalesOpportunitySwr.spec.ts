import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useNivoQuery: vi.fn((key: unknown, query: unknown) => ({ key, query })),
  useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } })),
  api: { readSalesOpportunity: vi.fn(async () => ({ ok: true })) }
}));
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }));
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }));
vi.mock("@/modules/api/sales", () => mocks.api);

import { salesOpportunityQueryKey, useQuerySalesOpportunitySwr } from "./useQuerySalesOpportunitySwr";

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" };
type ReadShape = { readonly key: unknown; readonly query: () => Promise<unknown> };

describe("useQuerySalesOpportunitySwr", () => {
  it("keys one opportunity inside one installation, never across installations", () => {
    expect(salesOpportunityQueryKey(SCOPE, { opportunityId: "opportunity-1" })).toEqual(["sales", "opportunity", "workspace-1", "instance-1", "installation-1", "opportunity-1"]);
    expect(salesOpportunityQueryKey(SCOPE, { opportunityId: "opportunity-1" }))
      .not.toEqual(salesOpportunityQueryKey({ ...SCOPE, installationId: "installation-2" }, { opportunityId: "opportunity-1" }));
  });

  it("addresses nothing while it is held or no session holds a token", () => {
    expect((useQuerySalesOpportunitySwr(SCOPE, { opportunityId: "opportunity-1" }, false) as unknown as ReadShape).key).toBeNull();
    mocks.useSession.mockReturnValueOnce({ state: { status: "signed-out", accessToken: undefined } } as never);
    expect((useQuerySalesOpportunitySwr(SCOPE, { opportunityId: "opportunity-1" }) as unknown as ReadShape).key).toBeNull();
  });

  it("reads one opportunity under the address that names it", async () => {
    const hook = useQuerySalesOpportunitySwr(SCOPE, { opportunityId: "opportunity-1" }) as unknown as ReadShape;
    await hook.query();
    expect(mocks.api.readSalesOpportunity).toHaveBeenCalledWith("access-token", SCOPE, { opportunityId: "opportunity-1" }, "sales.opportunity@1/installation-1/opportunity-1");
  });
});