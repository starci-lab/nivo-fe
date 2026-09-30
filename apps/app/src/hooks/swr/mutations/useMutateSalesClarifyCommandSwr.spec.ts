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
    api: { commandSalesClarifyCommand: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/sales", () => mocks.api)

import { salesCommandQueryKey } from "../queries/queries.shared"
import { useMutateSalesClarifyCommandSwr } from "./useMutateSalesClarifyCommandSwr"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }
const INPUT = {
    commandId: "command-1",
    clarificationRevision: 1,
    permittedFact: { customerRef: "customer-1" } as
        { readonly customerRef: string } | { readonly opportunityId: string },
}

describe("useMutateSalesClarifyCommandSwr", () => {
    it("keeps the command on its installation-qualified identity and holds it while disabled", () => {
        expect(runAndReadMock(() => useMutateSalesClarifyCommandSwr(SCOPE), mocks.useNivoMutation).key).toEqual([
            "sales",
            "clarify-command",
            "workspace-1",
            "instance-1",
            "installation-1",
        ])
        expect(
            runAndReadMock(() => useMutateSalesClarifyCommandSwr(SCOPE, false), mocks.useNivoMutation).key,
        ).toBeNull()
    })

    it("sends the refinement at the pending clarification revision the input carries", async () => {
        const hook = runAndReadMock(() => useMutateSalesClarifyCommandSwr(SCOPE), mocks.useNivoMutation)
        await hook.mutation({ requestId: "request-1", input: INPUT })
        expect(mocks.api.commandSalesClarifyCommand).toHaveBeenCalledWith("access-token", SCOPE, INPUT, "request-1")
    })

    it("refreshes the same command plan the clarification refined", () => {
        const hook = runAndReadMock(() => useMutateSalesClarifyCommandSwr(SCOPE), mocks.useNivoMutation)
        expect(hook.options?.invalidates?.({ input: INPUT }, { ok: true })).toEqual([
            salesCommandQueryKey(SCOPE, { commandId: "command-1" }),
        ])
        expect(hook.options?.shouldInvalidate?.({ ok: false, code: "outcome_unknown" })).toBe(true)
        expect(hook.options?.shouldInvalidate?.({ ok: false, code: "SALES_REFUSED_UNAVAILABLE" })).toBe(false)
    })
})
