"use client"

import { useCallback, useRef, useState } from "react"
import type { SWRResponse } from "swr"
import { useMutateRunAgentosModuleTestSwr } from "../swr/mutations/console"
import { useQueryMyAgentosModuleTestRunSwr } from "../swr/queries/useQueryMyAgentosModuleTestRunSwr"
import type { AgentosModuleTestContract, AgentosModuleTestSurface } from "../../modules/api/agentos-module-tests"
import type { AgentosRuntimeValue } from "../../modules/api/agentos-runtime-tree"
import { type Outcome } from "@nivo/api"
import type { TestSurfaceProps } from "../../modules/agentos/module-page/surface-types"
import { idempotencyKey, MODULE_SETTLE_ATTEMPTS, MODULE_SETTLE_INTERVAL_MS } from "./agentos.shared"

type AgentosModuleTestTarget = {
    readonly contextVersionId?: string
    readonly setupSessionId?: string
}

/** The test contract and shared command surface the run state machine connects. */
export interface ModuleTestRunInput {
    readonly installationId: string
    readonly testContract: AgentosModuleTestContract | undefined
    readonly testSurfaceQuery: SWRResponse<Outcome<AgentosModuleTestSurface>, Error>
    readonly setPending: (pending: boolean) => void
    readonly setActionRefused: (refused: boolean) => void
}

/**
 * Own the test surface's run lifecycle: the selected scenario and mode, the pane, and starting one
 * scenario run.
 *
 * THE RUN POLL IS AN SWR READ, NOT A LOOP. A started run becomes the test-run query's key and its
 * `refreshInterval` stops the moment the run leaves `running`; unmounting the page cancels the
 * interval outright. The attempt budget still bounds how long a running run may poll.
 */
export const useModuleTestRun = (input: ModuleTestRunInput) => {
    const { installationId, testContract, testSurfaceQuery, setPending, setActionRefused } = input
    const [selectedTestScenarioKey, setSelectedTestScenarioKey] = useState("")
    const [testMode, setTestMode] = useState<"exploratory" | "acceptance">("exploratory")
    const [testPane, setTestPane] = useState<TestSurfaceProps["compactPane"]>("conversation")
    const [activeRunId, setActiveRunId] = useState<string | undefined>(undefined)
    const runAttempts = useRef(0)
    const testMutation = useMutateRunAgentosModuleTestSwr(installationId)

    useQueryMyAgentosModuleTestRunSwr(installationId, activeRunId, {
        // The stop predicate: poll only while the run still reports itself running.
        refreshInterval: (latest) =>
            latest !== undefined && latest.ok && latest.data.run?.status === "running"
                ? MODULE_SETTLE_INTERVAL_MS
                : 0,
        shouldRetryOnError: false,
        onSuccess: (answer) => {
            runAttempts.current += 1
            if (!answer.ok) {
                setPending(false)
                setActionRefused(true)
                setActiveRunId(undefined)
                return
            }
            void testSurfaceQuery.mutate(answer, {
                revalidate: false,
            })
            if (answer.data.run?.status !== "running" || runAttempts.current >= MODULE_SETTLE_ATTEMPTS) {
                setPending(false)
                if (answer.data.run?.status === "running") setActionRefused(true)
                setActiveRunId(undefined)
            }
        },
        onError: () => {
            setPending(false)
            setActionRefused(true)
            setActiveRunId(undefined)
        },
    })

    // The selected scenario is derived, not corrected: a stale key falls back to the first one.
    const selectedScenarioKey =
        testContract !== undefined && testContract.scenarios.some((scenario) => scenario.key === selectedTestScenarioKey)
            ? selectedTestScenarioKey
            : (testContract?.scenarios[0]?.key ?? "")

    const runTest = useCallback(
        async (
            target: AgentosModuleTestTarget,
            mode: "exploratory" | "acceptance",
            scenarioKey: string,
            scenarioInput: Readonly<Record<string, AgentosRuntimeValue>>,
        ) => {
            setPending(true)
            setActionRefused(false)
            const result = await testMutation.trigger({
                installationId,
                ...target,
                mode,
                scenarioKey,
                scenarioInput,
                idempotencyKey: idempotencyKey(),
            })
            if (!result.ok) {
                setPending(false)
                setActionRefused(true)
                return
            }
            await testSurfaceQuery.mutate(result, {
                revalidate: false,
            })
            const runId = result.data.run?.id
            if (runId === undefined || result.data.run?.status !== "running") {
                setPending(false)
                return
            }
            runAttempts.current = 0
            setActiveRunId(runId)
        },
        [installationId, setActionRefused, setPending, testMutation.trigger, testSurfaceQuery],
    )

    return {
        selectedScenarioKey,
        mode: testMode,
        compactPane: testPane,
        run: runTest,
        selectScenario: setSelectedTestScenarioKey,
        selectMode: setTestMode,
        selectPane: setTestPane,
    }
}
