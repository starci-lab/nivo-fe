import { ChoiceTabs } from "@nivo/ui"
import { Button, Heading, Input, Text } from "@starci/grammar/common"
import {
    flattenFixture,
    parseOverride,
    titleByWorkbench,
    type TestWorkbenchComponentProps,
} from "../../../../modules/agentos/kind-test-workbench"
import { KIND_TEST_SCENARIO_CLASS_NAME } from "./classNames"

type KindTestScenarioWorkbenchProps = TestWorkbenchComponentProps

/** Draw one editable, fake-input scenario without owning scenario state or execution. */
export const KindTestScenarioWorkbench = (props: KindTestScenarioWorkbenchProps) => {
    const { copy, contract, scenario, contextLabel, pending, showScenarioPicker, overrides, onSelectScenario, onOverride, onRun } = props
    const fields = flattenFixture(scenario.fixture)
    const titleKey = Object.hasOwn(titleByWorkbench, contract.workbench.key)
        ? titleByWorkbench[contract.workbench.key]
        : undefined
    const title = titleKey === undefined ? copy.kindTest.default : copy.kindTest[titleKey]
    return (
        <div className={KIND_TEST_SCENARIO_CLASS_NAME}>
            <div>
                <Heading level={3}>{title}</Heading>
                <Text size="xs" tone="muted">
                    {scenario.description}
                </Text>
            </div>
            {!showScenarioPicker || contract.scenarios.length < 2 ? undefined : (
                <ChoiceTabs
                    props={{
                        label: copy.kindTest.scenario,
                        selectedKey: scenario.key,
                        tabs: contract.scenarios.map(({ key, label }) => ({ id: key, label })),
                    }}
                    on={{ select: onSelectScenario }}
                />
            )}
            <div>
                <div>
                    <Text size="sm">{copy.kindTest.context}</Text>
                    <Text size="sm" weight="semibold">
                        {contextLabel}
                    </Text>
                </div>
                <div>
                    <Text size="sm">{copy.kindTest.sandbox}</Text>
                    <Text
                        size="sm"
                        weight="semibold"
                    >{`${contract.sandboxAdapter.key}@${contract.sandboxAdapter.version}`}</Text>
                </div>
            </div>
            {fields.map((field) => (
                <Input
                    key={`${scenario.key}-${field.path}`}
                    id={`agentos-test-${field.path.replaceAll(".", "-")}`}
                    name={field.path}
                    label={field.path}
                    placeholder={JSON.stringify(overrides[field.path] ?? field.value)}
                    isDisabled={pending}
                    variant="secondary"
                    hint={copy.kindTest.fakeHint}
                    onValueChange={(value) => onOverride(field.path, parseOverride(value, field.value))}
                />
            ))}
            <Text size="sm" tone="muted">
                {copy.kindTest.safety}
            </Text>
            <Button variant="primary" isPending={pending} onPress={onRun}>
                {copy.kindTest.run({ scenario: scenario.label })}
            </Button>
        </div>
    )
}
