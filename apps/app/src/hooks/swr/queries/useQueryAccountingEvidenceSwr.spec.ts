import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useNivoQuery: vi.fn((key: unknown, query: unknown) => ({ key, query })),
  useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } })),
  api: { readAccountingEvidence: vi.fn(async () => ({ ok: true })) }
}));
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }));
vi.mock("@/modules/auth/session", () => ({ useSession: mocks.useSession }));
vi.mock("@/modules/api/accounting", () => mocks.api);

import { accountingEvidenceQueryKey, useQueryAccountingEvidenceSwr } from "./useQueryAccountingEvidenceSwr";

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" };
type ReadShape = { readonly key: unknown; readonly query: () => Promise<unknown> };

describe("useQueryAccountingEvidenceSwr", () => {
  it("keys one evidence identity inside one installation, never across installations", () => {
    expect(accountingEvidenceQueryKey(SCOPE, { evidenceId: "evidence-1" })).toEqual(["accounting", "evidence", "workspace-1", "instance-1", "installation-1", "evidence-1"]);
    expect(accountingEvidenceQueryKey(SCOPE, { evidenceId: "evidence-1" })).not.toEqual(accountingEvidenceQueryKey({ ...SCOPE, installationId: "installation-2" }, { evidenceId: "evidence-1" }));
  });

  it("addresses nothing while it is held or no session holds a token", () => {
    expect((useQueryAccountingEvidenceSwr(SCOPE, { evidenceId: "evidence-1" }, false) as unknown as ReadShape).key).toBeNull();
    mocks.useSession.mockReturnValueOnce({ state: { status: "signed-out", accessToken: undefined } } as never);
    expect((useQueryAccountingEvidenceSwr(SCOPE, { evidenceId: "evidence-1" }) as unknown as ReadShape).key).toBeNull();
  });

  it("reads the evidence identity through its registered operation address", async () => {
    const hook = useQueryAccountingEvidenceSwr(SCOPE, { evidenceId: "evidence-1" }) as unknown as ReadShape;
    await hook.query();
    expect(mocks.api.readAccountingEvidence).toHaveBeenCalledWith("access-token", SCOPE, { evidenceId: "evidence-1" }, "accounting.evidence@1/installation-1/evidence-1");
  });
});