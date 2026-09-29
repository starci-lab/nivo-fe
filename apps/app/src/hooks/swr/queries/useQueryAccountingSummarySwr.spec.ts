import { describe, expect, it, vi } from "vitest"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback, Session } from "@/test-support/mock-result"

const mocks = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: QueryMockCallback) => ({ key, query })),
    useSession: vi.fn<() => Session>(),
    api: { readAccountingSummary: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/accounting", () => mocks.api)

import { accountingSummaryQueryKey, useQueryAccountingSummarySwr } from "./useQueryAccountingSummarySwr"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }
const INPUT = {
    periodStart: "2026-09-01",
    periodEndExclusive: "2026-10-01",
    currency: null,
    pageSize: 20,
    cursor: null,
}

describe("useQueryAccountingSummarySwr", () => {
    it("keys one canonical period page, its currency filter and its continuation", () => {
        expect(accountingSummaryQueryKey(SCOPE, INPUT)).toEqual([
            "accounting",
            "summary",
            "workspace-1",
            "instance-1",
            "installation-1",
            "2026-09-01",
            "2026-10-01",
            "all-currencies",
            20,
            "first-page",
        ])
        expect(accountingSummaryQueryKey(SCOPE, INPUT)).not.toEqual(
            accountingSummaryQueryKey(SCOPE, { ...INPUT, periodEndExclusive: "2026-11-01" }),
        )
    })

    it("addresses nothing while it is held", () => {
        expect(
            runAndReadMock(() => useQueryAccountingSummarySwr(SCOPE, INPUT, false), mocks.useNivoQuery).key,
        ).toBeNull()
    })

    it("reads the period through its registered operation address, cursor included", async () => {
        const paged = { ...INPUT, currency: "VND", cursor: "cursor-1" }
        const hook = runAndReadMock(() => useQueryAccountingSummarySwr(SCOPE, paged), mocks.useNivoQuery)
        await hook.query()
        expect(mocks.api.readAccountingSummary).toHaveBeenCalledWith(
            "access-token",
            SCOPE,
            paged,
            "accounting.summary@1/installation-1/2026-09-01/2026-10-01/VND/cursor-1",
        )
    })
})
