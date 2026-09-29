import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery, useAccessToken, chatbotWorkbench } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
    useAccessToken: vi.fn((): string | null => "tok"),
    chatbotWorkbench: vi.fn(),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))
vi.mock("../../auth/useAccessToken", () => ({ useAccessToken }))
vi.mock("@/modules/api/workspace-controlplane", () => ({ chatbotWorkbench }))

import {
    chatbotWorkbenchQueryKey,
    useQueryChatbotWorkbenchSwr,
    type SupportQueryIdentity,
} from "./useQueryChatbotWorkbenchSwr"

const identity: SupportQueryIdentity = {
    hostname: "agent-workspace.nivo.vn",
    workspaceId: "workspace-1",
    installationId: "installation-1",
    enabled: true,
}

describe("workspace control-plane cache identities", () => {
    it("keeps each Chatbot workbench on its installation-qualified cache key", () => {
        expect(chatbotWorkbenchQueryKey(identity)).toEqual([
            "chatbot",
            "workbench",
            "agent-workspace.nivo.vn",
            "workspace-1",
            "installation-1",
        ])
        expect(chatbotWorkbenchQueryKey(identity)).not.toEqual(
            chatbotWorkbenchQueryKey({ ...identity, installationId: "installation-2" }),
        )
    })
})

describe("useQueryChatbotWorkbenchSwr", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useAccessToken.mockReturnValue("tok")
    })

    it("polls an enabled workbench on the three-second SWR refresh interval", () => {
        const hook = useQueryChatbotWorkbenchSwr(identity) as unknown as {
            readonly key: unknown
            readonly options: { readonly refreshInterval: number }
        }
        expect(hook.key).toEqual(chatbotWorkbenchQueryKey(identity))
        expect(hook.options.refreshInterval).toBe(3_000)
    })

    it("mounts no read and no interval while the workbench is disabled", () => {
        const hook = useQueryChatbotWorkbenchSwr({ ...identity, enabled: false }) as unknown as {
            readonly key: unknown
            readonly options: { readonly refreshInterval: number }
        }
        expect(hook.key).toBeNull()
        expect(hook.options.refreshInterval).toBe(0)
    })

    it("mounts no read while the session holds no access token", () => {
        useAccessToken.mockReturnValue(null)
        const hook = useQueryChatbotWorkbenchSwr(identity) as unknown as { readonly key: unknown }
        expect(hook.key).toBeNull()
        expect(chatbotWorkbench).not.toHaveBeenCalled()
    })
})
