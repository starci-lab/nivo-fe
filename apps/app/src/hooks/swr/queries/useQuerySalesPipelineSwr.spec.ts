import { describe, expect, it, vi } from "vitest"
import { sessionFixture } from "@/test-support/mock-result"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback, Session } from "@/test-support/mock-result"

const mocks = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: QueryMockCallback) => ({ key, query })),
    useSession: vi.fn<() => Session>(),
    api: { readSalesPipeline: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/sales", () => mocks.api)

import { useQuerySalesPipelineSwr } from "./useQuerySalesPipelineSwr"
import { salesPipelineQueryKey } from "./queries.shared"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }
const FINGERPRINT = "a".repeat(64)
const PAGE = { scopeFingerprint: FINGERPRINT, statusFilter: null, after: null, limit: 25 }

describe("useQuerySalesPipelineSwr", () => {
    it("scopes a page by fingerprint, canonicalised status filter, cursor and page size", () => {
        expect(salesPipelineQueryKey(SCOPE, PAGE)).toEqual([
            "sales",
            "pipeline",
            "workspace-1",
            "instance-1",
            "installation-1",
            FINGERPRINT,
            "all-statuses",
            "first-page",
            25,
        ])
        expect(salesPipelineQueryKey(SCOPE, { ...PAGE, statusFilter: ["won", "open"] })).toEqual(
            salesPipelineQueryKey(SCOPE, { ...PAGE, statusFilter: ["open", "won"] }),
        )
        expect(salesPipelineQueryKey(SCOPE, { ...PAGE, statusFilter: [] })).toContain("all-statuses")
        expect(salesPipelineQueryKey(SCOPE, { ...PAGE, after: { lastOpportunityId: "opportunity-9" } })).toContain(
            "opportunity-9",
        )
    })

    it("addresses nothing while it is held or no session holds a token", () => {
        expect(runAndReadMock(() => useQuerySalesPipelineSwr(SCOPE, PAGE, false), mocks.useNivoQuery).key).toBeNull()
        mocks.useSession.mockReturnValueOnce(sessionFixture({ status: "anonymous" }))
        expect(runAndReadMock(() => useQuerySalesPipelineSwr(SCOPE, PAGE), mocks.useNivoQuery).key).toBeNull()
    })

    it("reads one page under its own fingerprint and cursor", async () => {
        const first = runAndReadMock(() => useQuerySalesPipelineSwr(SCOPE, PAGE), mocks.useNivoQuery)
        const next = runAndReadMock(
            () =>
                useQuerySalesPipelineSwr(SCOPE, {
                    ...PAGE,
                    after: { lastOpportunityId: "opportunity-9" },
                }),
            mocks.useNivoQuery,
        )
        expect(first.key).not.toEqual(next.key)
        await first.query()
        await next.query()
        expect(mocks.api.readSalesPipeline).toHaveBeenNthCalledWith(
            1,
            "access-token",
            SCOPE,
            PAGE,
            `sales.pipeline@1/installation-1/${FINGERPRINT}/-`,
        )
        expect(mocks.api.readSalesPipeline).toHaveBeenNthCalledWith(
            2,
            "access-token",
            SCOPE,
            { ...PAGE, after: { lastOpportunityId: "opportunity-9" } },
            `sales.pipeline@1/installation-1/${FINGERPRINT}/opportunity-9`,
        )
    })
})
