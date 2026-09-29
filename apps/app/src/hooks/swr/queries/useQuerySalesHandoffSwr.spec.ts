import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown) => ({ key, query })),
    useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } })),
    api: { readSalesHandoff: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/sales", () => mocks.api)

import { salesHandoffQueryKey, useQuerySalesHandoffSwr } from "./useQuerySalesHandoffSwr"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }
type ReadShape = { readonly key: unknown; readonly query: () => Promise<unknown> }

describe("useQuerySalesHandoffSwr", () => {
    it("keys one handoff inside one installation, never across installations", () => {
        expect(salesHandoffQueryKey(SCOPE, { handoffId: "handoff-1" })).toEqual([
            "sales",
            "handoff",
            "workspace-1",
            "instance-1",
            "installation-1",
            "handoff-1",
        ])
        expect(salesHandoffQueryKey(SCOPE, { handoffId: "handoff-1" })).not.toEqual(
            salesHandoffQueryKey({ ...SCOPE, installationId: "installation-2" }, { handoffId: "handoff-1" }),
        )
    })

    it("addresses nothing while it is held or no session holds a token", () => {
        expect(
            (useQuerySalesHandoffSwr(SCOPE, { handoffId: "handoff-1" }, false) as unknown as ReadShape).key,
        ).toBeNull()
        mocks.useSession.mockReturnValueOnce({ state: { status: "signed-out", accessToken: undefined } } as never)
        expect((useQuerySalesHandoffSwr(SCOPE, { handoffId: "handoff-1" }) as unknown as ReadShape).key).toBeNull()
    })

    it("reads only the sender's own handoff state through its registered operation address", async () => {
        const hook = useQuerySalesHandoffSwr(SCOPE, { handoffId: "handoff-1" }) as unknown as ReadShape
        await hook.query()
        expect(mocks.api.readSalesHandoff).toHaveBeenCalledWith(
            "access-token",
            SCOPE,
            { handoffId: "handoff-1" },
            "sales.handoff@1/installation-1/handoff-1",
        )
    })
})
