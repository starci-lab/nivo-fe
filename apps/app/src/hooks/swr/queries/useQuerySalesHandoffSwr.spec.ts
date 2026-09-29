import { describe, expect, it, vi } from "vitest"
import { sessionFixture } from "@/test-support/mock-result"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback, Session } from "@/test-support/mock-result"

const mocks = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: QueryMockCallback) => ({ key, query })),
    useSession: vi.fn<() => Session>(),
    api: { readSalesHandoff: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/sales", () => mocks.api)

import { salesHandoffQueryKey, useQuerySalesHandoffSwr } from "./useQuerySalesHandoffSwr"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }

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
            runAndReadMock(() => useQuerySalesHandoffSwr(SCOPE, { handoffId: "handoff-1" }, false), mocks.useNivoQuery)
                .key,
        ).toBeNull()
        mocks.useSession.mockReturnValueOnce(sessionFixture({ status: "anonymous" }))
        expect(
            runAndReadMock(() => useQuerySalesHandoffSwr(SCOPE, { handoffId: "handoff-1" }), mocks.useNivoQuery).key,
        ).toBeNull()
    })

    it("reads only the sender's own handoff state through its registered operation address", async () => {
        const hook = runAndReadMock(
            () => useQuerySalesHandoffSwr(SCOPE, { handoffId: "handoff-1" }),
            mocks.useNivoQuery,
        )
        await hook.query()
        expect(mocks.api.readSalesHandoff).toHaveBeenCalledWith(
            "access-token",
            SCOPE,
            { handoffId: "handoff-1" },
            "sales.handoff@1/installation-1/handoff-1",
        )
    })
})
