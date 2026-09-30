import { describe, expect, it, vi } from "vitest"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback, Session } from "@/test-support/mock-result"

const mocks = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: QueryMockCallback) => ({ key, query })),
    useSession: vi.fn<() => Session>(),
    api: { readAccountingResultDetail: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: mocks.useSession }))
vi.mock("@/modules/api/accounting", () => mocks.api)

import { useQueryAccountingResultDetailSwr } from "./useQueryAccountingResultDetailSwr"
import { accountingResultDetailQueryKey } from "./queries.shared"

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" }

describe("useQueryAccountingResultDetailSwr", () => {
    it("keys a current result and an as-of item as two different reads", () => {
        const current = accountingResultDetailQueryKey(SCOPE, { action: "current", resultId: "result-1" })
        const asOf = accountingResultDetailQueryKey(SCOPE, {
            action: "asOf",
            itemId: "item-1",
            asOf: "2026-09-18T00:00:00Z",
        })
        expect(current).toEqual([
            "accounting",
            "result-detail",
            "workspace-1",
            "instance-1",
            "installation-1",
            "current",
            "result-1",
            "current",
        ])
        expect(asOf).toEqual([
            "accounting",
            "result-detail",
            "workspace-1",
            "instance-1",
            "installation-1",
            "asOf",
            "item-1",
            "2026-09-18T00:00:00Z",
        ])
        expect(current).not.toEqual(asOf)
    })

    it("addresses nothing while it is held", () => {
        expect(
            runAndReadMock(
                () => useQueryAccountingResultDetailSwr(SCOPE, { action: "current", resultId: "result-1" }, false),
                mocks.useNivoQuery,
            ).key,
        ).toBeNull()
    })

    it("reads the current result and the as-of item through their registered operation address", async () => {
        await runAndReadMock(
            () =>
                useQueryAccountingResultDetailSwr(SCOPE, {
                    action: "current",
                    resultId: "result-1",
                }),
            mocks.useNivoQuery,
        ).query()
        expect(mocks.api.readAccountingResultDetail).toHaveBeenCalledWith(
            "access-token",
            SCOPE,
            { action: "current", resultId: "result-1" },
            "accounting.resultDetail@1/installation-1/result-1/-",
        )
        await runAndReadMock(
            () =>
                useQueryAccountingResultDetailSwr(SCOPE, {
                    action: "asOf",
                    itemId: "item-1",
                    asOf: "2026-09-18T00:00:00Z",
                }),
            mocks.useNivoQuery,
        ).query()
        expect(mocks.api.readAccountingResultDetail).toHaveBeenLastCalledWith(
            "access-token",
            SCOPE,
            { action: "asOf", itemId: "item-1", asOf: "2026-09-18T00:00:00Z" },
            "accounting.resultDetail@1/installation-1/item-1/2026-09-18T00:00:00Z",
        )
    })
})
