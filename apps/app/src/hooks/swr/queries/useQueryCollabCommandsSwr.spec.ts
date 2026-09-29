import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery, useAccessToken, api } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
    useAccessToken: vi.fn((): string | null => "tok"),
    api: vi.fn(),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))
vi.mock("../../auth/useAccessToken", () => ({ useAccessToken }))
vi.mock("@/modules/api/collab", () => ({ readCollabAvailableCommands: api }))

import { readCollabAvailableCommands } from "@/modules/api/collab"
import { useQueryCollabCommandsSwr } from "./useQueryCollabCommandsSwr"
import { QUERY_COLLAB_COMMANDS_SWR_KEY } from "../swr.shared"

type QueryResult = { readonly key: unknown; readonly query: () => Promise<unknown>; readonly options?: unknown }

describe("useQueryCollabCommandsSwr", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useAccessToken.mockReturnValue("tok")
    })

    it("uses its shared key and reads the exact workspace-scoped resource", async () => {
        api.mockResolvedValue({ ok: true, data: { status: "unresolved" } })
        const result = useQueryCollabCommandsSwr("ws-1", "Sales") as unknown as QueryResult
        expect(result.key).toEqual(QUERY_COLLAB_COMMANDS_SWR_KEY("ws-1", "Sales"))
        await result.query()
        expect(readCollabAvailableCommands).toHaveBeenCalledWith({ workspaceId: "ws-1", accessToken: "tok", moduleName: "Sales" })
    })

    it("mounts no read without a module name", () => {
            expect((useQueryCollabCommandsSwr("ws-1", null) as unknown as QueryResult).key).toBeNull()
        })
})
