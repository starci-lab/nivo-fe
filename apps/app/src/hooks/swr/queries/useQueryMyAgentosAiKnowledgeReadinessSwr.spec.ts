import { runAndReadMock } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn(
        (
            key: unknown,
            query: (...args: Array<unknown>) => unknown,
            options?: ReadinessQueryOptions,
        ): ReadinessQueryResult => ({ key, query, options }),
    ),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyAgentosAiKnowledgeReadinessSwr } from "./useQueryMyAgentosAiKnowledgeReadinessSwr"
import { QUERY_AGENTOS_AI_KNOWLEDGE_SWR_KEY } from "../swr.shared"

type ReadinessAnswer = { readonly ok: boolean; readonly data?: { readonly readinessStatus: string } }
type ReadinessQueryOptions = {
    readonly refreshInterval?: (latest?: ReadinessAnswer) => number
}
type ReadinessQueryResult = {
    readonly key: unknown
    readonly query: (...args: Array<unknown>) => unknown
    readonly options?: ReadinessQueryOptions
}

const refreshIntervalFor = (result: ReadinessQueryResult) => {
    const refreshInterval = result.options?.refreshInterval
    if (refreshInterval === undefined) throw new Error("Expected a refresh interval")
    return refreshInterval
}

describe("useQueryMyAgentosAiKnowledgeReadinessSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("mounts no read without a workspace and uses its shared key when enabled", () => {
        expect((runAndReadMock(() => useQueryMyAgentosAiKnowledgeReadinessSwr(), useNivoQuery)).key).toBeNull()
        expect((runAndReadMock(() => useQueryMyAgentosAiKnowledgeReadinessSwr("ws-1"), useNivoQuery)).key).toEqual(
            QUERY_AGENTOS_AI_KNOWLEDGE_SWR_KEY("ws-1"),
        )
    })

    it("polls every two seconds only while work is active or the backend is still testing", () => {
        const idle = runAndReadMock(() => useQueryMyAgentosAiKnowledgeReadinessSwr("ws-1"), useNivoQuery)
        const idleRefreshInterval = refreshIntervalFor(idle)
        expect(idleRefreshInterval(undefined)).toBe(0)
        expect(idleRefreshInterval({ ok: false })).toBe(0)
        expect(idleRefreshInterval({ ok: true, data: { readinessStatus: "ready" } })).toBe(0)
        expect(idleRefreshInterval({ ok: true, data: { readinessStatus: "testing" } })).toBe(2_000)

        const inFlight = runAndReadMock(() => useQueryMyAgentosAiKnowledgeReadinessSwr("ws-1", true), useNivoQuery)
        const inFlightRefreshInterval = refreshIntervalFor(inFlight)
        expect(inFlightRefreshInterval(undefined)).toBe(2_000)
        expect(inFlightRefreshInterval({ ok: true, data: { readinessStatus: "ready" } })).toBe(2_000)
    })
})
