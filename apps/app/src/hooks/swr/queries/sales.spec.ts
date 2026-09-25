import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  api: {
    readSalesAction: vi.fn(),
    readSalesCommand: vi.fn(),
    readSalesDecisionRequest: vi.fn(),
    readSalesHandoff: vi.fn(),
    readSalesOpportunity: vi.fn(),
    readSalesPipeline: vi.fn(),
    readSalesPolicy: vi.fn(),
    readSalesReadiness: vi.fn()
  },
  useNivoQuery: vi.fn((key, query) => ({ key, query })),
  useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } }))
}));

vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }));
vi.mock("@/modules/auth/session", () => ({ useSession: mocks.useSession }));
vi.mock("@/modules/api/sales", () => mocks.api);

import {
  salesActionQueryKey, salesCommandQueryKey, salesDecisionRequestQueryKey, salesHandoffQueryKey,
  salesOpportunityQueryKey, salesPipelineQueryKey, salesPolicyQueryKey, salesReadinessQueryKey,
  useQuerySalesActionSwr, useQuerySalesCommandSwr, useQuerySalesDecisionRequestSwr, useQuerySalesHandoffSwr,
  useQuerySalesOpportunitySwr, useQuerySalesPipelineSwr, useQuerySalesPolicySwr, useQuerySalesReadinessSwr
} from "./sales";

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" };
const FINGERPRINT = "a".repeat(64);
const PIPELINE_INPUT = { scopeFingerprint: FINGERPRINT, statusFilter: null, after: null, limit: 25 };
const SUMMARY_SIZE = 25;

type ReadHook = { readonly key: unknown; readonly query: () => unknown };

describe("salesPolicyQueryKey", () => {
  beforeEach(() => vi.clearAllMocks());

  it("separates the current revision from the one a configure request stored, per installation", () => {
    expect(salesPolicyQueryKey(SCOPE, { salesInstallationId: "installation-1", requestId: null })).toEqual(["sales", "policy", "workspace-1", "instance-1", "installation-1", "current-revision"]);
    expect(salesPolicyQueryKey(SCOPE, { salesInstallationId: "installation-1", requestId: "request-1" })).toEqual(["sales", "policy", "workspace-1", "instance-1", "installation-1", "request-1"]);
    expect(salesPolicyQueryKey(SCOPE, { salesInstallationId: "installation-1", requestId: "request-1" }))
      .not.toEqual(salesPolicyQueryKey({ ...SCOPE, installationId: "installation-2" }, { salesInstallationId: "installation-2", requestId: "request-1" }));
  });
});

describe("salesPipelineQueryKey", () => {
  beforeEach(() => vi.clearAllMocks());

  it("scopes a page by fingerprint, ordered status filter, cursor and page size", () => {
    expect(salesPipelineQueryKey(SCOPE, PIPELINE_INPUT)).toEqual(["sales", "pipeline", "workspace-1", "instance-1", "installation-1", FINGERPRINT, "all-statuses", "first-page", SUMMARY_SIZE]);
    expect(salesPipelineQueryKey(SCOPE, { ...PIPELINE_INPUT, statusFilter: ["won", "open"] }))
      .toEqual(salesPipelineQueryKey(SCOPE, { ...PIPELINE_INPUT, statusFilter: ["open", "won"] }));
    expect(salesPipelineQueryKey(SCOPE, { ...PIPELINE_INPUT, statusFilter: [] })).toContain("all-statuses");
    expect(salesPipelineQueryKey(SCOPE, { ...PIPELINE_INPUT, after: { lastOpportunityId: "opportunity-9" } })).toContain("opportunity-9");
  });
});

describe("useQuerySalesPolicySwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads the current revision under the address that names the installation", () => {
    const hook = useQuerySalesPolicySwr(SCOPE, { salesInstallationId: "installation-1", requestId: null }) as unknown as ReadHook;
    expect(hook.key).toEqual(salesPolicyQueryKey(SCOPE, { salesInstallationId: "installation-1", requestId: null }));
    hook.query();
    expect(mocks.api.readSalesPolicy).toHaveBeenCalledWith("access-token", SCOPE, { salesInstallationId: "installation-1", requestId: null }, "sales.policy@1/installation-1/-");
  });

  it("carries the request identity a configure replay is reconciled by", () => {
    const hook = useQuerySalesPolicySwr(SCOPE, { salesInstallationId: "installation-1", requestId: "request-1" }) as unknown as ReadHook;
    hook.query();
    expect(mocks.api.readSalesPolicy).toHaveBeenCalledWith("access-token", SCOPE, { salesInstallationId: "installation-1", requestId: "request-1" }, "sales.policy@1/installation-1/request-1");
  });

  it("asks for no cache entry when no signed-in session holds a token", () => {
    mocks.useSession.mockImplementationOnce(() => ({ state: { status: "signed-out", accessToken: "stale-token" } }));
    const hook = useQuerySalesPolicySwr(SCOPE, { salesInstallationId: "installation-1", requestId: null }) as unknown as { readonly key: unknown };
    expect(hook.key).toBeNull();
  });
});

