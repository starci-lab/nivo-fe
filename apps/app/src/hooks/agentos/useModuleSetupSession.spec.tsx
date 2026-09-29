import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { AgentosModuleRuntime } from "@/modules/api/agentos-module-runtime"
import { moduleRuntimeFixture, runtimeSessionFixture } from "@/test-support/mock-result"
import type { ModuleRuntimeControls } from "./agentos.shared"
import { useModuleSetupSession } from "./useModuleSetupSession"

/*
 * The setup hook's load-bearing behaviours: the selected revision is derived during render (a stale
 * identity falls back, never corrected by an effect), commands go through the shared `perform`, and
 * the in-flight lock serializes presses.
 */

type SetupRenderProps = { readonly currentRuntime: AgentosModuleRuntime }

const controlsFixture = (
    overrides: Partial<ModuleRuntimeControls> = {},
): ModuleRuntimeControls => ({
    pending: false,
    setPending: vi.fn(),
    setActionRefused: vi.fn(),
    perform: vi.fn(async () => moduleRuntimeFixture()),
    settleRuntime: vi.fn(async () => moduleRuntimeFixture()),
    ...overrides,
})

const setupRuntime = () => {
    const session = runtimeSessionFixture({ id: "s-1", mode: "setup", setupRevision: 1, setupStatus: "open" })
    return moduleRuntimeFixture({ setupSession: session, setupSessions: [session] })
}

describe("useModuleSetupSession", () => {
    it("derives the selected session from the runtime instead of mirroring it", () => {
        const runtime = setupRuntime()
        const { result } = renderHook(() =>
            useModuleSetupSession({ installationId: "inst-1", runtime, controls: controlsFixture() }),
        )
        expect(result.current.selectedSetup?.id).toBe("s-1")
        expect(result.current.draftText).toBe("")
    })

    it("sends a message through perform and waits for the assistant reply", async () => {
        const runtime = setupRuntime()
        const controls = controlsFixture()
        const { result } = renderHook(() =>
            useModuleSetupSession({ installationId: "inst-1", runtime, controls }),
        )
        await act(async () => {
            await result.current.sendMessage("s-1", "hello")
        })
        expect(controls.perform).toHaveBeenCalledWith(
            expect.objectContaining({ action: "APPEND_SETUP_MESSAGE", sessionId: "s-1", content: "hello" }),
            false,
        )
        expect(controls.settleRuntime).toHaveBeenCalled()
        expect(result.current.unconfirmed).toBe(false)
    })

    it("marks the session unconfirmed when the settle wait abandons it", async () => {
        const runtime = setupRuntime()
        const controls = controlsFixture({ settleRuntime: vi.fn(async () => null) })
        const { result } = renderHook(() =>
            useModuleSetupSession({ installationId: "inst-1", runtime, controls }),
        )
        await act(async () => {
            await result.current.sendMessage("s-1", "hello")
        })
        expect(result.current.unconfirmed).toBe(true)
    })

    it("refuses to start a second command while one is pending", () => {
        const runtime = setupRuntime()
        const controls = controlsFixture({ pending: true })
        const { result } = renderHook(() =>
            useModuleSetupSession({ installationId: "inst-1", runtime, controls }),
        )
        act(() => result.current.startRevision())
        expect(controls.perform).not.toHaveBeenCalled()
    })

    it("selects the session a started revision returns once its runtime lands", async () => {
        const runtime = setupRuntime()
        const created = runtimeSessionFixture({ id: "s-2", mode: "setup", setupRevision: 2, setupStatus: "open" })
        const returnedRuntime = moduleRuntimeFixture({
            setupSession: created,
            setupSessions: [created],
        })
        const controls = controlsFixture({
            perform: vi.fn(async (): Promise<AgentosModuleRuntime> => returnedRuntime),
        })
        const { result, rerender } = renderHook(
            ({ currentRuntime }: SetupRenderProps) =>
                useModuleSetupSession({ installationId: "inst-1", runtime: currentRuntime, controls }),
            { initialProps: { currentRuntime: runtime } },
        )
        await act(async () => {
            result.current.startRevision()
            await Promise.resolve()
            await Promise.resolve()
        })
        expect(controls.perform).toHaveBeenCalledWith(
            expect.objectContaining({ action: "START_SETUP_REVISION" }),
            false,
        )
        rerender({ currentRuntime: returnedRuntime })
        expect(result.current.selectedSetup?.id).toBe("s-2")
    })
})
