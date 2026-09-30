import { SurfaceCard, Heading, Text } from "@starci/grammar/common"
import { QueryNoticeView, type QueryNoticeViewData } from "@nivo/ui"
import type { NivoQueryFailure } from "@/modules/query"
import { ModuleRouteShellBlock, type AgentOSModuleView } from "@/components/blocks/agentos/ModuleRouteShellBlock"
import { SetupSurface } from "@/components/blocks/agentos/SetupSurface"
import { TestSurface } from "@/components/blocks/agentos/TestSurface"
import { TestUnavailableSurface } from "@/components/blocks/agentos/TestUnavailableSurface"
import { OperateSurface } from "@/components/blocks/agentos/OperateSurface"
import { SettingsSurface } from "@/components/blocks/agentos/SettingsSurface"
import { DiagnosticsSurface } from "@/components/blocks/agentos/DiagnosticsSurface"
import type {
    AgentOSSolutionModuleScreen,
    AgentOSSolutionModuleShellData,
} from "@/modules/agentos/module-page/surface-types"
import type { ModulePageCopy } from "@/modules/agentos/module-page-copy"

export { exactTestSurfaceFor } from "@/modules/agentos/module-page/exactTestSurfaceFor"
export { buildModulePageCopy } from "@/modules/agentos/module-page-copy"
export type {
    ModulePageMessageKey,
    ModulePageTranslator,
    ModulePageCopy,
    ModulePageCopyProps,
    WithModulePageCopy,
} from "@/modules/agentos/module-page-copy"
export type { AgentOSSolutionModuleScreen } from "@/modules/agentos/module-page/surface-types"

type AgentOSSolutionModuleShellProps = AgentOSSolutionModuleShellData & {
    readonly onBackToModules: () => void
    readonly onNavigate: (view: AgentOSModuleView) => void
}

type AgentOSModuleRoutePageScreenView = {
    readonly state: {
        readonly kind: "screen"
        readonly copy: ModulePageCopy
        readonly screen: AgentOSSolutionModuleScreen
    }
    readonly props: AgentOSSolutionModuleShellData
    readonly on: {
        readonly backToModules: () => void
        readonly navigate: (view: AgentOSModuleView) => void
    }
}

type AgentOSModuleRoutePageFailureView = {
    readonly state: {
        readonly kind: "failed"
        readonly failure: NivoQueryFailure
        readonly notice: QueryNoticeViewData
    }
    readonly props: Record<never, never>
    readonly on: { readonly retry?: () => void }
}

type AgentOSModuleRoutePageRuntimeView = {
    readonly state: {
        readonly kind: "runtime"
        readonly copy: ModulePageCopy
        readonly refused: boolean
    }
    readonly props: Record<never, never>
    readonly on: Record<never, never>
}

/** Complete pure input for every connected module route state. */
export type AgentOSModuleRoutePageBaseProps =
    | AgentOSModuleRoutePageScreenView
    | AgentOSModuleRoutePageFailureView
    | AgentOSModuleRoutePageRuntimeView

const isAgentOSModuleRoutePageFailureView = (
    props: AgentOSModuleRoutePageBaseProps,
): props is AgentOSModuleRoutePageFailureView => props.state.kind === "failed"

const isAgentOSModuleRoutePageRuntimeView = (
    props: AgentOSModuleRoutePageBaseProps,
): props is AgentOSModuleRoutePageRuntimeView => props.state.kind === "runtime"

/** Draw the selected Module Studio screen or its explicit runtime/read state. */
export const AgentOSModuleRoutePageBase = (props: AgentOSModuleRoutePageBaseProps) => {
    if (isAgentOSModuleRoutePageFailureView(props))
        return (
            <QueryNoticeView
                props={props.state.notice}
                on={props.on.retry === undefined ? undefined : { retry: props.on.retry }}
            />
        )
    if (isAgentOSModuleRoutePageRuntimeView(props))
        return <AgentOSSolutionModuleState refused={props.state.refused} copy={props.state.copy} />
    const { copy, screen } = props.state
    const shell: AgentOSSolutionModuleShellProps = {
        ...props.props,
        onBackToModules: props.on.backToModules,
        onNavigate: props.on.navigate,
    }
    if (screen.view === "setup")
        return (
            <ModuleRouteShellBlock
                copy={copy}
                {...shell}
                content={SetupSurface}
                contentProps={{ ...screen.contentProps, copy }}
            />
        )
    if (screen.view === "operate")
        return (
            <ModuleRouteShellBlock
                copy={copy}
                {...shell}
                content={OperateSurface}
                contentProps={{ ...screen.contentProps, copy }}
            />
        )
    if (screen.view === "test-unavailable")
        return <ModuleRouteShellBlock copy={copy} {...shell} content={TestUnavailableSurface} contentProps={{ copy }} />
    if (screen.view === "test")
        return (
            <ModuleRouteShellBlock
                copy={copy}
                {...shell}
                content={TestSurface}
                contentProps={{ ...screen.contentProps, copy }}
            />
        )
    if (screen.view === "settings")
        return (
            <ModuleRouteShellBlock
                copy={copy}
                {...shell}
                content={SettingsSurface}
                contentProps={{ ...screen.contentProps, copy }}
            />
        )
    return (
        <ModuleRouteShellBlock
            copy={copy}
            {...shell}
            content={DiagnosticsSurface}
            contentProps={{ ...screen.contentProps, copy }}
        />
    )
}

/** State accepted by the typed runtime-loading page. */
type AgentOSSolutionModuleStateProps = {
    readonly copy: ModulePageCopy
    readonly refused: boolean
}

/** Draw a typed load or refusal state while no runtime projection is available. */
export const AgentOSSolutionModuleState = (props: AgentOSSolutionModuleStateProps) => {
    const { refused, copy }: AgentOSSolutionModuleStateProps = props
    return (
        <div>
            <div>
                <Heading level={1}>{copy.studioPage.title}</Heading>
            </div>
            <>
                <SurfaceCard label={refused ? copy.shell.unavailable : copy.shell.loading}>
                    <div>
                        {
                            <div>
                                {[
                                    <div key="item-0">
                                        {<Text size="sm">{copy.pageTest.state}</Text>}
                                        {<Text size="sm">{refused ? copy.shell.refused : copy.shell.reading}</Text>}
                                    </div>,
                                ]}
                            </div>
                        }
                    </div>
                </SurfaceCard>
            </>
        </div>
    )
}
