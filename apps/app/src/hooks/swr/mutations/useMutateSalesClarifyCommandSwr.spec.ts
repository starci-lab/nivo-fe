import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    useNivoMutation: vi.fn((key: unknown, mutation: unknown, options: unknown) => ({ key, mutation, options })),
    useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } })),
    api: { commandSalesClarifyCommand: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/sales", () => mocks.api)

import { salesCommandQueryKey } from "../queries/useQuerySalesCommandSwr"
import { useMutateSalesClarifyCommandSwr } from "./useMutateSalesClarifyCommandSwr"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }
const INPUT = {
    commandId: "command-1",
    clarificationRevision: 1,
    permittedFact: { customerRef: "customer-1" } as
        { readonly customerRef: string } | { readonly opportunityId: string },
}
type MutationShape = {
    readonly key: unknown
    readonly options: {
        readonly invalidates: (trigger: { readonly input: typeof INPUT }, answer: unknown) => ReadonlyArray<unknown>
        readonly shouldInvalidate: (answer: { readonly ok: boolean; readonly code?: string }) => boolean
    }
    readonly mutation: (input: { readonly requestId: string; readonly input: typeof INPUT }) => Promise<unknown>
}

describe("useMutateSalesClarifyCommandSwr", () => {
    it("keeps the command on its installation-qualified identity and holds it while disabled", () => {
        expect((useMutateSalesClarifyCommandSwr(SCOPE) as unknown as MutationShape).key).toEqual([
            "sales",
            "clarify-command",
            "workspace-1",
            "instance-1",
            "installation-1",
        ])
        expect((useMutateSalesClarifyCommandSwr(SCOPE, false) as unknown as MutationShape).key).toBeNull()
    })

    it("sends the refinement at the pending clarification revision the input carries", async () => {
        const hook = useMutateSalesClarifyCommandSwr(SCOPE) as unknown as MutationShape
        await hook.mutation({ requestId: "request-1", input: INPUT })
        expect(mocks.api.commandSalesClarifyCommand).toHaveBeenCalledWith("access-token", SCOPE, INPUT, "request-1")
    })

    it("refreshes the same command plan the clarification refined", () => {
        const hook = useMutateSalesClarifyCommandSwr(SCOPE) as unknown as MutationShape
        expect(hook.options.invalidates({ input: INPUT }, { ok: true })).toEqual([
            salesCommandQueryKey(SCOPE, { commandId: "command-1" }),
        ])
        expect(hook.options.shouldInvalidate({ ok: false, code: "outcome_unknown" })).toBe(true)
        expect(hook.options.shouldInvalidate({ ok: false, code: "SALES_REFUSED_UNAVAILABLE" })).toBe(false)
    })
})
