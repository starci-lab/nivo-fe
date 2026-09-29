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
    api: { commandSalesSubmitCommand: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/sales", () => mocks.api)

import { salesCommandQueryKey } from "../queries/useQuerySalesCommandSwr"
import { useMutateSalesSubmitCommandSwr } from "./useMutateSalesSubmitCommandSwr"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }
const FINGERPRINT = "a".repeat(64)
const INPUT = {
    commandId: "command-1",
    commandRevision: 1,
    scope: { customerRefs: [], opportunityIds: [], offerRefs: [] },
    requestedActions: [] as ReadonlyArray<"qualify">,
    fingerprint: FINGERPRINT,
    expectedOpportunityRevisions: {},
}

describe("useMutateSalesSubmitCommandSwr", () => {
    it("keeps the command on its installation-qualified identity and holds it while disabled", () => {
        expect(runAndReadMock(() => useMutateSalesSubmitCommandSwr(SCOPE), mocks.useNivoMutation).key).toEqual([
            "sales",
            "submit-command",
            "workspace-1",
            "instance-1",
            "installation-1",
        ])
        expect(runAndReadMock(() => useMutateSalesSubmitCommandSwr(SCOPE, false), mocks.useNivoMutation).key).toBeNull()
    })

    it("sends one bounded plan under its own identity and fingerprint", async () => {
        const hook = runAndReadMock(() => useMutateSalesSubmitCommandSwr(SCOPE), mocks.useNivoMutation)
        await hook.mutation({ requestId: "request-1", input: INPUT })
        expect(mocks.api.commandSalesSubmitCommand).toHaveBeenCalledWith("access-token", SCOPE, INPUT, "request-1")
    })

    it("refreshes the command plan the press named rather than the whole board", () => {
        const hook = runAndReadMock(() => useMutateSalesSubmitCommandSwr(SCOPE), mocks.useNivoMutation)
        expect(hook.options?.invalidates?.({ input: INPUT }, { ok: true })).toEqual([
            salesCommandQueryKey(SCOPE, { commandId: "command-1" }),
        ])
        expect(hook.options?.shouldInvalidate?.({ ok: false, code: "DEADLINE_EXCEEDED" })).toBe(true)
        expect(hook.options?.shouldInvalidate?.({ ok: false, code: "SALES_REFUSED_INVALID" })).toBe(false)
    })
})
