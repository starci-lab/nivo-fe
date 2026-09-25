import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useNivoMutation: vi.fn((key: unknown, mutation: unknown, options: unknown) => ({ key, mutation, options })),
  useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } })),
  api: { commandAccountingAdmitEvidence: vi.fn(async () => ({ ok: true })) }
}));
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }));
vi.mock("@/modules/auth/session", () => ({ useSession: mocks.useSession }));
vi.mock("@/modules/api/accounting", () => mocks.api);

import { accountingEvidenceQueryKey } from "../queries/useQueryAccountingEvidenceSwr";
import { useMutateAccountingAdmitEvidenceSwr } from "./useMutateAccountingAdmitEvidenceSwr";

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" };
const INPUT = { evidenceId: "evidence-1", sourceKind: "invoice", sourceRef: "ref-1", sourceRevision: "rev-1", fingerprint: "sha256:1", expectedRevision: 0 };
type MutationShape = {
  readonly key: unknown;
  readonly options: { readonly invalidates: (trigger: { readonly input: typeof INPUT }, answer: unknown) => ReadonlyArray<unknown>; readonly shouldInvalidate: (answer: { readonly ok: boolean; readonly code?: string }) => boolean };
  readonly mutation: (input: { readonly requestId: string; readonly input: typeof INPUT }) => Promise<unknown>;
};

describe("useMutateAccountingAdmitEvidenceSwr", () => {
  it("keeps the command on its installation-qualified identity and holds it while disabled", () => {
    expect((useMutateAccountingAdmitEvidenceSwr(SCOPE) as unknown as MutationShape).key).toEqual(["accounting", "admit-evidence", "workspace-1", "instance-1", "installation-1"]);
    expect((useMutateAccountingAdmitEvidenceSwr(SCOPE, false) as unknown as MutationShape).key).toBeNull();
  });

  it("hands the press identity to the client untouched", async () => {
    const hook = useMutateAccountingAdmitEvidenceSwr(SCOPE) as unknown as MutationShape;
    await hook.mutation({ requestId: "request-1", input: INPUT });
    expect(mocks.api.commandAccountingAdmitEvidence).toHaveBeenCalledWith("access-token", SCOPE, INPUT, "request-1");
  });

  it("refreshes only the evidence identity the press names, and only when the effect may exist", () => {
    const hook = useMutateAccountingAdmitEvidenceSwr(SCOPE) as unknown as MutationShape;
    expect(hook.options.invalidates({ input: INPUT }, { ok: true })).toEqual([accountingEvidenceQueryKey(SCOPE, { evidenceId: "evidence-1" })]);
    expect(hook.options.shouldInvalidate({ ok: true })).toBe(true);
    expect(hook.options.shouldInvalidate({ ok: false, code: "outcome_unknown" })).toBe(true);
    expect(hook.options.shouldInvalidate({ ok: false, code: "stale-authority" })).toBe(false);
  });
});