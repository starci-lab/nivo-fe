import { describe, expect, it, vi } from "vitest"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback, MutationMockOptions } from "@/test-support/mock-result"

const mocks = vi.hoisted(() => ({
    useNivoMutation: vi.fn((key: unknown, mutation: QueryMockCallback, options: MutationMockOptions | undefined) => ({ key, mutation, options })),
    useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } })),
    api: { commandAccountingCorrect: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/accounting", () => mocks.api)

import { accountingResultDetailQueryKey } from "../queries/useQueryAccountingResultDetailSwr"
import { useMutateAccountingCorrectSwr } from "./useMutateAccountingCorrectSwr"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }
const PROPOSE = {
    action: "propose" as const,
    correctionId: "correction-1",
    predecessorResultId: "result-1",
    correctedFacts: [],
    reason: "late invoice",
    evidenceRefs: ["evidence-2"],
    expectedResultRevision: 3,
}
const APPEND = { action: "append" as const, correctionId: "correction-1", attemptId: "attempt-2", expectedRevision: 3 }
type MutationShape = {
    readonly key: unknown
    readonly options: {
        readonly invalidates: (
            trigger: { readonly input: typeof PROPOSE | typeof APPEND },
            answer: {
                readonly ok: boolean
                readonly data?: { readonly payload: { readonly resultId: string | null } }
            },
        ) => ReadonlyArray<unknown>
        readonly shouldInvalidate: (answer: { readonly ok: boolean; readonly code?: string }) => boolean
    }
    readonly mutation: (input: {
        readonly requestId: string
        readonly input: typeof PROPOSE | typeof APPEND
    }) => Promise<unknown>
}

describe("useMutateAccountingCorrectSwr", () => {
    it("keeps the command on its installation-qualified identity and holds it while disabled", () => {
        expect((runAndReadMock(() => useMutateAccountingCorrectSwr(SCOPE), mocks.useNivoMutation)).key).toEqual([
            "accounting",
            "correct",
            "workspace-1",
            "instance-1",
            "installation-1",
        ])
        expect((runAndReadMock(() => useMutateAccountingCorrectSwr(SCOPE, false), mocks.useNivoMutation)).key).toBeNull()
    })

    it("sends a proposal and an append through the same correction address", async () => {
        const hook = runAndReadMock(() => useMutateAccountingCorrectSwr(SCOPE), mocks.useNivoMutation)
        await hook.mutation({ requestId: "request-1", input: PROPOSE })
        expect(mocks.api.commandAccountingCorrect).toHaveBeenCalledWith("access-token", SCOPE, PROPOSE, "request-1")
        await hook.mutation({ requestId: "request-2", input: APPEND })
        expect(mocks.api.commandAccountingCorrect).toHaveBeenLastCalledWith("access-token", SCOPE, APPEND, "request-2")
    })

    it("refreshes the appended result lineage, and the corrected result while an append is unattested", () => {
        const hook = runAndReadMock(() => useMutateAccountingCorrectSwr(SCOPE), mocks.useNivoMutation)
        expect(
            hook.options?.invalidates?.({ input: APPEND }, { ok: true, data: { payload: { resultId: "result-2" } } }),
        ).toEqual([accountingResultDetailQueryKey(SCOPE, { action: "current", resultId: "result-2" })])
        expect(hook.options?.invalidates?.({ input: PROPOSE }, { ok: false })).toEqual([
            accountingResultDetailQueryKey(SCOPE, { action: "current", resultId: "result-1" }),
        ])
        expect(hook.options?.invalidates?.({ input: APPEND }, { ok: false })).toEqual([])
        expect(hook.options?.shouldInvalidate?.({ ok: false, code: "outcome_unknown" })).toBe(true)
        expect(hook.options?.shouldInvalidate?.({ ok: false, code: "conflict" })).toBe(false)
    })
})
