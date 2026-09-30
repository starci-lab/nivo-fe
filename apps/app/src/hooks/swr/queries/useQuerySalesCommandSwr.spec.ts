import { describe, expect, it, vi } from "vitest"
import { sessionFixture } from "@/test-support/mock-result"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback, Session } from "@/test-support/mock-result"

const mocks = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: QueryMockCallback) => ({ key, query })),
    useSession: vi.fn<() => Session>(),
    api: { readSalesCommand: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/sales", () => mocks.api)

import { useQuerySalesCommandSwr } from "./useQuerySalesCommandSwr"
import { salesCommandQueryKey } from "./queries.shared"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }

describe("useQuerySalesCommandSwr", () => {
    it("keys one command plan inside one installation, never across installations", () => {
        expect(salesCommandQueryKey(SCOPE, { commandId: "command-1" })).toEqual([
            "sales",
            "command",
            "workspace-1",
            "instance-1",
            "installation-1",
            "command-1",
        ])
        expect(salesCommandQueryKey(SCOPE, { commandId: "command-1" })).not.toEqual(
            salesCommandQueryKey({ ...SCOPE, installationId: "installation-2" }, { commandId: "command-1" }),
        )
    })

    it("addresses nothing while it is held or no session holds a token", () => {
        expect(
            runAndReadMock(() => useQuerySalesCommandSwr(SCOPE, { commandId: "command-1" }, false), mocks.useNivoQuery)
                .key,
        ).toBeNull()
        mocks.useSession.mockReturnValueOnce(sessionFixture({ status: "anonymous" }))
        expect(
            runAndReadMock(() => useQuerySalesCommandSwr(SCOPE, { commandId: "command-1" }), mocks.useNivoQuery).key,
        ).toBeNull()
    })

    it("reconciles a press by reading the same command identity, never a second one", async () => {
        const hook = runAndReadMock(
            () => useQuerySalesCommandSwr(SCOPE, { commandId: "command-1" }),
            mocks.useNivoQuery,
        )
        await hook.query()
        expect(mocks.api.readSalesCommand).toHaveBeenCalledWith(
            "access-token",
            SCOPE,
            { commandId: "command-1" },
            "sales.command@1/installation-1/command-1",
        )
    })
})
