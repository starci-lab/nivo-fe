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
    api: { commandSalesRecoverAction: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/sales", () => mocks.api)

import { salesActionQueryKey } from "../queries/queries.shared"
import { useMutateSalesRecoverActionSwr } from "./useMutateSalesRecoverActionSwr"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }
const FINGERPRINT = "a".repeat(64)
const FENCE = { claimTokenHash: FINGERPRINT, fencedAt: "2026-09-25T00:00:00.000Z" }
const RETRY = {
    operation: "retryNoStart" as const,
    actionId: "action-1",
    attemptGeneration: 1,
    receiverIntentId: "receiver-intent-1",
    receiverAttemptId: "receiver-attempt-1",
    receiverNoStartProofRef: "proof-1",
    oldWriterFence: FENCE,
    fingerprint: FINGERPRINT,
    expectedRevision: 2,
}
const STOP = {
    operation: "cancelNoStart" as const,
    actionId: "action-1",
    attemptGeneration: 1,
    noStartProof: { proofRef: "proof-1" },
    oldWriterFence: FENCE,
    expectedRevision: 2,
}

describe("useMutateSalesRecoverActionSwr", () => {
    it("keeps the command on its installation-qualified identity and holds it while disabled", () => {
        expect(runAndReadMock(() => useMutateSalesRecoverActionSwr(SCOPE), mocks.useNivoMutation).key).toEqual([
            "sales",
            "recover-action",
            "workspace-1",
            "instance-1",
            "installation-1",
        ])
        expect(runAndReadMock(() => useMutateSalesRecoverActionSwr(SCOPE, false), mocks.useNivoMutation).key).toBeNull()
    })

    it("opens the retry door with the no-start proof and the stop door with the same fence", async () => {
        const hook = runAndReadMock(() => useMutateSalesRecoverActionSwr(SCOPE), mocks.useNivoMutation)
        await hook.mutation({ requestId: "request-1", input: RETRY })
        expect(mocks.api.commandSalesRecoverAction).toHaveBeenCalledWith("access-token", SCOPE, RETRY, "request-1")
        await hook.mutation({ requestId: "request-2", input: STOP })
        expect(mocks.api.commandSalesRecoverAction).toHaveBeenLastCalledWith("access-token", SCOPE, STOP, "request-2")
    })

    it("refreshes the action a retry or a stop named, and reads a refusal as needing no read", () => {
        const hook = runAndReadMock(() => useMutateSalesRecoverActionSwr(SCOPE), mocks.useNivoMutation)
        expect(hook.options?.invalidates?.({ input: RETRY }, { ok: true })).toEqual([
            salesActionQueryKey(SCOPE, { actionId: "action-1" }),
        ])
        expect(hook.options?.shouldInvalidate?.({ ok: false, code: "outcome_unknown" })).toBe(true)
        expect(hook.options?.shouldInvalidate?.({ ok: false, code: "SALES_REFUSED_CONFLICT" })).toBe(false)
    })
})
