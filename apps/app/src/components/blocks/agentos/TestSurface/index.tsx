import { ChoiceTabs } from "@nivo/ui"
import {
    DEFAULT_TEST_WORKBENCH_REGISTRY,
    KindTestWorkbenchBlock,
} from "../KindTestWorkbenchBlock"
import { ModuleCockpitRailBlock } from "../ModuleCockpitRailBlock"
import { TestTrustResultBlock } from "../TestTrustResultBlock"
import type { TestSurfaceProps as TestSurfaceDataProps } from "../../../../modules/agentos/module-page/surface-types"
import type { WithModulePageCopy, ModulePageCopy } from "../../../../modules/agentos/module-page-copy"
import { cockpitPane } from "../cockpitPane"
import { cockpitSidecarPane } from "../cockpitSidecarPane"

const testRunStatusLabel = (status: keyof ModulePageCopy["testStatus"] | undefined, copy: ModulePageCopy): string =>
    status === undefined ? copy.pageTest.notRun : copy.testStatus[status]

type TestSurfaceProps = WithModulePageCopy<TestSurfaceDataProps>

/** Scenario selection, conversation and trust evidence for module testing. */
export const TestSurface = (props: TestSurfaceProps) => {
    const {
        copy,
        contract,
        targetReady,
        contextLabel,
        testSurface,
        pending,
        selectedScenarioKey,
        mode,
        compactPane,
        onSelectScenario,
        onSelectMode,
        onSelectPane,
        onRun,
    } = props
    return (
        <div>
            <div>
                <ChoiceTabs
                    props={{
                        label: copy.pageTest.compact,
                        selectedKey: compactPane,
                        tabs: [
                            {
                                id: "conversation",
                                label: copy.pageTest.conversation,
                            },
                            {
                                id: "scenarios",
                                label: copy.pageTest.scenarios,
                            },
                            {
                                id: "evidence",
                                label: copy.pageTest.evidence,
                            },
                        ],
                    }}
                    on={{
                        select: (key) => onSelectPane(key as TestSurfaceProps["compactPane"]),
                    }}
                />
                <ChoiceTabs
                    props={{
                        label: copy.pageTest.mode,
                        selectedKey: mode,
                        tabs: [
                            { id: "exploratory", label: copy.pageTest.exploratory },
                            { id: "acceptance", label: copy.pageTest.acceptance },
                        ],
                    }}
                    on={{ select: (key) => onSelectMode(key as "exploratory" | "acceptance") }}
                />
            </div>
            {cockpitPane(compactPane !== "scenarios", ModuleCockpitRailBlock, {
                label: copy.pageTest.suite,
                fact: copy.pageTest.count({ count: contract.scenarios.length }),
                summary: copy.pageTest.summary,
                items: contract.scenarios.map((scenario) => ({
                    id: scenario.key,
                    label: scenario.label,
                    status: testRunStatusLabel(
                        testSurface?.runs.find((run) => run.scenarioKey === scenario.key)?.status,
                        copy,
                    ),
                })),
                selectedId: selectedScenarioKey,
                onSelect: onSelectScenario,
            })}
            {cockpitPane(compactPane !== "conversation", KindTestWorkbenchBlock, {
                copy,
                contract,
                contextLabel,
                targetReady,
                pending,
                selectedScenarioKey,
                showScenarioPicker: false,
                registry: DEFAULT_TEST_WORKBENCH_REGISTRY,
                onSelectScenario,
                onRun: (scenarioKey, scenarioInput) => onRun(mode, scenarioKey, scenarioInput),
            })}
            {cockpitSidecarPane(compactPane !== "evidence", TestTrustResultBlock, {
                copy,
                contract,
                run: testSurface?.run ?? null,
                assertions: testSurface?.assertions ?? [],
                contextLabel,
            })}
        </div>
    )
}
