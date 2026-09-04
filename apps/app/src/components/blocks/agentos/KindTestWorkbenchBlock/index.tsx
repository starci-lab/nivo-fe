"use client";

type RuntimeKindTestBoundaryDetailValues = { readonly scenario: string; readonly context: string; readonly count: number; readonly picker: string; readonly commands: string };
type RuntimeKindTestRunValues = { readonly scenario: string };

/** Settled display labels and typed formatters supplied by the page owner. */
export type KindTestWorkbenchBlockCopy = {
  readonly "kindTest": {
    readonly "accounting": string;
    readonly "boundary": string;
    readonly "boundaryDetail": (values: RuntimeKindTestBoundaryDetailValues) => string;
    readonly "calendar": string;
    readonly "citation": string;
    readonly "closed": string;
    readonly "cockpit": string;
    readonly "context": string;
    readonly "conversation": string;
    readonly "default": string;
    readonly "fakeHint": string;
    readonly "generic": string;
    readonly "local": string;
    readonly "noRegistration": string;
    readonly "pending": string;
    readonly "ready": string;
    readonly "refused": string;
    readonly "run": (values: RuntimeKindTestRunValues) => string;
    readonly "runUnavailable": string;
    readonly "safety": string;
    readonly "sandbox": string;
    readonly "scenario": string;
    readonly "state": string;
    readonly "unavailable": string;
  };
};




import { useEffect, useMemo, useState, type ComponentType } from "react";
import { ChoiceTabs } from "@nivo/ui";
import { SurfaceCard, Button, Input, Heading, Text } from "@starci/grammar/common";
import type { AgentosModuleTestContract, AgentosModuleTestScenarioContract, AgentosRuntimeValue } from "@/modules/api/console";
type ScenarioField = {
  readonly path: string;
  readonly value: AgentosRuntimeValue;
};

/** Shared runtime input for one registered kind-owned Test workbench. */
export type TestWorkbenchComponentProps = {
  readonly copy: KindTestWorkbenchBlockCopy;
  readonly contract: AgentosModuleTestContract;
  readonly scenario: AgentosModuleTestScenarioContract;
  readonly contextLabel: string;
  readonly pending: boolean;
  readonly showScenarioPicker: boolean;
  readonly overrides: Readonly<Record<string, AgentosRuntimeValue>>;
  readonly onSelectScenario: (scenarioKey: string) => void;
  readonly onOverride: (path: string, value: AgentosRuntimeValue) => void;
  readonly onRun: () => void;
};

/** Open registry for kind-owned Test workbench ComponentTypes. */
export type TestWorkbenchRegistry = Readonly<Record<string, ComponentType<TestWorkbenchComponentProps>>>;

/** Exact block boundary for resolving a registered Test workbench. */
export type KindTestWorkbenchBlockProps = {
  readonly copy: KindTestWorkbenchBlockCopy;
  readonly contract: AgentosModuleTestContract;
  readonly contextLabel: string;
  readonly targetReady: boolean;
  readonly pending: boolean;
  readonly selectedScenarioKey?: string;
  readonly showScenarioPicker?: boolean;
  readonly registry: TestWorkbenchRegistry;
  readonly onSelectScenario?: (scenarioKey: string) => void;
  readonly onRun: (scenarioKey: string, scenarioInput: Readonly<Record<string, AgentosRuntimeValue>>) => void;
};
const flattenFixture = (value: AgentosRuntimeValue, prefix = ""): ReadonlyArray<ScenarioField> => {
  if (Array.isArray(value) || value === null || typeof value !== "object") return prefix === "" ? [] : [{
    path: prefix,
    value
  }];
  return Object.entries(value).flatMap(([key, child]) => flattenFixture(child, prefix === "" ? key : `${prefix}.${key}`));
};
const parseOverride = (raw: string, fixture: AgentosRuntimeValue): AgentosRuntimeValue => {
  if (typeof fixture === "number") {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : raw;
  }
  if (typeof fixture === "boolean") return raw.trim().toLowerCase() === "true";
  if (Array.isArray(fixture)) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as ReadonlyArray<AgentosRuntimeValue>;
    } catch {
      return raw.split(",").map(item => item.trim()).filter(Boolean);
    }
  }
  return raw;
};
const titleByWorkbench: Readonly<Partial<Record<string, "conversation" | "accounting" | "calendar" | "citation" | "generic">>> = {
  "conversation-sandbox": "conversation",
  "accounting-fixture": "accounting",
  "calendar-sandbox": "calendar",
  "citation-check": "citation",
  "generic-sandbox": "generic"
};
const TestWorkbenchContent = ({ copy,
  contract,
  scenario,
  contextLabel,
  pending,
  showScenarioPicker,
  overrides,
  onSelectScenario,
  onOverride,
  onRun
}: TestWorkbenchComponentProps) => {
  
  const fields = flattenFixture(scenario.fixture);
  const titleKey = Object.hasOwn(titleByWorkbench, contract.workbench.key) ? titleByWorkbench[contract.workbench.key] : undefined;
  const title = titleKey === undefined ? copy.kindTest.default : copy.kindTest[titleKey];
  return <div><div>


      <Heading level={3}>{title}</Heading>

      <Text size="xs" tone="muted">{scenario.description}</Text></div>{!showScenarioPicker || contract.scenarios.length < 2 ? undefined : <ChoiceTabs props={{
      label: copy.kindTest.scenario,
      selectedKey: scenario.key,
      tabs: contract.scenarios.map(({
        key,
        label
      }) => ({
        id: key,
        label
      }))
    }} on={{
      select: onSelectScenario
    }} />}<div><><div>



          <Text size="sm">{copy.kindTest.context}</Text>
          <Text size="sm" weight="semibold">{contextLabel}</Text></div><div>


          <Text size="sm">{copy.kindTest.sandbox}</Text>
          <Text size="sm" weight="semibold">{`${contract.sandboxAdapter.key}@${contract.sandboxAdapter.version}`}</Text></div></></div>{fields.map(field => <Input
            key={`${scenario.key}-${field.path}`}
            id={`agentos-test-${field.path.replaceAll(".", "-")}`}
            name={field.path}
            label={field.path}
            placeholder={JSON.stringify(overrides[field.path] ?? field.value)}
            isDisabled={pending}
            variant="secondary"
            hint={copy.kindTest.fakeHint}
            onValueChange={value => onOverride(field.path, parseOverride(value, field.value))}
          />)}

    <Text size="sm" tone="muted">{copy.kindTest.safety}</Text>


    <Button
      variant="primary"
      isPending={pending}
      onPress={onRun}
    >{copy.kindTest.run({ scenario: scenario.label })}</Button></div>;
};

