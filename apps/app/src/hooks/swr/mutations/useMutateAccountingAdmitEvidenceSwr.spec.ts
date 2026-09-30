import { describe, expect, it, vi } from "vitest"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback, MutationMockOptions } from "@/test-support/mock-result"

const mocks = vi.hoisted(() => ({
    useNivoMutation: vi.fn((key: unknown, mutation: QueryMockCallback, options: MutationMockOptions | undefined) => ({
        key,
        mutation,
        options,
    })),
    useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } })),
    api: { commandAccountingAdmitEvidence: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/accounting", () => mocks.api)

import { accountingEvidenceQueryKey } from "../queries/queries.shared"
import { useMutateAccountingAdmitEvidenceSwr } from "./useMutateAccountingAdmitEvidenceSwr"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }
const INPUT = {
    evidenceId: "evidence-1",
    sourceKind: "invoice",
    sourceRef: "ref-1",
    sourceRevision: "rev-1",
    fingerprint: "sha256:1",
    expectedRevision: 0,
}

describe("useMutateAccountingAdmitEvidenceSwr", () => {
    it("keeps the command on its installation-qualified identity and holds it while disabled", () => {
        expect(runAndReadMock(() => useMutateAccountingAdmitEvidenceSwr(SCOPE), mocks.useNivoMutation).key).toEqual([
            "accounting",
            "admit-evidence",
            "workspace-1",
            "instance-1",
            "installation-1",
        ])
        expect(
            runAndReadMock(() => useMutateAccountingAdmitEvidenceSwr(SCOPE, false), mocks.useNivoMutation).key,
        ).toBeNull()
    })

    it("hands the press identity to the client untouched", async () => {
        const hook = runAndReadMock(() => useMutateAccountingAdmitEvidenceSwr(SCOPE), mocks.useNivoMutation)
        await hook.mutation({ requestId: "request-1", input: INPUT })
        expect(mocks.api.commandAccountingAdmitEvidence).toHaveBeenCalledWith("access-token", SCOPE, INPUT, "request-1")
    })

    it("refreshes only the evidence identity the press names, and only when the effect may exist", () => {
        const hook = runAndReadMock(() => useMutateAccountingAdmitEvidenceSwr(SCOPE), mocks.useNivoMutation)
        expect(hook.options?.invalidates?.({ input: INPUT }, { ok: true })).toEqual([
            accountingEvidenceQueryKey(SCOPE, { evidenceId: "evidence-1" }),
        ])
        expect(hook.options?.shouldInvalidate?.({ ok: true })).toBe(true)
        expect(hook.options?.shouldInvalidate?.({ ok: false, code: "outcome_unknown" })).toBe(true)
        expect(hook.options?.shouldInvalidate?.({ ok: false, code: "stale-authority" })).toBe(false)
    })
})
