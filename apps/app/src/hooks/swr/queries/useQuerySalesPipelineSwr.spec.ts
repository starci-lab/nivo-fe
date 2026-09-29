import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown) => ({ key, query })),
    useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } })),
    api: { readSalesPipeline: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/sales", () => mocks.api)

import { salesPipelineQueryKey, useQuerySalesPipelineSwr } from "./useQuerySalesPipelineSwr"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }
const FINGERPRINT = "a".repeat(64)
const PAGE = { scopeFingerprint: FINGERPRINT, statusFilter: null, after: null, limit: 25 }
type ReadShape = { readonly key: unknown; readonly query: () => Promise<unknown> }

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
        expect((useQuerySalesPipelineSwr(SCOPE, PAGE, false) as unknown as ReadShape).key).toBeNull()
        mocks.useSession.mockReturnValueOnce({ state: { status: "signed-out", accessToken: undefined } } as never)
        expect((useQuerySalesPipelineSwr(SCOPE, PAGE) as unknown as ReadShape).key).toBeNull()
    })

    it("reads one page under its own fingerprint and cursor", async () => {
        const first = useQuerySalesPipelineSwr(SCOPE, PAGE) as unknown as ReadShape
        const next = useQuerySalesPipelineSwr(SCOPE, {
            ...PAGE,
            after: { lastOpportunityId: "opportunity-9" },
        }) as unknown as ReadShape
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
