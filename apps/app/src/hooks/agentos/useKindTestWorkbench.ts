import { useState } from "react"
import type { AgentosRuntimeValue } from "../../modules/api/agentos-runtime-tree"
import {
    setScenarioPath,
    type KindTestWorkbenchBlockProps,
    type TestWorkbenchComponentProps,
} from "../../modules/agentos/kind-test-workbench"

type ScenarioOverrides = {
    readonly scenarioKey: string
    readonly values: Readonly<Record<string, AgentosRuntimeValue>>
}

/** Derive each scenario's overrides from its identity instead of clearing them in an effect. */
export const useKindTestWorkbench = (props: KindTestWorkbenchBlockProps) => {
    const {
        contract,
        contextLabel,
        targetReady,
        pending,
        selectedScenarioKey,
        showScenarioPicker = true,
        onSelectScenario,
        onRun,
    } = props
    const [localScenarioKey, setLocalScenarioKey] = useState(contract.scenarios[0]?.key ?? "")
    const [scenarioOverrides, setScenarioOverrides] = useState<ScenarioOverrides | null>(null)
    const scenarioKey = selectedScenarioKey ?? localScenarioKey
    const scenario = contract.scenarios.find((candidate) => candidate.key === scenarioKey) ?? contract.scenarios[0]
    const overrides = scenarioOverrides?.scenarioKey === scenarioKey ? scenarioOverrides.values : {}
    const contentProps: TestWorkbenchComponentProps | null =
        scenario === undefined
            ? null
            : {
                  copy: props.copy,
                  contract,
                  scenario,
                  contextLabel,
                  pending: pending || !targetReady,
                  showScenarioPicker,
                  overrides,
                  onSelectScenario: (key) => {
                      setLocalScenarioKey(key)
                      onSelectScenario?.(key)
                  },
                  onOverride: (path, value) =>
                      setScenarioOverrides((current) => ({
                          scenarioKey,
                          values: setScenarioPath(
                              current?.scenarioKey === scenarioKey ? current.values : {},
                              path,
                              value,
                          ),
                      })),
                  onRun: () => targetReady && onRun(scenario.key, overrides),
              }
    return { scenario, contentProps }
}
