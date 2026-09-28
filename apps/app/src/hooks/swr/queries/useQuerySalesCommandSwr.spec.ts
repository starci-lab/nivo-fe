import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useNivoQuery: vi.fn((key: unknown, query: unknown) => ({ key, query })),
  useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } })),
  api: { readSalesCommand: vi.fn(async () => ({ ok: true })) }
}));
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }));
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }));
vi.mock("@/modules/api/sales", () => mocks.api);

import { salesCommandQueryKey, useQuerySalesCommandSwr } from "./useQuerySalesCommandSwr";

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" };
type ReadShape = { readonly key: unknown; readonly query: () => Promise<unknown> };

describe("useQuerySalesCommandSwr", () => {
  it("keys one command plan inside one installation, never across installations", () => {
    expect(salesCommandQueryKey(SCOPE, { commandId: "command-1" })).toEqual(["sales", "command", "workspace-1", "instance-1", "installation-1", "command-1"]);
    expect(salesCommandQueryKey(SCOPE, { commandId: "command-1" }))
      .not.toEqual(salesCommandQueryKey({ ...SCOPE, installationId: "installation-2" }, { commandId: "command-1" }));
  });

  it("addresses nothing while it is held or no session holds a token", () => {
    expect((useQuerySalesCommandSwr(SCOPE, { commandId: "command-1" }, false) as unknown as ReadShape).key).toBeNull();
    mocks.useSession.mockReturnValueOnce({ state: { status: "signed-out", accessToken: undefined } } as never);
    expect((useQuerySalesCommandSwr(SCOPE, { commandId: "command-1" }) as unknown as ReadShape).key).toBeNull();
  });

  it("reconciles a press by reading the same command identity, never a second one", async () => {
    const hook = useQuerySalesCommandSwr(SCOPE, { commandId: "command-1" }) as unknown as ReadShape;
    await hook.query();
    expect(mocks.api.readSalesCommand).toHaveBeenCalledWith("access-token", SCOPE, { commandId: "command-1" }, "sales.command@1/installation-1/command-1");
  });
});