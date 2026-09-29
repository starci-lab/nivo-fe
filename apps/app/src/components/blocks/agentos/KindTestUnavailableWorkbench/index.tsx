import { Button, Heading, Text } from "@starci/grammar/common"
import type { TestWorkbenchComponentProps } from "@/modules/agentos/kind-test-workbench"
import { KIND_TEST_UNAVAILABLE_CLASS_NAME } from "./classNames"

type KindTestUnavailableWorkbenchProps = TestWorkbenchComponentProps

/** State explicitly why an unknown Test workbench cannot execute. */
export const KindTestUnavailableWorkbench = (props: KindTestUnavailableWorkbenchProps) => {
    const { copy, contract, scenario, contextLabel, pending, showScenarioPicker, overrides, onSelectScenario, onOverride, onRun } = props
    const callbacksReady = [onSelectScenario, onOverride, onRun].every((callback) => typeof callback === "function")
    const state = pending ? copy.kindTest.pending : copy.kindTest.noRegistration
    const detail = copy.kindTest.boundaryDetail({
        scenario: scenario.key,
        context: contextLabel,
        count: Object.keys(overrides).length,
        picker: showScenarioPicker ? copy.kindTest.local : copy.kindTest.cockpit,
        commands: callbacksReady ? copy.kindTest.ready : copy.kindTest.refused,
    })
    return (
        <div className={KIND_TEST_UNAVAILABLE_CLASS_NAME}>
            <div>
                <Heading level={3}>{copy.kindTest.unavailable}</Heading>
                <Text size="xs" tone="muted">
                    {contract.workbench.key}
                </Text>
            </div>
            <div>
                <div>
                    <Text size="sm">{copy.kindTest.state}</Text>
                    <Text size="sm">{state}</Text>
                </div>
                <div>
                    <Text size="sm">{copy.kindTest.boundary}</Text>
                    <Text size="sm">{detail}</Text>
                </div>
            </div>
            <Text size="sm" tone="muted">
                {copy.kindTest.closed}
            </Text>
            <Button isDisabled>{copy.kindTest.runUnavailable}</Button>
        </div>
    )
}
