import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { AgentosModuleTestSurface } from "../../modules/api/agentos-module-tests"
import type { Outcome } from "../../modules/api/outcome"
import { moduleTestSurfaceFixture } from "../../test-support/mock-result"
import { MODULE_SETTLE_INTERVAL_MS } from "./agentos.shared"

/*
 * The test-run hook's load-bearing behaviours: starting a run moves its id into the test-run
 * query's key, the query's refreshInterval polls only while the run reports `running`, and a
 * settled or refused answer ends the wait through the shared pending/refused surface.
 */

type RunConfig = {
    readonly refreshInterval?: (latest: Outcome<AgentosModuleTestSurface> | undefined) => number
    readonly onSuccess?: (answer: Outcome<AgentosModuleTestSurface>) => void
    readonly onError?: () => void
}

const mocks = vi.hoisted(() => ({
    trigger: vi.fn(),
    runQuery: {
        value: { runId: undefined as string | undefined, config: undefined as RunConfig | undefined },
    },
    surfaceMutate: vi.fn(async () => undefined),
    setPending: vi.fn(),
    setActionRefused: vi.fn(),
}))

vi.mock("@/hooks/swr/mutations/console", () => ({
    useMutateRunAgentosModuleTestSwr: () => ({ trigger: mocks.trigger }),
}))
vi.mock("@/hooks/swr/queries/useQueryMyAgentosModuleTestRunSwr", () => ({
    useQueryMyAgentosModuleTestRunSwr: (_installationId: string, runId?: string, config?: RunConfig) => {
        mocks.runQuery.value = { runId, config }
    },
}))

import type { SWRResponse } from "swr"
import { useModuleTestRun } from "./useModuleTestRun"

const surfaceQuery = { mutate: mocks.surfaceMutate } as unknown as SWRResponse<
    Outcome<AgentosModuleTestSurface>,
    Error
>

const input = () => ({
    installationId: "inst-1",
    testContract: moduleTestSurfaceFixture({}).contract,
    testSurfaceQuery: surfaceQuery,
    setPending: mocks.setPending,
    setActionRefused: mocks.setActionRefused,
})

const runningAnswer = (): Outcome<AgentosModuleTestSurface> => ({
    ok: true,
    data: moduleTestSurfaceFixture({ id: "run-1", status: "running" }),
})

describe("useModuleTestRun", () => {
    beforeEach(() => {
        mocks.trigger.mockReset()
        mocks.surfaceMutate.mockClear()
        mocks.setPending.mockClear()
        mocks.setActionRefused.mockClear()
        mocks.runQuery.value = { runId: undefined, config: undefined }
    })

    it("derives the selected scenario from the contract without an effect", () => {
        const { result } = renderHook(() => useModuleTestRun(input()))
        expect(result.current.selectedScenarioKey).toBe("")
        const withScenarios = renderHook(() =>
            useModuleTestRun({
                ...input(),
                testContract: {
                    ...moduleTestSurfaceFixture({}).contract,
                    scenarios: [
                        { key: "a", label: "A", description: "", fixture: {}, assertions: [] },
                        { key: "b", label: "B", description: "", fixture: {}, assertions: [] },
                    ],
                },
            }),
        ).result.current
        expect(withScenarios.selectedScenarioKey).toBe("a")
    })

    it("moves a running run onto the query key and polls while it runs", async () => {
        mocks.trigger.mockResolvedValueOnce(runningAnswer())
        const { result } = renderHook(() => useModuleTestRun(input()))
        await act(async () => {
            await result.current.run({}, "exploratory", "a", {})
        })
        expect(mocks.trigger).toHaveBeenCalledWith(
            expect.objectContaining({ installationId: "inst-1", scenarioKey: "a", mode: "exploratory" }),
        )
        expect(mocks.runQuery.value.runId).toBe("run-1")
        const interval = mocks.runQuery.value.config?.refreshInterval
        expect(interval?.(runningAnswer())).toBe(MODULE_SETTLE_INTERVAL_MS)
        const settledAnswer: Outcome<AgentosModuleTestSurface> = {
            ok: true,
            data: moduleTestSurfaceFixture({ id: "run-1", status: "passed" }),
        }
        expect(interval?.(settledAnswer)).toBe(0)
        expect(interval?.(undefined)).toBe(0)
    })

    it("ends the wait on a settled answer and writes it into the surface cache", async () => {
        mocks.trigger.mockResolvedValueOnce(runningAnswer())
        const { result } = renderHook(() => useModuleTestRun(input()))
        await act(async () => {
            await result.current.run({}, "exploratory", "a", {})
        })
        const settled: Outcome<AgentosModuleTestSurface> = {
            ok: true,
            data: moduleTestSurfaceFixture({ id: "run-1", status: "passed" }),
        }
        await act(async () => {
            mocks.runQuery.value.config?.onSuccess?.(settled)
        })
        expect(mocks.surfaceMutate).toHaveBeenCalledWith(settled, { revalidate: false })
        expect(mocks.setPending).toHaveBeenLastCalledWith(false)
        expect(mocks.runQuery.value.runId).toBeUndefined()
    })

    it("marks the shared refused surface when the run start is refused", async () => {
        mocks.trigger.mockResolvedValueOnce({ ok: false, kind: "refused", code: "x", reason: "r" })
        const { result } = renderHook(() => useModuleTestRun(input()))
        await act(async () => {
            await result.current.run({}, "acceptance", "a", {})
        })
        expect(mocks.setActionRefused).toHaveBeenCalledWith(true)
        expect(mocks.setPending).toHaveBeenLastCalledWith(false)
        expect(mocks.runQuery.value.runId).toBeUndefined()
    })
})
