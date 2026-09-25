import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  api: { readAccountingWorkbench: vi.fn(), resolveAppliedAccountingContext: vi.fn() },
  useNivoQuery: vi.fn((key, query) => ({ key, query }))
}));

vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }));
vi.mock("@/modules/api/accounting", () => mocks.api);

import { accountingContextQueryKey, accountingWorkbenchQueryKey, useQueryAccountingWorkbenchSwr, useQueryAppliedAccountingContextSwr } from "./accounting";

describe("accountingWorkbenchQueryKey", () => {
  beforeEach(() => vi.clearAllMocks());

  it("scopes current and historical statements by installation, currency, and H", () => {
    expect(accountingContextQueryKey("installation-1")).toEqual(["accounting", "context", "installation-1"]);
    expect(accountingWorkbenchQueryKey("installation-1", "VND")).toEqual(["accounting", "workbench", "installation-1", "VND", "current"]);
    expect(accountingWorkbenchQueryKey("installation-1", "VND", "7")).toEqual(["accounting", "workbench", "installation-1", "VND", "7"]);
    expect(accountingWorkbenchQueryKey("installation-2", "VND", "7")).not.toEqual(accountingWorkbenchQueryKey("installation-1", "VND", "7"));
  });
});

describe("useQueryAccountingWorkbenchSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("connects the workbench read through the viewer-scoped query owner", () => {
    const response = useQueryAccountingWorkbenchSwr("installation-1", "VND", "7") as unknown as { readonly key: unknown };
    expect(response.key).toEqual(accountingWorkbenchQueryKey("installation-1", "VND", "7"));
    expect(mocks.useNivoQuery).toHaveBeenCalledTimes(1);
  });
});

describe("useQueryAppliedAccountingContextSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("routes current and historical reads through the correct cache identities", () => {
    const context = useQueryAppliedAccountingContextSwr("installation-1") as unknown as { readonly key: unknown; readonly query: () => unknown };
    const current = useQueryAccountingWorkbenchSwr("installation-1", "VND") as unknown as { readonly key: unknown; readonly query: () => unknown };
    const historical = useQueryAccountingWorkbenchSwr("installation-1", "VND", "7") as unknown as { readonly key: unknown; readonly query: () => unknown };

    context.query();
    current.query();
    historical.query();

    expect(context.key).toEqual(accountingContextQueryKey("installation-1"));
    expect(current.key).toEqual(accountingWorkbenchQueryKey("installation-1", "VND"));
    expect(historical.key).toEqual(accountingWorkbenchQueryKey("installation-1", "VND", "7"));
    expect(mocks.api.resolveAppliedAccountingContext).toHaveBeenCalledWith("installation-1");
    expect(mocks.api.readAccountingWorkbench).toHaveBeenNthCalledWith(1, "installation-1", "VND", undefined);
    expect(mocks.api.readAccountingWorkbench).toHaveBeenNthCalledWith(2, "installation-1", "VND", "7");
  });
});