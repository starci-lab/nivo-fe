import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useNivoMutation: vi.fn((key: unknown, mutation: unknown, options: unknown) => ({ key, mutation, options })),
  useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } })),
  api: { commandSalesDecideProposal: vi.fn(async () => ({ ok: true })) }
}));
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }));
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }));
vi.mock("@/modules/api/sales", () => mocks.api);

import { salesDecisionRequestQueryKey } from "../queries/useQuerySalesDecisionRequestSwr";
import { useMutateSalesDecideProposalSwr } from "./useMutateSalesDecideProposalSwr";

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" };
const FINGERPRINT = "a".repeat(64);
const INPUT = { decisionRequestId: "decision-1", proposalVersion: 1, proposalFingerprint: FINGERPRINT, answer: "reject" as const, expectedDecisionRevision: 1 };
type MutationShape = {
  readonly key: unknown;
  readonly options: { readonly invalidates: (trigger: { readonly input: typeof INPUT }, answer: unknown) => ReadonlyArray<unknown>; readonly shouldInvalidate: (answer: { readonly ok: boolean; readonly code?: string }) => boolean };
  readonly mutation: (input: { readonly requestId: string; readonly input: typeof INPUT }) => Promise<unknown>;
};

describe("useMutateSalesDecideProposalSwr", () => {
  it("keeps the command on its installation-qualified identity and holds it while disabled", () => {
    expect((useMutateSalesDecideProposalSwr(SCOPE) as unknown as MutationShape).key).toEqual(["sales", "decide-proposal", "workspace-1", "instance-1", "installation-1"]);
    expect((useMutateSalesDecideProposalSwr(SCOPE, false) as unknown as MutationShape).key).toBeNull();
  });

  it("answers the exact proposal version and fingerprint the input names", async () => {
    const hook = useMutateSalesDecideProposalSwr(SCOPE) as unknown as MutationShape;
    await hook.mutation({ requestId: "request-1", input: INPUT });
    expect(mocks.api.commandSalesDecideProposal).toHaveBeenCalledWith("access-token", SCOPE, INPUT, "request-1");
  });

  it("refreshes the decision request the press answered", () => {
    const hook = useMutateSalesDecideProposalSwr(SCOPE) as unknown as MutationShape;
    expect(hook.options.invalidates({ input: INPUT }, { ok: true })).toEqual([salesDecisionRequestQueryKey(SCOPE, { decisionRequestId: "decision-1" })]);
    expect(hook.options.shouldInvalidate({ ok: false, code: "outcome_unknown" })).toBe(true);
    expect(hook.options.shouldInvalidate({ ok: false, code: "SALES_REFUSED_DENIED" })).toBe(false);
  });
});