describe("useQuerySalesReadinessSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads one installation's readiness under its own coordinates", () => {
    const hook = useQuerySalesReadinessSwr(SCOPE, { salesInstallationId: "installation-1" }) as unknown as ReadHook;
    expect(hook.key).toEqual(["sales", "readiness", "workspace-1", "instance-1", "installation-1", "installation-1"]);
    hook.query();
    expect(mocks.api.readSalesReadiness).toHaveBeenCalledWith("access-token", SCOPE, { salesInstallationId: "installation-1" }, "sales.readiness@1/installation-1/installation-1");
  });
});

describe("useQuerySalesOpportunitySwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads one opportunity under the address that names it", () => {
    const hook = useQuerySalesOpportunitySwr(SCOPE, { opportunityId: "opportunity-1" }) as unknown as ReadHook;
    expect(hook.key).toEqual(salesOpportunityQueryKey(SCOPE, { opportunityId: "opportunity-1" }));
    hook.query();
    expect(mocks.api.readSalesOpportunity).toHaveBeenCalledWith("access-token", SCOPE, { opportunityId: "opportunity-1" }, "sales.opportunity@1/installation-1/opportunity-1");
  });
});

describe("useQuerySalesPipelineSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads one page under its fingerprint and cursor", () => {
    const first = useQuerySalesPipelineSwr(SCOPE, PIPELINE_INPUT) as unknown as ReadHook;
    const next = useQuerySalesPipelineSwr(SCOPE, { ...PIPELINE_INPUT, after: { lastOpportunityId: "opportunity-9" } }) as unknown as ReadHook;
    first.query();
    next.query();
    expect(first.key).not.toEqual(next.key);
    expect(mocks.api.readSalesPipeline).toHaveBeenNthCalledWith(1, "access-token", SCOPE, PIPELINE_INPUT, `sales.pipeline@1/installation-1/${FINGERPRINT}/-`);
    expect(mocks.api.readSalesPipeline).toHaveBeenNthCalledWith(2, "access-token", SCOPE, { ...PIPELINE_INPUT, after: { lastOpportunityId: "opportunity-9" } }, `sales.pipeline@1/installation-1/${FINGERPRINT}/opportunity-9`);
  });
});

describe("useQuerySalesCommandSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads one command plan under the command identity", () => {
    const hook = useQuerySalesCommandSwr(SCOPE, { commandId: "command-1" }) as unknown as ReadHook;
    expect(hook.key).toEqual(salesCommandQueryKey(SCOPE, { commandId: "command-1" }));
    hook.query();
    expect(mocks.api.readSalesCommand).toHaveBeenCalledWith("access-token", SCOPE, { commandId: "command-1" }, "sales.command@1/installation-1/command-1");
  });
});

describe("useQuerySalesDecisionRequestSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads one decision request under the decision identity", () => {
    const hook = useQuerySalesDecisionRequestSwr(SCOPE, { decisionRequestId: "decision-1" }) as unknown as ReadHook;
    expect(hook.key).toEqual(salesDecisionRequestQueryKey(SCOPE, { decisionRequestId: "decision-1" }));
    hook.query();
    expect(mocks.api.readSalesDecisionRequest).toHaveBeenCalledWith("access-token", SCOPE, { decisionRequestId: "decision-1" }, "sales.decisionRequest@1/installation-1/decision-1");
  });
});

describe("useQuerySalesActionSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads one action under the action identity", () => {
    const hook = useQuerySalesActionSwr(SCOPE, { actionId: "action-1" }) as unknown as ReadHook;
    expect(hook.key).toEqual(salesActionQueryKey(SCOPE, { actionId: "action-1" }));
    hook.query();
    expect(mocks.api.readSalesAction).toHaveBeenCalledWith("access-token", SCOPE, { actionId: "action-1" }, "sales.action@1/installation-1/action-1");
  });
});

describe("useQuerySalesHandoffSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads one handoff under the handoff identity", () => {
    const hook = useQuerySalesHandoffSwr(SCOPE, { handoffId: "handoff-1" }) as unknown as ReadHook;
    expect(hook.key).toEqual(salesHandoffQueryKey(SCOPE, { handoffId: "handoff-1" }));
    hook.query();
    expect(mocks.api.readSalesHandoff).toHaveBeenCalledWith("access-token", SCOPE, { handoffId: "handoff-1" }, "sales.handoff@1/installation-1/handoff-1");
  });
});

describe("sales", () => {
  beforeEach(() => vi.clearAllMocks());

  it("gives every read its own viewer-scoped cache identity", () => {
    const keys = [
      salesPolicyQueryKey(SCOPE, { salesInstallationId: "installation-1", requestId: null }),
      salesReadinessQueryKey(SCOPE, { salesInstallationId: "installation-1" }),
      salesOpportunityQueryKey(SCOPE, { opportunityId: "opportunity-1" }),
      salesPipelineQueryKey(SCOPE, PIPELINE_INPUT),
      salesCommandQueryKey(SCOPE, { commandId: "command-1" }),
      salesDecisionRequestQueryKey(SCOPE, { decisionRequestId: "decision-1" }),
      salesActionQueryKey(SCOPE, { actionId: "action-1" }),
      salesHandoffQueryKey(SCOPE, { handoffId: "handoff-1" })
    ];
    expect(new Set(keys.map(key => JSON.stringify(key))).size).toBe(keys.length);
    expect(mocks.useNivoQuery).not.toHaveBeenCalled();
  });
});