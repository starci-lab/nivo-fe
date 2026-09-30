import { describe, expect, it, vi } from "vitest"
import { sessionFixture } from "@/test-support/mock-result"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback, Session } from "@/test-support/mock-result"

const mocks = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: QueryMockCallback) => ({ key, query })),
    useSession: vi.fn<() => Session>(),
    api: { readSalesDecisionRequest: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/sales", () => mocks.api)

import { useQuerySalesDecisionRequestSwr } from "./useQuerySalesDecisionRequestSwr"
import { salesDecisionRequestQueryKey } from "./queries.shared"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }

describe("useQuerySalesDecisionRequestSwr", () => {
    it("keys one decision request inside one installation, never across installations", () => {
        expect(salesDecisionRequestQueryKey(SCOPE, { decisionRequestId: "decision-1" })).toEqual([
            "sales",
            "decision-request",
            "workspace-1",
            "instance-1",
            "installation-1",
            "decision-1",
        ])
        expect(salesDecisionRequestQueryKey(SCOPE, { decisionRequestId: "decision-1" })).not.toEqual(
            salesDecisionRequestQueryKey(
                { ...SCOPE, installationId: "installation-2" },
                { decisionRequestId: "decision-1" },
            ),
        )
    })

    it("addresses nothing while it is held or no session holds a token", () => {
        expect(
            runAndReadMock(
                () => useQuerySalesDecisionRequestSwr(SCOPE, { decisionRequestId: "decision-1" }, false),
                mocks.useNivoQuery,
            ).key,
        ).toBeNull()
        mocks.useSession.mockReturnValueOnce(sessionFixture({ status: "anonymous" }))
        expect(
            runAndReadMock(
                () => useQuerySalesDecisionRequestSwr(SCOPE, { decisionRequestId: "decision-1" }),
                mocks.useNivoQuery,
            ).key,
        ).toBeNull()
    })

    it("settles an answer from the decision request's own committed state", async () => {
        const hook = runAndReadMock(
            () => useQuerySalesDecisionRequestSwr(SCOPE, { decisionRequestId: "decision-1" }),
            mocks.useNivoQuery,
        )
        await hook.query()
        expect(mocks.api.readSalesDecisionRequest).toHaveBeenCalledWith(
            "access-token",
            SCOPE,
            { decisionRequestId: "decision-1" },
            "sales.decisionRequest@1/installation-1/decision-1",
        )
    })
})
