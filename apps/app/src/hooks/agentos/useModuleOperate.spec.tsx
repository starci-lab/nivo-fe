import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { AgentosModuleRuntime } from "../../modules/api/agentos-module-runtime"
import { moduleRuntimeFixture, runtimeSessionFixture } from "../../test-support/mock-result"
import type { ModuleRuntimeControls } from "./agentos.shared"
import type { SupportQueryIdentity } from "../swr/queries/useQueryChatbotWorkbenchSwr"

/*
 * The operate hook's load-bearing behaviours: a stale session or support identity falls back to
 * the runtime's own during render, session commands go through `perform`, and a refused support
 * action surfaces its code without any effect correcting state.
 */

const mocks = vi.hoisted(() => ({
    chatbotData: { value: undefined as { ok: boolean; data?: unknown; code?: string } | undefined },
    chatbotLoading: { value: false },
    zaloTrigger: vi.fn(),
    setHandoff: vi.fn(),
    resolveHandoff: vi.fn(),
    reconcile: vi.fn(),
}))

vi.mock("@/hooks/swr/queries/useQueryChatbotWorkbenchSwr", () => ({
    useQueryChatbotWorkbenchSwr: () => ({ data: mocks.chatbotData.value, isLoading: mocks.chatbotLoading.value }),
}))
vi.mock("@/hooks/swr/mutations/workspace-controlplane", () => ({
    useMutateStartChatbotZaloOauthSwr: () => ({ trigger: mocks.zaloTrigger }),
    useMutateSetChatbotHandoffSwr: () => ({ trigger: mocks.setHandoff }),
    useMutateResolveChatbotHandoffSwr: () => ({ trigger: mocks.resolveHandoff }),
    useMutateReconcileChatbotDeliverySwr: () => ({ trigger: mocks.reconcile }),
}))

import { useModuleOperate } from "./useModuleOperate"

const controlsFixture = (overrides: Partial<ModuleRuntimeControls> = {}): ModuleRuntimeControls => ({
    pending: false,
    setPending: vi.fn(),
    setActionRefused: vi.fn(),
    perform: vi.fn(async () => moduleRuntimeFixture()),
    settleRuntime: vi.fn(async () => moduleRuntimeFixture()),
    ...overrides,
})

const identity: SupportQueryIdentity = {
    hostname: "box.internal",
    workspaceId: "ws-1",
    installationId: "inst-1",
    enabled: true,
}

const operateRuntime = () =>
    moduleRuntimeFixture({
        installation: { primaryOpsSessionId: "s-1" },
        executeSessions: [
            runtimeSessionFixture({ id: "s-1", mode: "execute" }),
            runtimeSessionFixture({ id: "s-2", mode: "execute" }),
        ],
    })

describe("useModuleOperate", () => {
    beforeEach(() => {
        mocks.chatbotData.value = undefined
        mocks.chatbotLoading.value = false
    })

    it("derives the selected session: stale falls back to the primary", () => {
        const runtime = operateRuntime()
        const { result } = renderHook(() =>
            useModuleOperate({ installationId: "inst-1", runtime, chatbotIdentity: identity, controls: controlsFixture() }),
        )
        expect(result.current.selectedSessionId).toBe("s-1")
        act(() => result.current.selectSession("s-2"))
        expect(result.current.selectedSessionId).toBe("s-2")
        act(() => result.current.selectSession("gone"))
        expect(result.current.selectedSessionId).toBe("s-1")
    })

    it("creates an execute session and returns the id the runtime gained", async () => {
        const runtime = operateRuntime()
        const created = runtimeSessionFixture({ id: "s-3", mode: "execute" })
        const controls = controlsFixture({
            perform: vi.fn(
                async (): Promise<AgentosModuleRuntime> =>
                    moduleRuntimeFixture({ executeSessions: [...runtime.executeSessions, created] }),
            ),
        })
        const { result } = renderHook(() =>
            useModuleOperate({ installationId: "inst-1", runtime, chatbotIdentity: identity, controls }),
        )
        const capture: { sessionId: string | null } = { sessionId: null }
        await act(async () => {
            capture.sessionId = await result.current.createExecuteSession()
        })
        expect(capture.sessionId).toBe("s-3")
        expect(controls.perform).toHaveBeenCalledWith(
            expect.objectContaining({ action: "CREATE_EXECUTE_SESSION", title: "Conversation 3" }),
        )
    })

    it("hands the chatbot read's refusal code to the page", () => {
        mocks.chatbotData.value = { ok: false, code: "CHATBOT_DENIED" }
        const { result } = renderHook(() =>
            useModuleOperate({
                installationId: "inst-1",
                runtime: operateRuntime(),
                chatbotIdentity: identity,
                controls: controlsFixture(),
            }),
        )
        expect(result.current.chatbotRefusedCode).toBe("CHATBOT_DENIED")
        expect(result.current.chatbotWorkbench).toBeNull()
    })

    it("marks a refused support action without hiding the query's own refusal", async () => {
        mocks.setHandoff.mockResolvedValueOnce({ ok: false })
        const { result } = renderHook(() =>
            useModuleOperate({
                installationId: "inst-1",
                runtime: operateRuntime(),
                chatbotIdentity: identity,
                controls: controlsFixture(),
            }),
        )
        await act(async () => {
            result.current.setChatbotHandoff("conv-1")
            await Promise.resolve()
        })
        expect(mocks.setHandoff).toHaveBeenCalledWith(
            expect.objectContaining({ installationId: "inst-1", conversationId: "conv-1" }),
        )
        expect(result.current.chatbotRefusedCode).toBe("CHATBOT_ACTION_REFUSED")
    })
})
