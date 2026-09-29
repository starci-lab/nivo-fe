import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyAgentosAiKnowledgeReadinessSwr } from "./useQueryMyAgentosAiKnowledgeReadinessSwr"
import { QUERY_AGENTOS_AI_KNOWLEDGE_SWR_KEY } from "../swr.shared"

type ReadinessAnswer = { readonly ok: boolean; readonly data?: { readonly readinessStatus: string } }
type ReadinessHook = {
    readonly key: unknown
    readonly options: { readonly refreshInterval: (latest?: ReadinessAnswer) => number }
}

describe("useQueryMyAgentosAiKnowledgeReadinessSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("mounts no read without a workspace and uses its shared key when enabled", () => {
        expect((useQueryMyAgentosAiKnowledgeReadinessSwr() as unknown as ReadinessHook).key).toBeNull()
        expect((useQueryMyAgentosAiKnowledgeReadinessSwr("ws-1") as unknown as ReadinessHook).key).toEqual(
            QUERY_AGENTOS_AI_KNOWLEDGE_SWR_KEY("ws-1"),
        )
    })

    it("polls every two seconds only while work is active or the backend is still testing", () => {
        const idle = useQueryMyAgentosAiKnowledgeReadinessSwr("ws-1") as unknown as ReadinessHook
        expect(idle.options.refreshInterval(undefined)).toBe(0)
        expect(idle.options.refreshInterval({ ok: false })).toBe(0)
        expect(idle.options.refreshInterval({ ok: true, data: { readinessStatus: "ready" } })).toBe(0)
        expect(idle.options.refreshInterval({ ok: true, data: { readinessStatus: "testing" } })).toBe(2_000)

        const inFlight = useQueryMyAgentosAiKnowledgeReadinessSwr("ws-1", true) as unknown as ReadinessHook
        expect(inFlight.options.refreshInterval(undefined)).toBe(2_000)
        expect(inFlight.options.refreshInterval({ ok: true, data: { readinessStatus: "ready" } })).toBe(2_000)
    })
})
