import { ChoiceTabs } from "@nivo/ui"
import { DEFAULT_TEST_WORKBENCH_REGISTRY, KindTestWorkbenchBlock } from "../KindTestWorkbenchBlock"
import { ModuleCockpitRailBlock } from "../ModuleCockpitRailBlock"
import { TestTrustResultBlock } from "../TestTrustResultBlock"
import type { TestSurfaceProps as TestSurfaceDataProps } from "../../../../modules/agentos/module-page/surface-types"
import type { WithModulePageCopy, ModulePageCopy } from "../../../../modules/agentos/module-page-copy"
import { cockpitPane } from "../cockpitPane"
import { cockpitSidecarPane } from "../cockpitSidecarPane"
import { isTestCompactPane, isTestMode } from "../../../../modules/agentos/module-page/surface-types.guards"

const testRunStatusLabel = (status: string | undefined, copy: ModulePageCopy): string => {
    if (status === undefined) return copy.pageTest.notRun
    if (status === "failed") return copy.testStatus.failed
    if (status === "passed") return copy.testStatus.passed
    if (status === "running") return copy.testStatus.running
    if (status === "warning") return copy.testStatus.warning
    return status
}

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
                        select: (key) => onSelectPane(isTestCompactPane(key) ? key : compactPane),
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
                    on={{ select: (key) => onSelectMode(isTestMode(key) ? key : mode) }}
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
