import { describe, expect, it, vi } from "vitest"
import { sessionFixture } from "@/test-support/mock-result"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback, Session } from "@/test-support/mock-result"

const mocks = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: QueryMockCallback) => ({ key, query })),
    useSession: vi.fn<() => Session>(),
    api: { readSalesPolicy: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/sales", () => mocks.api)

import { salesPolicyQueryKey, useQuerySalesPolicySwr } from "./useQuerySalesPolicySwr"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }
type ReadShape = { readonly key: unknown; readonly query: () => Promise<unknown> }

describe("useQuerySalesPolicySwr", () => {
    it("keys the current revision apart from the one a configure request stored, never across installations", () => {
        expect(salesPolicyQueryKey(SCOPE, { salesInstallationId: "installation-1", requestId: null })).toEqual([
            "sales",
            "policy",
            "workspace-1",
            "instance-1",
            "installation-1",
            "current-revision",
        ])
        expect(
            salesPolicyQueryKey(SCOPE, { salesInstallationId: "installation-1", requestId: "request-1" }),
        ).not.toEqual(salesPolicyQueryKey(SCOPE, { salesInstallationId: "installation-1", requestId: null }))
        expect(
            salesPolicyQueryKey(SCOPE, { salesInstallationId: "installation-1", requestId: "request-1" }),
        ).not.toEqual(
            salesPolicyQueryKey(
                { ...SCOPE, installationId: "installation-2" },
                { salesInstallationId: "installation-2", requestId: "request-1" },
            ),
        )
    })

    it("addresses nothing while it is held or no session holds a token", () => {
        expect(
            (
                runAndReadMock(() => useQuerySalesPolicySwr(
                    SCOPE,
                    { salesInstallationId: "installation-1", requestId: null },
                    false,
                ), mocks.useNivoQuery)
            ).key,
        ).toBeNull()
        mocks.useSession.mockReturnValueOnce(sessionFixture({ status: "anonymous" }))
        expect(
            (
                runAndReadMock(() => useQuerySalesPolicySwr(SCOPE, {
                    salesInstallationId: "installation-1",
                    requestId: null,
                }), mocks.useNivoQuery)
            ).key,
        ).toBeNull()
    })

    it("reads through its registered operation address, carrying the request identity a replay is reconciled by", async () => {
        const current = runAndReadMock(() => useQuerySalesPolicySwr(SCOPE, {
            salesInstallationId: "installation-1",
            requestId: null,
        }), mocks.useNivoQuery)
        await current.query()
        expect(mocks.api.readSalesPolicy).toHaveBeenCalledWith(
            "access-token",
            SCOPE,
            { salesInstallationId: "installation-1", requestId: null },
            "sales.policy@1/installation-1/-",
        )
        const stored = runAndReadMock(() => useQuerySalesPolicySwr(SCOPE, {
            salesInstallationId: "installation-1",
            requestId: "request-1",
        }), mocks.useNivoQuery)
        await stored.query()
        expect(mocks.api.readSalesPolicy).toHaveBeenLastCalledWith(
            "access-token",
            SCOPE,
            { salesInstallationId: "installation-1", requestId: "request-1" },
            "sales.policy@1/installation-1/request-1",
        )
    })
})
