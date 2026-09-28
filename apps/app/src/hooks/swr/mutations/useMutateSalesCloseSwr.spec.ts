import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useNivoMutation: vi.fn((key: unknown, mutation: unknown, options: unknown) => ({ key, mutation, options })),
  useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } })),
  api: { commandSalesClose: vi.fn(async () => ({ ok: true })) }
}));
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }));
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }));
vi.mock("@/modules/api/sales", () => mocks.api);

import { salesOpportunityQueryKey } from "../queries/useQuerySalesOpportunitySwr";
import { useMutateSalesCloseSwr } from "./useMutateSalesCloseSwr";

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" };
const INPUT = { intentId: "intent-1", opportunityId: "opportunity-1", outcome: "won" as const, evidenceRefs: [] as ReadonlyArray<string>, confirmedOrder: { orderId: "order-1" } as Readonly<Record<string, unknown>> | null, expectedRevision: 2 };
type MutationShape = {
  readonly key: unknown;
  readonly options: { readonly invalidates: (trigger: { readonly input: typeof INPUT }, answer: unknown) => ReadonlyArray<unknown>; readonly shouldInvalidate: (answer: { readonly ok: boolean; readonly code?: string }) => boolean };
  readonly mutation: (input: { readonly requestId: string; readonly input: typeof INPUT }) => Promise<unknown>;
};

describe("useMutateSalesCloseSwr", () => {
  it("keeps the command on its installation-qualified identity and holds it while disabled", () => {
    expect((useMutateSalesCloseSwr(SCOPE) as unknown as MutationShape).key).toEqual(["sales", "close", "workspace-1", "instance-1", "installation-1"]);
    expect((useMutateSalesCloseSwr(SCOPE, false) as unknown as MutationShape).key).toBeNull();
  });

  it("closes at the revision the press expected", async () => {
    const hook = useMutateSalesCloseSwr(SCOPE) as unknown as MutationShape;
    await hook.mutation({ requestId: "request-1", input: INPUT });
    expect(mocks.api.commandSalesClose).toHaveBeenCalledWith("access-token", SCOPE, INPUT, "request-1");
  });

  it("refreshes the opportunity it closed and reads a refusal as needing no read", () => {
    const hook = useMutateSalesCloseSwr(SCOPE) as unknown as MutationShape;
    expect(hook.options.invalidates({ input: INPUT }, { ok: true })).toEqual([salesOpportunityQueryKey(SCOPE, { opportunityId: "opportunity-1" })]);
    expect(hook.options.shouldInvalidate({ ok: true })).toBe(true);
    expect(hook.options.shouldInvalidate({ ok: false, code: "outcome_unknown" })).toBe(true);
    expect(hook.options.shouldInvalidate({ ok: false, code: "DEADLINE_EXCEEDED" })).toBe(true);
    expect(hook.options.shouldInvalidate({ ok: false, code: "SALES_REFUSED_CONFLICT" })).toBe(false);
  });
});