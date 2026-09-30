import { describe, expect, it, vi } from "vitest"
import { sessionFixture } from "@/test-support/mock-result"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback, Session } from "@/test-support/mock-result"

const mocks = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: QueryMockCallback) => ({ key, query })),
    useSession: vi.fn<() => Session>(),
    api: { readAccountingEvidence: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/accounting", () => mocks.api)

import { useQueryAccountingEvidenceSwr } from "./useQueryAccountingEvidenceSwr"
import { accountingEvidenceQueryKey } from "./queries.shared"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }

describe("useQueryAccountingEvidenceSwr", () => {
    it("keys one evidence identity inside one installation, never across installations", () => {
        expect(accountingEvidenceQueryKey(SCOPE, { evidenceId: "evidence-1" })).toEqual([
            "accounting",
            "evidence",
            "workspace-1",
            "instance-1",
            "installation-1",
            "evidence-1",
        ])
        expect(accountingEvidenceQueryKey(SCOPE, { evidenceId: "evidence-1" })).not.toEqual(
            accountingEvidenceQueryKey({ ...SCOPE, installationId: "installation-2" }, { evidenceId: "evidence-1" }),
        )
    })

    it("addresses nothing while it is held or no session holds a token", () => {
        expect(
            runAndReadMock(
                () => useQueryAccountingEvidenceSwr(SCOPE, { evidenceId: "evidence-1" }, false),
                mocks.useNivoQuery,
            ).key,
        ).toBeNull()
        mocks.useSession.mockReturnValueOnce(sessionFixture({ status: "anonymous" }))
        expect(
            runAndReadMock(() => useQueryAccountingEvidenceSwr(SCOPE, { evidenceId: "evidence-1" }), mocks.useNivoQuery)
                .key,
        ).toBeNull()
    })

    it("reads the evidence identity through its registered operation address", async () => {
        const hook = runAndReadMock(
            () => useQueryAccountingEvidenceSwr(SCOPE, { evidenceId: "evidence-1" }),
            mocks.useNivoQuery,
        )
        await hook.query()
        expect(mocks.api.readAccountingEvidence).toHaveBeenCalledWith(
            "access-token",
            SCOPE,
            { evidenceId: "evidence-1" },
            "accounting.evidence@1/installation-1/evidence-1",
        )
    })
})
