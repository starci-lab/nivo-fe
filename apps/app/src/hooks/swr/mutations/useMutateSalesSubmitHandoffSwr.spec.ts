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
    api: { commandSalesSubmitHandoff: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/sales", () => mocks.api)

import { salesHandoffQueryKey } from "../queries/queries.shared"
import { useMutateSalesSubmitHandoffSwr } from "./useMutateSalesSubmitHandoffSwr"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }
const FINGERPRINT = "a".repeat(64)
const INPUT = {
    handoffId: "handoff-1",
    confirmedOrderRevision: 3,
    fingerprint: FINGERPRINT,
    expectedHandoffRevision: 1,
}

describe("useMutateSalesSubmitHandoffSwr", () => {
    it("keeps the command on its installation-qualified identity and holds it while disabled", () => {
        expect(runAndReadMock(() => useMutateSalesSubmitHandoffSwr(SCOPE), mocks.useNivoMutation).key).toEqual([
            "sales",
            "submit-handoff",
            "workspace-1",
            "instance-1",
            "installation-1",
        ])
        expect(runAndReadMock(() => useMutateSalesSubmitHandoffSwr(SCOPE, false), mocks.useNivoMutation).key).toBeNull()
    })

    it("admits the prepared handoff at its confirmed-order revision and fingerprint", async () => {
        const hook = runAndReadMock(() => useMutateSalesSubmitHandoffSwr(SCOPE), mocks.useNivoMutation)
        await hook.mutation({ requestId: "request-1", input: INPUT })
        expect(mocks.api.commandSalesSubmitHandoff).toHaveBeenCalledWith("access-token", SCOPE, INPUT, "request-1")
    })

    it("refreshes the same handoff it admitted", () => {
        const hook = runAndReadMock(() => useMutateSalesSubmitHandoffSwr(SCOPE), mocks.useNivoMutation)
        expect(hook.options?.invalidates?.({ input: INPUT }, { ok: true })).toEqual([
            salesHandoffQueryKey(SCOPE, { handoffId: "handoff-1" }),
        ])
        expect(hook.options?.shouldInvalidate?.({ ok: false, code: "outcome_unknown" })).toBe(true)
        expect(hook.options?.shouldInvalidate?.({ ok: false, code: "SALES_REFUSED_UNAVAILABLE" })).toBe(false)
    })
})
