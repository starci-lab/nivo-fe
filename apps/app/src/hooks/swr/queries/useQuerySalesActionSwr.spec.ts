import { describe, expect, it, vi } from "vitest"
import { sessionFixture } from "@/test-support/mock-result"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback, Session } from "@/test-support/mock-result"

const mocks = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: QueryMockCallback) => ({ key, query })),
    useSession: vi.fn<() => Session>(),
    api: { readSalesAction: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/sales", () => mocks.api)

import { useQuerySalesActionSwr } from "./useQuerySalesActionSwr"
import { salesActionQueryKey } from "./queries.shared"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }

describe("useQuerySalesActionSwr", () => {
    it("keys one action inside one installation, never across installations", () => {
        expect(salesActionQueryKey(SCOPE, { actionId: "action-1" })).toEqual([
            "sales",
            "action",
            "workspace-1",
            "instance-1",
            "installation-1",
            "action-1",
        ])
        expect(salesActionQueryKey(SCOPE, { actionId: "action-1" })).not.toEqual(
            salesActionQueryKey({ ...SCOPE, installationId: "installation-2" }, { actionId: "action-1" }),
        )
    })

    it("addresses nothing while it is held or no session holds a token", () => {
        expect(
            runAndReadMock(() => useQuerySalesActionSwr(SCOPE, { actionId: "action-1" }, false), mocks.useNivoQuery)
                .key,
        ).toBeNull()
        mocks.useSession.mockReturnValueOnce(sessionFixture({ status: "anonymous" }))
        expect(
            runAndReadMock(() => useQuerySalesActionSwr(SCOPE, { actionId: "action-1" }), mocks.useNivoQuery).key,
        ).toBeNull()
    })

    it("reads the action that discloses the stored state a recovery door needs", async () => {
        const hook = runAndReadMock(() => useQuerySalesActionSwr(SCOPE, { actionId: "action-1" }), mocks.useNivoQuery)
        await hook.query()
        expect(mocks.api.readSalesAction).toHaveBeenCalledWith(
            "access-token",
            SCOPE,
            { actionId: "action-1" },
            "sales.action@1/installation-1/action-1",
        )
    })
})