/** Built-in registrations; adding a kind extends this table without editing the shell. */
export const DEFAULT_TEST_WORKBENCH_REGISTRY: TestWorkbenchRegistry = {
  "conversation-sandbox": TestWorkbenchContent,
  "accounting-fixture": TestWorkbenchContent,
  "calendar-sandbox": TestWorkbenchContent,
  "citation-check": TestWorkbenchContent,
  "generic-sandbox": TestWorkbenchContent
};
const UnavailableTestWorkbench = ({ copy,
  contract,
  scenario,
  contextLabel,
  pending,
  showScenarioPicker,
  overrides,
  onSelectScenario,
  onOverride,
  onRun
}: TestWorkbenchComponentProps) => {
  
  const callbacksReady = [onSelectScenario, onOverride, onRun].every(callback => typeof callback === "function");
  const state = pending ? copy.kindTest.pending : copy.kindTest.noRegistration;
  const detail = copy.kindTest.boundaryDetail({ scenario: scenario.key, context: contextLabel, count: Object.keys(overrides).length, picker: showScenarioPicker ? copy.kindTest.local : copy.kindTest.cockpit, commands: callbacksReady ? copy.kindTest.ready : copy.kindTest.refused });
  return <div><div>


      <Heading level={3}>{copy.kindTest.unavailable}</Heading>
      <Text size="xs" tone="muted">{contract.workbench.key}</Text></div><div><><div>




          <Text size="sm">{copy.kindTest.state}</Text>
          <Text size="sm">{state}</Text></div><div>


          <Text size="sm">{copy.kindTest.boundary}</Text>
          <Text size="sm">{detail}</Text></div></></div>



    <Text size="sm" tone="muted">{copy.kindTest.closed}</Text>
    <Button
      isDisabled={true}
    >{copy.kindTest.runUnavailable}</Button></div>;
};
const setPath = (root: Readonly<Record<string, AgentosRuntimeValue>>, path: string, value: AgentosRuntimeValue): Readonly<Record<string, AgentosRuntimeValue>> => {
  const [head, ...tail] = path.split(".");
  if (head === undefined) return root;
  if (tail.length === 0) return {
    ...root,
    [head]: value
  };
  const current = root[head];
  const branch = typeof current === "object" && current !== null && !Array.isArray(current) ? current as Readonly<Record<string, AgentosRuntimeValue>> : {};
  return {
    ...root,
    [head]: setPath(branch, tail.join("."), value)
  };
};

/** Resolve and run one kind Test workbench from its versioned registry identity. */
export const KindTestWorkbenchBlock = (props: KindTestWorkbenchBlockProps) => {
  const { copy } = props;
  const {
    contract,
    contextLabel,
    targetReady,
    pending,
    selectedScenarioKey,
    showScenarioPicker = true,
    registry,
    onSelectScenario,
    onRun
  }: KindTestWorkbenchBlockProps = props;
  const [localScenarioKey, setLocalScenarioKey] = useState(contract.scenarios[0]?.key ?? "");
  const [overrides, setOverrides] = useState<Readonly<Record<string, AgentosRuntimeValue>>>({});
  const scenarioKey = selectedScenarioKey ?? localScenarioKey;
  const scenario = useMemo(() => contract.scenarios.find(candidate => candidate.key === scenarioKey) ?? contract.scenarios[0], [contract.scenarios, scenarioKey]);
  useEffect(() => setOverrides({}), [scenarioKey]);
  if (scenario === undefined) return null;
  const contentProps: TestWorkbenchComponentProps = {
    copy,
    contract,
    scenario,
    contextLabel,
    pending: pending || !targetReady,
    showScenarioPicker,
    overrides,
    onSelectScenario: key => {
      setLocalScenarioKey(key);
      onSelectScenario?.(key);
    },
    onOverride: (path, value) => setOverrides(current => setPath(current, path, value)),
    onRun: () => targetReady && onRun(scenario.key, overrides)
  };
  const Workbench = registry[contract.workbench.key] ?? UnavailableTestWorkbench;
  const render = <Workbench {...contentProps} />;
  return <SurfaceCard
    label={copy.kindTest.scenario}
    fact={`${contract.workbench.key}@${contract.workbench.version}`}
  >{render}</SurfaceCard>;
};
