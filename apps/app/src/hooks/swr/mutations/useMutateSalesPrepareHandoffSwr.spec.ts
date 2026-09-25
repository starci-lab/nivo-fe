import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useNivoMutation: vi.fn((key: unknown, mutation: unknown, options: unknown) => ({ key, mutation, options })),
  useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } })),
  api: { commandSalesPrepareHandoff: vi.fn(async () => ({ ok: true })) }
}));
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }));
vi.mock("@/modules/auth/session", () => ({ useSession: mocks.useSession }));
vi.mock("@/modules/api/sales", () => mocks.api);

import { salesHandoffQueryKey } from "../queries/useQuerySalesHandoffSwr";
import { useMutateSalesPrepareHandoffSwr } from "./useMutateSalesPrepareHandoffSwr";

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" };
const FINGERPRINT = "a".repeat(64);
const INPUT = { handoffId: "handoff-1", opportunityId: "opportunity-1", orderRevision: 3, destinationAccountingInstallationId: "installation-2", consentRef: "consent-1", fingerprint: FINGERPRINT, expectedRevision: 4 };
type MutationShape = {
  readonly key: unknown;
  readonly options: { readonly invalidates: (trigger: { readonly input: typeof INPUT }, answer: unknown) => ReadonlyArray<unknown>; readonly shouldInvalidate: (answer: { readonly ok: boolean; readonly code?: string }) => boolean };
  readonly mutation: (input: { readonly requestId: string; readonly input: typeof INPUT }) => Promise<unknown>;
};

describe("useMutateSalesPrepareHandoffSwr", () => {
  it("keeps the command on its installation-qualified identity and holds it while disabled", () => {
    expect((useMutateSalesPrepareHandoffSwr(SCOPE) as unknown as MutationShape).key).toEqual(["sales", "prepare-handoff", "workspace-1", "instance-1", "installation-1"]);
    expect((useMutateSalesPrepareHandoffSwr(SCOPE, false) as unknown as MutationShape).key).toBeNull();
  });

  it("prepares the confirmed order with its consent reference, contacting nobody", async () => {
    const hook = useMutateSalesPrepareHandoffSwr(SCOPE) as unknown as MutationShape;
    await hook.mutation({ requestId: "request-1", input: INPUT });
    expect(mocks.api.commandSalesPrepareHandoff).toHaveBeenCalledWith("access-token", SCOPE, INPUT, "request-1");
  });

  it("refreshes the handoff it prepared", () => {
    const hook = useMutateSalesPrepareHandoffSwr(SCOPE) as unknown as MutationShape;
    expect(hook.options.invalidates({ input: INPUT }, { ok: true })).toEqual([salesHandoffQueryKey(SCOPE, { handoffId: "handoff-1" })]);
    expect(hook.options.shouldInvalidate({ ok: false, code: "outcome_unknown" })).toBe(true);
    expect(hook.options.shouldInvalidate({ ok: false, code: "SALES_REFUSED_INVALID" })).toBe(false);
  });
});