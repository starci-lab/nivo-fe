"use client"

import { useCallback, useRef, useState } from "react"
import { useMutateManageAgentosModuleRuntimeSwr } from "../swr/mutations/console"
import { useQueryMyAgentWorkspaceControlCenterSwr } from "../swr/queries/useQueryMyAgentWorkspaceControlCenterSwr"
import { useQueryMyAgentosModuleRuntimeSwr } from "../swr/queries/useQueryMyAgentosModuleRuntimeSwr"
import { useQueryMyAgentosModuleTestSurfaceSwr } from "../swr/queries/useQueryMyAgentosModuleTestSurfaceSwr"
import type {
    AgentosModuleRuntime,
    ManageAgentosModuleRuntimeInput,
} from "@/modules/api/agentos-module-runtime"
import type { Outcome } from "@/modules/api/outcome"
import type { AgentOSModuleView } from "@/components/blocks/agentos/ModuleRouteShellBlock"
import { nivoQueryReading } from "@/modules/query"
import { controllerHostnameForWorkspace } from "@/modules/agentos/module-page/channel-identity"
import { foreignRuntimeFor, runtimeForWorkspace } from "@/modules/agentos/module-page/runtime-values"
import {
    MODULE_SETTLE_ATTEMPTS,
    MODULE_SETTLE_INTERVAL_MS,
    type ModuleRuntimeControls,
} from "./agentos.shared"

/** The runtime identities and the active view one module page connects. */
export interface ModuleRuntimeQueryInput {
    readonly workspaceId: string
    readonly installationId: string
    readonly view: AgentOSModuleView
}

type SettleWaiter = {
    readonly predicate: (candidate: AgentosModuleRuntime) => boolean
    readonly markRefused: boolean
    readonly resolve: (runtime: AgentosModuleRuntime | null) => void
    attempts: number
}

/**
 * Own the module runtime projection, the shared pending/refused surface and the commands every
 * pane issues through `perform`.
 *
 * THE SETTLE WAIT IS AN SWR POLL, NOT A LOOP. `settleRuntime` registers a predicate, marks the
 * page pending and turns on the runtime query's `refreshInterval`; each revalidation evaluates the
 * waiter until it is satisfied, the answer fails, or the attempt budget ends. Unmounting cancels
 * the interval outright and a newer wait resolves the abandoned one with null, so nothing writes
 * into a page that is gone.
 */
export const useModuleRuntime = (input: ModuleRuntimeQueryInput) => {
    const { workspaceId, installationId, view } = input
    const [pending, setPending] = useState(false)
    const [actionRefused, setActionRefused] = useState(false)
    const [settling, setSettling] = useState(false)
    const settleWaiter = useRef<SettleWaiter | null>(null)

    const closeSettle = useCallback((waiter: SettleWaiter, result: AgentosModuleRuntime | null) => {
        settleWaiter.current = null
        setSettling(false)
        setPending(false)
        if (result === null && waiter.markRefused) setActionRefused(true)
        waiter.resolve(result)
    }, [])
    const settleAnswered = useCallback(
        (answer: Outcome<AgentosModuleRuntime>) => {
            const waiter = settleWaiter.current
            if (waiter === null) return
            waiter.attempts += 1
            if (!answer.ok || answer.data.installation.agentWorkspaceId !== workspaceId) {
                closeSettle(waiter, null)
                return
            }
            if (waiter.predicate(answer.data)) {
                closeSettle(waiter, answer.data)
                return
            }
            if (waiter.attempts >= MODULE_SETTLE_ATTEMPTS) closeSettle(waiter, null)
        },
        [closeSettle, workspaceId],
    )
    const settleFailed = useCallback(() => {
        const waiter = settleWaiter.current
        if (waiter !== null) closeSettle(waiter, null)
    }, [closeSettle])

    const runtimeQuery = useQueryMyAgentosModuleRuntimeSwr(workspaceId, installationId, view === "diagnostics", {
        refreshInterval: settling ? MODULE_SETTLE_INTERVAL_MS : 0,
        onSuccess: settleAnswered,
        onError: settleFailed,
    })
    const runtimeMutation = useMutateManageAgentosModuleRuntimeSwr(installationId)
    const testSurfaceQuery = useQueryMyAgentosModuleTestSurfaceSwr(
        installationId,
        view === "test" || view === "setup",
    )

    const runtimeReading = nivoQueryReading(runtimeQuery.data)
    const runtime = runtimeForWorkspace(runtimeReading, workspaceId)
    const runtimeForeign = foreignRuntimeFor(runtimeReading, workspaceId)
    const testSurfaceReading = nivoQueryReading(testSurfaceQuery.data)
    const testSurface = testSurfaceReading.status === "ready" ? testSurfaceReading.data : null

    const isChatbotInstallation =
        runtime !== null &&
        ["chatbot", "agentos-chatbot", "multichannel-chatbot"].includes(runtime.installation.moduleKey)
    const chatbotEnabled = view === "operate" && isChatbotInstallation
    const controlCenter = useQueryMyAgentWorkspaceControlCenterSwr(workspaceId, chatbotEnabled)
    const chatbotIdentity = {
        hostname: controllerHostnameForWorkspace(controlCenter.data, workspaceId),
        workspaceId,
        installationId,
        enabled: chatbotEnabled,
    }

    const perform = useCallback(
        async (command: ManageAgentosModuleRuntimeInput, markRefused = true): Promise<AgentosModuleRuntime | null> => {
            setPending(true)
            setActionRefused(false)
            const result = await runtimeMutation.trigger(command)
            setPending(false)
            if (!result.ok || result.data.installation.agentWorkspaceId !== workspaceId) {
                if (markRefused) setActionRefused(true)
                return null
            }
            await runtimeQuery.mutate(result, {
                revalidate: false,
            })
            return result.data
        },
        [runtimeMutation.trigger, runtimeQuery, workspaceId],
    )
    const settleRuntime = useCallback(
        (
            predicate: (candidate: AgentosModuleRuntime) => boolean,
            markRefused = true,
        ): Promise<AgentosModuleRuntime | null> => {
            // A newer wait abandons the one in flight: it settles nothing and touches no state.
            settleWaiter.current?.resolve(null)
            settleWaiter.current = { predicate, markRefused, resolve: () => undefined, attempts: 0 }
            setPending(true)
            setSettling(true)
            return new Promise<AgentosModuleRuntime | null>((resolve) => {
                settleWaiter.current = { predicate, markRefused, resolve, attempts: 0 }
            })
        },
        [],
    )

    const controls: ModuleRuntimeControls = {
        pending,
        setPending,
        setActionRefused,
        perform,
        settleRuntime,
    }
    return {
        runtime,
        runtimeReading,
        runtimeForeign,
        runtimeQuery,
        testSurface,
        testSurfaceReading,
        testSurfaceQuery,
        chatbotIdentity,
        isChatbotInstallation,
        pending,
        refused: actionRefused,
        controls,
    }
}
