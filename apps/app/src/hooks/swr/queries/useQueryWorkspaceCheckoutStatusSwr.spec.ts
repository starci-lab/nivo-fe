import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useNivoQuery: vi.fn((key: unknown, query: unknown) => ({ key, query })),
  api: { readWorkspaceCheckoutStatus: vi.fn(async () => ({ ok: true })) }
}));
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }));
vi.mock("@/modules/api/workspace-controlplane", () => mocks.api);

import { useQueryWorkspaceCheckoutStatusSwr, workspaceCheckoutStatusQueryKey } from "./useQueryWorkspaceCheckoutStatusSwr";

type ReadShape = { readonly key: unknown; readonly query: () => Promise<unknown> };

describe("useQueryWorkspaceCheckoutStatusSwr", () => {
  it("keys one purchase status read by the purchase identity alone", () => {
    expect(workspaceCheckoutStatusQueryKey("purchase-1")).toEqual(["workspace-checkout", "status", "purchase-1"]);
    expect(workspaceCheckoutStatusQueryKey("purchase-1")).not.toEqual(workspaceCheckoutStatusQueryKey("purchase-2"));
  });

  it("addresses nothing until a purchase identity is known", () => {
    expect((useQueryWorkspaceCheckoutStatusSwr("purchase-1", false) as unknown as ReadShape).key).toBeNull();
  });

  it("reads one purchase's composed truth through the boundary read", async () => {
    const hook = useQueryWorkspaceCheckoutStatusSwr("purchase-1") as unknown as ReadShape;

    await hook.query();

    expect(mocks.api.readWorkspaceCheckoutStatus).toHaveBeenCalledWith("purchase-1");
  });
});