
import type { MyAgentosModuleRuntimeQuery } from "@/modules/api/__generated__/core"

import type { AgentOSModuleView } from "../../../components/blocks/agentos/ModuleRouteShellBlock"
import type { ContextDraft } from "../../../components/blocks/agentos/ContextVersionBlock"
import type { Formatter } from "../../i18n/formatter"
import type { ModulePageCopy } from "../module-page-copy"
import { channelLabelFor } from "./channel-identity"
import {
    diagnosticsContentPropsFor,
    operateContentPropsFor,
    settingsContentPropsFor,
    setupContentPropsFor,
    testContentPropsFor,
    type ModuleDiagnosticsView,
    type ModuleOperateView,
    type ModuleSettingsView,
    type ModuleSetupView,
    type ModuleTestView,
} from "./content-props"
import type {
    AgentOSSolutionModuleScreen,
    AgentOSSolutionModuleShellData,
} from "./surface-types"

/** The connected facts the shell strip is built from. */
type ModuleShellInput = {
    readonly workspaceId: string
    readonly copy: ModulePageCopy
    readonly displayName: string
    readonly runtime: NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]>
    readonly lifecycleLabels: Readonly<Partial<Record<string, string>>>
    readonly activeVersion: number | null
    readonly channelAccountRef: string | null
    readonly view: AgentOSModuleView
}

/** The shell strip one module route draws above whichever pane is active. */
export const moduleShellPropsFor = (input: ModuleShellInput): AgentOSSolutionModuleShellData => ({
    workspaceLabel: input.copy.shell.workspace({ id: input.workspaceId.slice(0, 8) }),
    moduleName: input.displayName,
    moduleKind: input.runtime.installation.kindKey,
    lifecycleLabel: input.runtime.installation.liveEnabled
        ? input.copy.shell.live
        : ((Object.hasOwn(input.lifecycleLabels, input.runtime.installation.status)
              ? input.lifecycleLabels[input.runtime.installation.status]
              : undefined) ?? input.copy.shell.unknownStatus({ status: input.runtime.installation.status })),
    contextVersion: input.activeVersion === null ? input.copy.setup.notApplied : `v${input.activeVersion}`,
    channelLabel: channelLabelFor(input.channelAccountRef, input.copy),
    controllerLabel:
        input.runtime.diagnostics.controllerHealthy === false ||
        input.runtime.diagnostics.controllerStatus === "degraded"
            ? input.copy.shell.controllerAttention
            : input.copy.shell.controllerHealthy,
    activeView: input.view,
})

/** Everything one view's settled screen state is built from. */
export type ModuleScreenSource = {
    readonly runtime: NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]>
    readonly copy: ModulePageCopy
    readonly format: Formatter
    readonly view: AgentOSModuleView
    readonly pending: boolean
    readonly refused: boolean
    readonly activeVersion: number | null
    readonly draft: ContextDraft | null
    /** Attachment identity and update action for the Setup surface's source panel. */
    readonly sourceAttachments: SetupSurfaceProps["sourceAttachments"]
    readonly setup: ModuleSetupView
    readonly operate: ModuleOperateView
    readonly test: ModuleTestView
    readonly settings: ModuleSettingsView
    readonly diagnostics: ModuleDiagnosticsView
}

/** The settled screen state one module route hands to the drawing component. */
export const moduleScreenFor = (source: ModuleScreenSource): AgentOSSolutionModuleScreen => {
    const { view } = source
    if (view === "setup")
        return {
            view: "setup",
            contentProps: setupContentPropsFor({
                runtime: source.runtime,
                activeVersion: source.activeVersion,
                draft: source.draft,
                pending: source.pending,
                refused: source.refused,
                sourceAttachments: source.sourceAttachments,
                setup: source.setup,
            }),
        }
    if (view === "operate")
        return {
            view: "operate",
            contentProps: operateContentPropsFor({
                runtime: source.runtime,
                copy: source.copy,
                pending: source.pending,
                refused: source.refused,
                format: source.format,
                operate: source.operate,
            }),
        }
    if (view === "test") {
        const contentProps = testContentPropsFor({
            copy: source.copy,
            draft: source.draft,
            pending: source.pending,
            test: source.test,
        })
        return contentProps === undefined ? { view: "test-unavailable" } : { view: "test", contentProps }
    }
    if (view === "settings")
        return {
            view: "settings",
            contentProps: settingsContentPropsFor({
                runtime: source.runtime,
                activeVersion: source.activeVersion,
                pending: source.pending,
                refused: source.refused,
                settings: source.settings,
            }),
        }
    return {
        view: "diagnostics",
        contentProps: diagnosticsContentPropsFor({ runtime: source.runtime, diagnostics: source.diagnostics }),
    }
}
