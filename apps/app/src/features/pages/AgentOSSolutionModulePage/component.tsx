import { SurfaceCard, Heading, Text } from "@starci/grammar/common"
import { ModuleRouteShellBlock, type AgentOSModuleView } from "../../../components/blocks/agentos/ModuleRouteShellBlock"
import { SetupSurface } from "../../../components/blocks/agentos/SetupSurface"
import { TestSurface } from "../../../components/blocks/agentos/TestSurface"
import { TestUnavailableSurface } from "../../../components/blocks/agentos/TestUnavailableSurface"
import { OperateSurface } from "../../../components/blocks/agentos/OperateSurface"
import { SettingsSurface } from "../../../components/blocks/agentos/SettingsSurface"
import { DiagnosticsSurface } from "../../../components/blocks/agentos/DiagnosticsSurface"
import type {
    AgentOSSolutionModuleScreen,
    AgentOSSolutionModuleShellData,
} from "../../../modules/agentos/module-page/surface-types"
import type { ModulePageCopy } from "../../../modules/agentos/module-page-copy"

export { exactTestSurfaceFor } from "../../../modules/agentos/module-page/exactTestSurfaceFor"
export { buildModulePageCopy } from "../../../modules/agentos/module-page-copy"
export type {
    ModulePageMessageKey,
    ModulePageTranslator,
    ModulePageCopy,
    ModulePageCopyProps,
    WithModulePageCopy,
} from "../../../modules/agentos/module-page-copy"
export type { AgentOSSolutionModuleScreen } from "../../../modules/agentos/module-page/surface-types"

/** Complete screen contract accepted by the connected module route. */
export type AgentOSSolutionModulePageProps = AgentOSSolutionModulePageViewProps

type AgentOSSolutionModuleShellProps = AgentOSSolutionModuleShellData & {
    readonly onBackToModules: () => void
    readonly onNavigate: (view: AgentOSModuleView) => void
}

/** Settled page state handed to the pure half for drawing. */
export type AgentOSSolutionModulePageState = {
    readonly copy: ModulePageCopy
    readonly screen: AgentOSSolutionModuleScreen
}

/** Shell data drawn alongside the selected module screen. */
export type AgentOSSolutionModulePageData = AgentOSSolutionModuleShellData

/** Shell actions resolved by the connected module route. */
export type AgentOSSolutionModulePageActions = {
    readonly backToModules: () => void
    readonly navigate: (view: AgentOSModuleView) => void
}

/** Complete world-free contract for the persistent module shell and selected screen. */
export type AgentOSSolutionModulePageViewProps = {
    readonly state: AgentOSSolutionModulePageState
    readonly props: AgentOSSolutionModulePageData
    readonly on: AgentOSSolutionModulePageActions
}

/** Draw the selected Module Studio surface from resolved state, data and actions. */
export const AgentOSSolutionModulePageBase = (view: AgentOSSolutionModulePageViewProps) => {
    const { copy, screen } = view.state
    const shell: AgentOSSolutionModuleShellProps = {
        ...view.props,
        onBackToModules: view.on.backToModules,
        onNavigate: view.on.navigate,
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
export type AgentOSSolutionModuleStateProps = {
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
