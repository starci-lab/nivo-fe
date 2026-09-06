import { describe, expect, it, vi } from "vitest";

const { useNivoQuery } = vi.hoisted(() => ({ useNivoQuery: vi.fn((_key, query) => ({ key: _key, query })) }));
vi.mock("../use-nivo-query", () => ({ useNivoQuery }));
vi.mock("@/modules/api/accounting", () => ({ readAccountingWorkbench: vi.fn(), resolveAppliedAccountingContext: vi.fn() }));

import { accountingContextQueryKey, accountingWorkbenchQueryKey, useQueryAccountingWorkbenchSwr } from "./accounting";

describe("Accounting query cache identities", () => {
  it("scopes current and historical statements by installation, currency, and H", () => {
    expect(accountingContextQueryKey("installation-1")).toEqual(["accounting", "context", "installation-1"]);
    expect(accountingWorkbenchQueryKey("installation-1", "VND")).toEqual(["accounting", "workbench", "installation-1", "VND", "current"]);
    expect(accountingWorkbenchQueryKey("installation-1", "VND", "7")).toEqual(["accounting", "workbench", "installation-1", "VND", "7"]);
    expect(accountingWorkbenchQueryKey("installation-2", "VND", "7")).not.toEqual(accountingWorkbenchQueryKey("installation-1", "VND", "7"));
  });

  it("connects the workbench read through the viewer-scoped query owner", () => {
    const response = useQueryAccountingWorkbenchSwr("installation-1", "VND", "7") as unknown as { readonly key: unknown };
    expect(response.key).toEqual(accountingWorkbenchQueryKey("installation-1", "VND", "7"));
    expect(useNivoQuery).toHaveBeenCalledTimes(1);
  });
});
