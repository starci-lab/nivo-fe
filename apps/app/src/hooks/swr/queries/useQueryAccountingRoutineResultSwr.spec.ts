import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown) => ({ key, query })),
    useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } })),
    api: { readAccountingRoutineResult: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/accounting", () => mocks.api)

import {
    accountingRoutineResultQueryKey,
    useQueryAccountingRoutineResultSwr,
} from "./useQueryAccountingRoutineResultSwr"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }
type ReadShape = { readonly key: unknown; readonly query: () => Promise<unknown> }

describe("useQueryAccountingRoutineResultSwr", () => {
    it("keys one routine intent inside one installation", () => {
        expect(accountingRoutineResultQueryKey(SCOPE, { intentId: "intent-1" })).toEqual([
            "accounting",
            "routine-result",
            "workspace-1",
            "instance-1",
            "installation-1",
            "intent-1",
        ])
    })

    it("addresses nothing while it is held", () => {
        expect(
            (useQueryAccountingRoutineResultSwr(SCOPE, { intentId: "intent-1" }, false) as unknown as ReadShape).key,
        ).toBeNull()
    })

    it("reads the routine intent through its registered operation address", async () => {
        const hook = useQueryAccountingRoutineResultSwr(SCOPE, { intentId: "intent-1" }) as unknown as ReadShape
        await hook.query()
        expect(mocks.api.readAccountingRoutineResult).toHaveBeenCalledWith(
            "access-token",
            SCOPE,
            { intentId: "intent-1" },
            "accounting.routineResult@1/installation-1/intent-1",
        )
    })
})
