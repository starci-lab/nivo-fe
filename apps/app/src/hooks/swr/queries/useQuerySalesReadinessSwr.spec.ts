import { describe, expect, it, vi } from "vitest"
import { sessionFixture } from "@/test-support/mock-result"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback, Session } from "@/test-support/mock-result"

const mocks = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: QueryMockCallback) => ({ key, query })),
    useSession: vi.fn<() => Session>(),
    api: { readSalesReadiness: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/sales", () => mocks.api)

import { salesReadinessQueryKey, useQuerySalesReadinessSwr } from "./useQuerySalesReadinessSwr"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }

describe("useQuerySalesReadinessSwr", () => {
    it("keys one installation's readiness inside its own installation coordinates", () => {
        expect(salesReadinessQueryKey(SCOPE, { salesInstallationId: "installation-1" })).toEqual([
            "sales",
            "readiness",
            "workspace-1",
            "instance-1",
            "installation-1",
            "installation-1",
        ])
        expect(salesReadinessQueryKey(SCOPE, { salesInstallationId: "installation-1" })).not.toEqual(
            salesReadinessQueryKey(SCOPE, { salesInstallationId: "installation-2" }),
        )
    })

    it("addresses nothing while it is held or no session holds a token", () => {
        expect(
            runAndReadMock(
                () => useQuerySalesReadinessSwr(SCOPE, { salesInstallationId: "installation-1" }, false),
                mocks.useNivoQuery,
            ).key,
        ).toBeNull()
        mocks.useSession.mockReturnValueOnce(sessionFixture({ status: "anonymous" }))
        expect(
            runAndReadMock(
                () => useQuerySalesReadinessSwr(SCOPE, { salesInstallationId: "installation-1" }),
                mocks.useNivoQuery,
            ).key,
        ).toBeNull()
    })

    it("reads readiness through its registered operation address", async () => {
        const hook = runAndReadMock(
            () => useQuerySalesReadinessSwr(SCOPE, { salesInstallationId: "installation-1" }),
            mocks.useNivoQuery,
        )
        await hook.query()
        expect(mocks.api.readSalesReadiness).toHaveBeenCalledWith(
            "access-token",
            SCOPE,
            { salesInstallationId: "installation-1" },
            "sales.readiness@1/installation-1/installation-1",
        )
    })
})
