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
    api: { commandSalesDecideProposal: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/sales", () => mocks.api)

import { salesDecisionRequestQueryKey } from "../queries/useQuerySalesDecisionRequestSwr"
import { useMutateSalesDecideProposalSwr } from "./useMutateSalesDecideProposalSwr"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }
const FINGERPRINT = "a".repeat(64)
const INPUT = {
    decisionRequestId: "decision-1",
    proposalVersion: 1,
    proposalFingerprint: FINGERPRINT,
    answer: "reject" as const,
    expectedDecisionRevision: 1,
}

describe("useMutateSalesDecideProposalSwr", () => {
    it("keeps the command on its installation-qualified identity and holds it while disabled", () => {
        expect(runAndReadMock(() => useMutateSalesDecideProposalSwr(SCOPE), mocks.useNivoMutation).key).toEqual([
            "sales",
            "decide-proposal",
            "workspace-1",
            "instance-1",
            "installation-1",
        ])
        expect(
            runAndReadMock(() => useMutateSalesDecideProposalSwr(SCOPE, false), mocks.useNivoMutation).key,
        ).toBeNull()
    })

    it("answers the exact proposal version and fingerprint the input names", async () => {
        const hook = runAndReadMock(() => useMutateSalesDecideProposalSwr(SCOPE), mocks.useNivoMutation)
        await hook.mutation({ requestId: "request-1", input: INPUT })
        expect(mocks.api.commandSalesDecideProposal).toHaveBeenCalledWith("access-token", SCOPE, INPUT, "request-1")
    })

    it("refreshes the decision request the press answered", () => {
        const hook = runAndReadMock(() => useMutateSalesDecideProposalSwr(SCOPE), mocks.useNivoMutation)
        expect(hook.options?.invalidates?.({ input: INPUT }, { ok: true })).toEqual([
            salesDecisionRequestQueryKey(SCOPE, { decisionRequestId: "decision-1" }),
        ])
        expect(hook.options?.shouldInvalidate?.({ ok: false, code: "outcome_unknown" })).toBe(true)
        expect(hook.options?.shouldInvalidate?.({ ok: false, code: "SALES_REFUSED_DENIED" })).toBe(false)
    })
})
