import { describe, expect, it, vi } from "vitest"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback, Session } from "@/test-support/mock-result"

const mocks = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: QueryMockCallback) => ({ key, query })),
    useSession: vi.fn<() => Session>(),
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
            runAndReadMock(
                () => useQueryAccountingRoutineResultSwr(SCOPE, { intentId: "intent-1" }, false),
                mocks.useNivoQuery,
            ).key,
        ).toBeNull()
    })

    it("reads the routine intent through its registered operation address", async () => {
        const hook = runAndReadMock(
            () => useQueryAccountingRoutineResultSwr(SCOPE, { intentId: "intent-1" }),
            mocks.useNivoQuery,
        )
        await hook.query()
        expect(mocks.api.readAccountingRoutineResult).toHaveBeenCalledWith(
            "access-token",
            SCOPE,
            { intentId: "intent-1" },
            "accounting.routineResult@1/installation-1/intent-1",
        )
    })
})
