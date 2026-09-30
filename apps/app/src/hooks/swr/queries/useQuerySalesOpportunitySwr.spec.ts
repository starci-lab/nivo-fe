import { describe, expect, it, vi } from "vitest"
import { sessionFixture } from "@/test-support/mock-result"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback, Session } from "@/test-support/mock-result"

const mocks = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: QueryMockCallback) => ({ key, query })),
    useSession: vi.fn<() => Session>(),
    api: { readSalesOpportunity: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/sales", () => mocks.api)

import { useQuerySalesOpportunitySwr } from "./useQuerySalesOpportunitySwr"
import { salesOpportunityQueryKey } from "./queries.shared"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }

describe("useQuerySalesOpportunitySwr", () => {
    it("keys one opportunity inside one installation, never across installations", () => {
        expect(salesOpportunityQueryKey(SCOPE, { opportunityId: "opportunity-1" })).toEqual([
            "sales",
            "opportunity",
            "workspace-1",
            "instance-1",
            "installation-1",
            "opportunity-1",
        ])
        expect(salesOpportunityQueryKey(SCOPE, { opportunityId: "opportunity-1" })).not.toEqual(
            salesOpportunityQueryKey(
                { ...SCOPE, installationId: "installation-2" },
                { opportunityId: "opportunity-1" },
            ),
        )
    })

    it("addresses nothing while it is held or no session holds a token", () => {
        expect(
            runAndReadMock(
                () => useQuerySalesOpportunitySwr(SCOPE, { opportunityId: "opportunity-1" }, false),
                mocks.useNivoQuery,
            ).key,
        ).toBeNull()
        mocks.useSession.mockReturnValueOnce(sessionFixture({ status: "anonymous" }))
        expect(
            runAndReadMock(
                () => useQuerySalesOpportunitySwr(SCOPE, { opportunityId: "opportunity-1" }),
                mocks.useNivoQuery,
            ).key,
        ).toBeNull()
    })

    it("reads one opportunity under the address that names it", async () => {
        const hook = runAndReadMock(
            () => useQuerySalesOpportunitySwr(SCOPE, { opportunityId: "opportunity-1" }),
            mocks.useNivoQuery,
        )
        await hook.query()
        expect(mocks.api.readSalesOpportunity).toHaveBeenCalledWith(
            "access-token",
            SCOPE,
            { opportunityId: "opportunity-1" },
            "sales.opportunity@1/installation-1/opportunity-1",
        )
    })
})
