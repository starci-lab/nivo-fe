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
    api: { commandAccountingException: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/accounting", () => mocks.api)

import { useMutateAccountingExceptionSwr } from "./useMutateAccountingExceptionSwr"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }
const ANSWER = {
    action: "answer" as const,
    exceptionId: "exception-1",
    answer: { choiceCode: "recognize-now", suppliedFacts: [], reason: null },
    answerEvidenceRefs: ["evidence-1"],
    expectedRevision: 4,
}
const DEFER = {
    action: "defer" as const,
    exceptionId: "exception-1",
    reason: "waiting on the supplier",
    expectedRevision: 4,
}

describe("useMutateAccountingExceptionSwr", () => {
    it("keeps the command on its installation-qualified identity and holds it while disabled", () => {
        expect(runAndReadMock(() => useMutateAccountingExceptionSwr(SCOPE), mocks.useNivoMutation).key).toEqual([
            "accounting",
            "exception",
            "workspace-1",
            "instance-1",
            "installation-1",
        ])
        expect(
            runAndReadMock(() => useMutateAccountingExceptionSwr(SCOPE, false), mocks.useNivoMutation).key,
        ).toBeNull()
    })

    it("sends an answer and a non-answer disposition as revision-fenced commands", async () => {
        const hook = runAndReadMock(() => useMutateAccountingExceptionSwr(SCOPE), mocks.useNivoMutation)
        await hook.mutation({ requestId: "request-1", input: ANSWER })
        expect(mocks.api.commandAccountingException).toHaveBeenCalledWith("access-token", SCOPE, ANSWER, "request-1")
        await hook.mutation({ requestId: "request-2", input: DEFER })
        expect(mocks.api.commandAccountingException).toHaveBeenLastCalledWith("access-token", SCOPE, DEFER, "request-2")
    })

    it("registers no reconciliation read, because no read discloses an exception identity", () => {
        expect(
            runAndReadMock(() => useMutateAccountingExceptionSwr(SCOPE), mocks.useNivoMutation).options,
        ).toBeUndefined()
    })
})
