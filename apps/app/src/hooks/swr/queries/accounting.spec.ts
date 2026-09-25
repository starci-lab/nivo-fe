import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  api: {
    readAccountingEvidence: vi.fn(),
    readAccountingResultDetail: vi.fn(),
    readAccountingRoutineResult: vi.fn(),
    readAccountingSummary: vi.fn(),
    readAccountingWorkbench: vi.fn(),
    resolveAppliedAccountingContext: vi.fn()
  },
  useNivoQuery: vi.fn((key, query) => ({ key, query })),
  useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } }))
}));

vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }));
vi.mock("@/modules/auth/session", () => ({ useSession: mocks.useSession }));
vi.mock("@/modules/api/accounting", () => mocks.api);

import {
  accountingContextQueryKey, accountingEvidenceQueryKey, accountingResultDetailQueryKey,
  accountingRoutineResultQueryKey, accountingSummaryQueryKey, accountingWorkbenchQueryKey,
  useQueryAccountingEvidenceSwr, useQueryAccountingResultDetailSwr, useQueryAccountingRoutineResultSwr,
  useQueryAccountingSummarySwr, useQueryAccountingWorkbenchSwr, useQueryAppliedAccountingContextSwr
} from "./accounting";

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

/* -------------------------------------------------------------------------------------------------
 * The installation-scoped Accounting reads.
 * ----------------------------------------------------------------------------------------------- */

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" };
const SUMMARY_INPUT = { periodStart: "2026-09-01", periodEndExclusive: "2026-10-01", currency: null, pageSize: 25, cursor: null };

type ReadHook = { readonly key: unknown; readonly query: () => unknown };

describe("accounting", () => {
  beforeEach(() => vi.clearAllMocks());

  it("scopes every read by the installation coordinates and its own selector", () => {
    const sibling = { ...SCOPE, installationId: "installation-2" };
    expect(accountingEvidenceQueryKey(SCOPE, { evidenceId: "evidence-1" })).toEqual(["accounting", "evidence", "workspace-1", "instance-1", "installation-1", "evidence-1"]);
    expect(accountingRoutineResultQueryKey(SCOPE, { intentId: "intent-1" })).toEqual(["accounting", "routine-result", "workspace-1", "instance-1", "installation-1", "intent-1"]);
    expect(accountingSummaryQueryKey(SCOPE, SUMMARY_INPUT)).toEqual(["accounting", "summary", "workspace-1", "instance-1", "installation-1", "2026-09-01", "2026-10-01", "all-currencies", 25, "first-page"]);
    expect(accountingResultDetailQueryKey(SCOPE, { action: "current", resultId: "result-1" })).toEqual(["accounting", "result-detail", "workspace-1", "instance-1", "installation-1", "current", "result-1", "current"]);
    expect(accountingResultDetailQueryKey(SCOPE, { action: "asOf", itemId: "item-1", asOf: "2026-09-30T17:00:00.000Z" })).toEqual(["accounting", "result-detail", "workspace-1", "instance-1", "installation-1", "asOf", "item-1", "2026-09-30T17:00:00.000Z"]);
    expect(accountingEvidenceQueryKey(SCOPE, { evidenceId: "evidence-1" })).not.toEqual(accountingEvidenceQueryKey(sibling, { evidenceId: "evidence-1" }));
  });
});

describe("useQueryAccountingEvidenceSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads one evidence identity under the address that names it", () => {
    const hook = useQueryAccountingEvidenceSwr(SCOPE, { evidenceId: "evidence-1" }) as unknown as ReadHook;
    expect(hook.key).toEqual(accountingEvidenceQueryKey(SCOPE, { evidenceId: "evidence-1" }));
    hook.query();
    expect(mocks.api.readAccountingEvidence).toHaveBeenCalledWith("access-token", SCOPE, { evidenceId: "evidence-1" }, "accounting.evidence@1/installation-1/evidence-1");
  });

  it("asks for no cache entry when no signed-in session holds a token", () => {
    mocks.useSession.mockImplementationOnce(() => ({ state: { status: "signed-out", accessToken: "stale-token" } }));
    const hook = useQueryAccountingEvidenceSwr(SCOPE, { evidenceId: "evidence-1" }) as unknown as { readonly key: unknown };
    expect(hook.key).toBeNull();
  });
});

describe("useQueryAccountingRoutineResultSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads one routine intent under the address that names it", () => {
    const hook = useQueryAccountingRoutineResultSwr(SCOPE, { intentId: "intent-1" }) as unknown as ReadHook;
    expect(hook.key).toEqual(accountingRoutineResultQueryKey(SCOPE, { intentId: "intent-1" }));
    hook.query();
    expect(mocks.api.readAccountingRoutineResult).toHaveBeenCalledWith("access-token", SCOPE, { intentId: "intent-1" }, "accounting.routineResult@1/installation-1/intent-1");
  });
});

describe("useQueryAccountingSummarySwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads one summary page under a stable period address", () => {
    const hook = useQueryAccountingSummarySwr(SCOPE, SUMMARY_INPUT) as unknown as ReadHook;
    expect(hook.key).toEqual(accountingSummaryQueryKey(SCOPE, SUMMARY_INPUT));
    hook.query();
    expect(mocks.api.readAccountingSummary).toHaveBeenCalledWith("access-token", SCOPE, SUMMARY_INPUT, "accounting.summary@1/installation-1/2026-09-01/2026-10-01/-/-");
  });
});

describe("useQueryAccountingResultDetailSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("separates a current lookup from an as-of lookup", () => {
    const current = useQueryAccountingResultDetailSwr(SCOPE, { action: "current", resultId: "result-1" }) as unknown as ReadHook;
    const historical = useQueryAccountingResultDetailSwr(SCOPE, { action: "asOf", itemId: "item-1", asOf: "2026-09-30T17:00:00.000Z" }) as unknown as ReadHook;
    current.query();
    historical.query();
    expect(current.key).not.toEqual(historical.key);
    expect(mocks.api.readAccountingResultDetail).toHaveBeenNthCalledWith(1, "access-token", SCOPE, { action: "current", resultId: "result-1" }, "accounting.resultDetail@1/installation-1/result-1/-");
    expect(mocks.api.readAccountingResultDetail).toHaveBeenNthCalledWith(2, "access-token", SCOPE, { action: "asOf", itemId: "item-1", asOf: "2026-09-30T17:00:00.000Z" }, "accounting.resultDetail@1/installation-1/item-1/2026-09-30T17:00:00.000Z");
  });
});