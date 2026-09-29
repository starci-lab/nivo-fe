"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
    useModuleOperate,
    useModuleRuntime,
    useModuleSettings,
    useModuleSetupSession,
    useModuleTestRun,
    useRouter,
} from "@/hooks"
import type { AgentOSModuleView } from "@/components/blocks/agentos/ModuleRouteShellBlock"
import { AgentOSSolutionModuleAttachments } from "@/components/blocks/agentos/AgentOSSolutionModuleAttachments"
import type {
    DiagnosticsSurfaceProps,
    SetupSurfaceProps,
} from "@/modules/agentos/module-page/surface-types"
import { contextDraftFor } from "@/modules/agentos/module-page/setup-draft"
import { moduleScreenFor, moduleShellPropsFor } from "@/modules/agentos/module-page/screens"
import { activeVersionFor } from "@/modules/agentos/module-page/sessions"
import { QueryNotice } from "@/components/blocks/query/QueryNotice"
import {
    AgentOSSolutionModulePageBase,
    AgentOSSolutionModuleState,
    buildModulePageCopy,
} from "./component"

/** Exact workspace and installation route identities connected by the page. */
export type AgentOSSolutionModulePageProps = {
    readonly workspaceId: string
    readonly installationId: string
    readonly view?: AgentOSModuleView
}

/** Connect one stable module shell to its persistent backend runtime and separate task URLs. */
export const AgentOSSolutionModulePage = (props: AgentOSSolutionModulePageProps) => {
    const { workspaceId, installationId, view = "setup" }: AgentOSSolutionModulePageProps = props
    const router = useRouter()
    const t = useTranslations("console.agentos.modules")
    const statusT = useTranslations("console.agentos.workspace.solutions.status")
    const copy = buildModulePageCopy(t)
    const lifecycleLabels: Readonly<Partial<Record<string, string>>> = {
        available: statusT("available"),
        requested: statusT("requested"),
        provisioning: statusT("provisioning"),
        ready: statusT("ready"),
        degraded: statusT("degraded"),
        failed: statusT("failed"),
    }
    const [setupPane, setSetupPane] = useState<SetupSurfaceProps["compactPane"]>("conversation")
    const [diagnosticsPane, setDiagnosticsPane] = useState<DiagnosticsSurfaceProps["compactPane"]>("readiness")
    const [diagnosticSignal, setDiagnosticSignal] =
        useState<DiagnosticsSurfaceProps["selectedSignal"]>("all")

    const moduleRuntime = useModuleRuntime({ workspaceId, installationId, view })
    const { runtime, runtimeReading, runtimeForeign, testSurface, testSurfaceReading } = moduleRuntime
    const setup = useModuleSetupSession({
        installationId,
        runtime,
        controls: moduleRuntime.controls,
    })
    const operate = useModuleOperate({
        installationId,
        runtime,
        chatbotIdentity: moduleRuntime.chatbotIdentity,
        controls: moduleRuntime.controls,
    })
    const testContract = testSurface?.contract ?? runtime?.installation.runtimeManifest.test
    const testRun = useModuleTestRun({
        installationId,
        testContract,
        testSurfaceQuery: moduleRuntime.testSurfaceQuery,
        setPending: moduleRuntime.controls.setPending,
        setActionRefused: moduleRuntime.controls.setActionRefused,
    })
    const settings = useModuleSettings({
        workspaceId,
        installationId,
        runtime,
        view,
        controls: moduleRuntime.controls,
    })

    if (runtimeReading.status === "failed")
        return (
            <QueryNotice props={{ failure: runtimeReading }} on={{ retry: () => void moduleRuntime.runtimeQuery.mutate() }} />
        )
    if (runtimeForeign)
        return (
            <QueryNotice
                props={{
                    failure: {
                        kind: "not-found",
                        code: "MODULE_RUNTIME_FOREIGN",
                        reason: "",
                        retryable: false,
                    },
                }}
            />
        )
    if (testSurfaceReading.status === "failed")
        return (
            <QueryNotice
                props={{ failure: testSurfaceReading }}
                on={{ retry: () => void moduleRuntime.testSurfaceQuery.mutate() }}
            />
        )
    if (runtime === null) return <AgentOSSolutionModuleState refused={moduleRuntime.refused} copy={copy} />

    const activeVersion = activeVersionFor(runtime)
    const draft = contextDraftFor(runtime, setup.selectedSetup, testSurface, copy)
    const moduleRoot = `/agentos/workspaces/${workspaceId}/modules/${installationId}`
    const shell = moduleShellPropsFor({
        workspaceId,
        copy,
        displayName: settings.currentDisplayName,
        runtime,
        lifecycleLabels,
        activeVersion,
        channelAccountRef: settings.currentChannelAccountRef,
        view,
    })
    const screen = moduleScreenFor({
        view,
        runtime,
        copy,
        pending: moduleRuntime.pending,
        refused: moduleRuntime.refused,
        activeVersion,
        draft,
        sourceAttachmentPanel:
            runtime.installation.runtimeManifest.setup?.requirements.some(
                (requirement) => requirement.citationPolicy === "attachment-content",
            ) === true ? (
                <AgentOSSolutionModuleAttachments
                    workspaceId={workspaceId}
                    installationId={installationId}
                    onIndexedAttachmentsChange={setup.updateIndexedSourceAttachments}
                />
            ) : undefined,
        setup: { ...setup, compactPane: setupPane, selectPane: setSetupPane },
        operate: { ...operate, isChatbot: moduleRuntime.isChatbotInstallation },
        test: { ...testRun, contract: testContract, surface: testSurface },
        settings,
        diagnostics: {
            compactPane: diagnosticsPane,
            signal: diagnosticSignal,
            selectPane: setDiagnosticsPane,
            selectSignal: setDiagnosticSignal,
        },
    })
    return (
        <AgentOSSolutionModulePageBase
            state={{ copy, screen }}
            props={shell}
            on={{
                backToModules: () => router.push(`/agentos/workspaces/${workspaceId}/modules`),
                navigate: (nextView) => router.push(`${moduleRoot}/${nextView}`),
            }}
        />
    )
}
