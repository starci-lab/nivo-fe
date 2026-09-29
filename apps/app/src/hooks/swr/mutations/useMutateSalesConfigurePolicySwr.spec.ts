import { describe, expect, it, vi } from "vitest"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback, MutationMockOptions } from "@/test-support/mock-result"

const mocks = vi.hoisted(() => ({
    useNivoMutation: vi.fn((key: unknown, mutation: QueryMockCallback, options: MutationMockOptions | undefined) => ({ key, mutation, options })),
    useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } })),
    api: { commandSalesConfigurePolicy: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/sales", () => mocks.api)

import { salesPolicyQueryKey } from "../queries/useQuerySalesPolicySwr"
import { useMutateSalesConfigurePolicySwr } from "./useMutateSalesConfigurePolicySwr"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }
const INPUT = {
    requestId: "request-1",
    salesInstallationId: "installation-1",
    expectedPolicyRevision: null as number | null,
    values: {},
}
type MutationShape = {
    readonly key: unknown
    readonly options: {
        readonly invalidates: (trigger: { readonly input: typeof INPUT }, answer: unknown) => ReadonlyArray<unknown>
        readonly shouldInvalidate: (answer: { readonly ok: boolean; readonly code?: string }) => boolean
    }
    readonly mutation: (input: { readonly requestId: string; readonly input: typeof INPUT }) => Promise<unknown>
}

describe("useMutateSalesConfigurePolicySwr", () => {
    it("keeps the command on its installation-qualified identity and holds it while disabled", () => {
        expect((runAndReadMock(() => useMutateSalesConfigurePolicySwr(SCOPE), mocks.useNivoMutation)).key).toEqual([
            "sales",
            "configure-policy",
            "workspace-1",
            "instance-1",
            "installation-1",
        ])
        expect((runAndReadMock(() => useMutateSalesConfigurePolicySwr(SCOPE, false), mocks.useNivoMutation)).key).toBeNull()
    })

    it("sends one press under its own identity through the registered configure address", async () => {
        const hook = runAndReadMock(() => useMutateSalesConfigurePolicySwr(SCOPE), mocks.useNivoMutation)
        await hook.mutation({ requestId: "request-1", input: INPUT })
        expect(mocks.api.commandSalesConfigurePolicy).toHaveBeenCalledWith("access-token", SCOPE, INPUT, "request-1")
    })

    it("refreshes the revision exactly the request identity stored, and only when an effect may exist", () => {
        const hook = runAndReadMock(() => useMutateSalesConfigurePolicySwr(SCOPE), mocks.useNivoMutation)
        expect(hook.options?.invalidates?.({ input: INPUT }, { ok: true })).toEqual([
            salesPolicyQueryKey(SCOPE, { salesInstallationId: "installation-1", requestId: "request-1" }),
        ])
        expect(hook.options?.shouldInvalidate?.({ ok: false, code: "outcome_unknown" })).toBe(true)
        expect(hook.options?.shouldInvalidate?.({ ok: false, code: "SALES_REFUSED_CONFLICT" })).toBe(false)
    })
})
