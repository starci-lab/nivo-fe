import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { AgentosModuleRuntime } from "../../modules/api/agentos-module-runtime"
import { type Outcome } from "@nivo/api"
import { MODULE_SETTLE_INTERVAL_MS } from "./agentos.shared"

/*
 * The runtime hook's load-bearing behaviours: the page only sees an installation that belongs to
 * the route's workspace, commands land through `perform`, and the settle wait rides on the SWR
 * query's refreshInterval — a registered predicate keeps the interval on, its answer closes it.
 */

const mocks = vi.hoisted(() => ({
    runtimeData: { value: undefined as Outcome<AgentosModuleRuntime> | undefined },
    runtimeConfig: {
        value: undefined as
            | {
                  refreshInterval?: number
                  onSuccess?: (answer: Outcome<AgentosModuleRuntime>) => void
                  onError?: () => void
              }
            | undefined,
    },
    runtimeMutate: vi.fn(async () => undefined),
    trigger: vi.fn(),
}))

vi.mock("@/hooks/swr/queries/useQueryMyAgentosModuleRuntimeSwr", () => ({
    useQueryMyAgentosModuleRuntimeSwr: (
        _workspaceId: string,
        _installationId: string,
        _diagnostics: boolean,
        config?: unknown,
    ) => {
        mocks.runtimeConfig.value = config as typeof mocks.runtimeConfig.value
        return { data: mocks.runtimeData.value, mutate: mocks.runtimeMutate }
    },
}))
vi.mock("@/hooks/swr/queries/useQueryMyAgentosModuleTestSurfaceSwr", () => ({
    useQueryMyAgentosModuleTestSurfaceSwr: () => ({ data: undefined, mutate: vi.fn() }),
}))
vi.mock("@/hooks/swr/queries/useQueryMyAgentWorkspaceControlCenterSwr", () => ({
    useQueryMyAgentWorkspaceControlCenterSwr: () => ({ data: undefined }),
}))
vi.mock("@/hooks/swr/mutations/console", () => ({
    useMutateManageAgentosModuleRuntimeSwr: () => ({ trigger: mocks.trigger }),
}))

import { moduleRuntimeFixture } from "../../test-support/mock-result"
import { useModuleRuntime } from "./useModuleRuntime"

const input = { workspaceId: "ws-own", installationId: "inst-1", view: "operate" as const }

describe("useModuleRuntime", () => {
    beforeEach(() => {
        mocks.runtimeData.value = undefined
        mocks.trigger.mockReset()
        mocks.runtimeMutate.mockClear()
    })

    it("hands an owned ready runtime to the page and hides a foreign one", () => {
        mocks.runtimeData.value = {
            ok: true,
            data: moduleRuntimeFixture({ installation: { agentWorkspaceId: "ws-own" } }),
        }
        const owned = renderHook(() => useModuleRuntime(input)).result.current
        expect(owned.runtime?.installation.agentWorkspaceId).toBe("ws-own")
        expect(owned.runtimeForeign).toBe(false)

        mocks.runtimeData.value = {
            ok: true,
            data: moduleRuntimeFixture({ installation: { agentWorkspaceId: "ws-other" } }),
        }
        const foreign = renderHook(() => useModuleRuntime(input)).result.current
        expect(foreign.runtime).toBeNull()
        expect(foreign.runtimeForeign).toBe(true)
    })

    it("performs a command, writes the answer into the cache, and refuses on failure", async () => {
        mocks.runtimeData.value = { ok: true, data: moduleRuntimeFixture() }
        const runtime = moduleRuntimeFixture({ installation: { agentWorkspaceId: "ws-own" } })
        mocks.trigger.mockResolvedValueOnce({ ok: true, data: runtime })
        const { result, rerender } = renderHook(() => useModuleRuntime(input))
        const capture: { accepted: AgentosModuleRuntime | null } = { accepted: null }
        await act(async () => {
            capture.accepted = await result.current.controls.perform({
                action: "ENABLE_LIVE",
                installationId: "inst-1",
                idempotencyKey: "k",
            })
        })
        expect(capture.accepted?.installation.id).toBe("installation-fixture")
        expect(mocks.runtimeMutate).toHaveBeenCalledWith({ ok: true, data: runtime }, { revalidate: false })

        mocks.trigger.mockResolvedValueOnce({ ok: false, kind: "refused", code: "x", reason: "r" })
        await act(async () => {
            await result.current.controls.perform({ action: "DISABLE_LIVE", installationId: "inst-1", idempotencyKey: "k" })
        })
        rerender()
        expect(result.current.refused).toBe(true)
    })

    it("turns the settle wait into a refresh interval and closes it on a matching answer", async () => {
        mocks.runtimeData.value = { ok: true, data: moduleRuntimeFixture({ installation: { agentWorkspaceId: "ws-own" } }) }
        const { result } = renderHook(() => useModuleRuntime(input))
        expect(mocks.runtimeConfig.value?.refreshInterval).toBe(0)

        let wait: Promise<AgentosModuleRuntime | null> = Promise.resolve(null)
        act(() => {
            wait = result.current.controls.settleRuntime((candidate) => candidate.installation.liveEnabled)
        })
        expect(mocks.runtimeConfig.value?.refreshInterval).toBe(MODULE_SETTLE_INTERVAL_MS)
        expect(result.current.pending).toBe(true)

        const settled = moduleRuntimeFixture({
            installation: { agentWorkspaceId: "ws-own", liveEnabled: true },
        })
        await act(async () => {
            mocks.runtimeConfig.value?.onSuccess?.({ ok: true, data: settled })
        })
        await expect(wait).resolves.toBe(settled)
        expect(mocks.runtimeConfig.value?.refreshInterval).toBe(0)
        expect(result.current.pending).toBe(false)
    })
})
