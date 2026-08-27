"use client"

import { useEffect, useMemo, useState, type ComponentType } from "react"
import {
    Button, ChoiceTabs, Field, Heading, SurfaceCard, Text, Tree,
    defineContractComponent, defineContractProjection, defineLeafComponent,
} from "@nivo/ui"
import type {
    AgentosModuleTestContract, AgentosModuleTestScenarioContract, AgentosRuntimeValue,
} from "@/modules/api/console"

type ScenarioField = {
    readonly path: string
    readonly value: AgentosRuntimeValue
}

/** Shared runtime input for one registered kind-owned Test workbench. */
export type TestWorkbenchComponentProps = {
    readonly contract: AgentosModuleTestContract
    readonly scenario: AgentosModuleTestScenarioContract
    readonly contextLabel: string
    readonly pending: boolean
    readonly showScenarioPicker: boolean
    readonly overrides: Readonly<Record<string, AgentosRuntimeValue>>
    readonly onSelectScenario: (scenarioKey: string) => void
    readonly onOverride: (path: string, value: AgentosRuntimeValue) => void
    readonly onRun: () => void
}

/** Open registry for kind-owned Test workbench ComponentTypes. */
export type TestWorkbenchRegistry = Readonly<Record<string, ComponentType<TestWorkbenchComponentProps>>>

/** Exact block boundary for resolving a registered Test workbench. */
export type KindTestWorkbenchBlockProps = {
    readonly contract: AgentosModuleTestContract
    readonly contextLabel: string
    readonly targetReady: boolean
    readonly pending: boolean
    readonly selectedScenarioKey?: string
    readonly showScenarioPicker?: boolean
    readonly registry: TestWorkbenchRegistry
    readonly onSelectScenario?: (scenarioKey: string) => void
    readonly onRun: (scenarioKey: string, scenarioInput: Readonly<Record<string, AgentosRuntimeValue>>) => void
}

const flattenFixture = (value: AgentosRuntimeValue, prefix = ""): ReadonlyArray<ScenarioField> => {
    if (Array.isArray(value) || value === null || typeof value !== "object") return prefix === "" ? [] : [{ path: prefix, value }]
    return Object.entries(value).flatMap(([key, child]) => flattenFixture(child, prefix === "" ? key : `${prefix}.${key}`))
}

const parseOverride = (raw: string, fixture: AgentosRuntimeValue): AgentosRuntimeValue => {
    if (typeof fixture === "number") {
        const parsed = Number(raw)
        return Number.isFinite(parsed) ? parsed : raw
    }
    if (typeof fixture === "boolean") return raw.trim().toLowerCase() === "true"
    if (Array.isArray(fixture)) {
        try {
            const parsed: unknown = JSON.parse(raw)
            if (Array.isArray(parsed)) return parsed as ReadonlyArray<AgentosRuntimeValue>
        } catch {
            return raw.split(",").map((item) => item.trim()).filter(Boolean)
        }
    }
    return raw
}

const titleByWorkbench: Readonly<Record<string, string>> = {
    "conversation-sandbox": "Conversation test",
    "accounting-fixture": "Accounting fixture test",
    "calendar-sandbox": "Calendar sandbox test",
    "citation-check": "Citation grounding test",
    "generic-sandbox": "Context readiness test",
}

const TestWorkbenchContent = ({
    contract, scenario, contextLabel, pending, showScenarioPicker, overrides, onSelectScenario, onOverride, onRun,
}: TestWorkbenchComponentProps) => {
    const fields = flattenFixture(scenario.fixture)
    const title = titleByWorkbench[contract.workbench.key] ?? "Module scenario test"
    return (
        <Tree contract="agentos-test-scenario-body" render={defineContractComponent("agentos-test-scenario-body", {
            identity: defineContractComponent("subject-over-muted-caption", {
                subject: defineLeafComponent("heading", {}, () => <Heading props={{ content: title, level: 3 }} />),
                caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: scenario.description, size: "xs", tone: "muted" }} />
                )),
            }),
            scenario: !showScenarioPicker || contract.scenarios.length < 2 ? undefined : defineLeafComponent("choice-tabs", {}, () => (
                <ChoiceTabs
                    props={{ label: "Test scenario", selectedKey: scenario.key, tabs: contract.scenarios.map(({ key, label }) => ({ id: key, label })) }}
                    on={{ select: onSelectScenario }}
                />
            )),
            context: defineContractComponent("labelled-fact-stack", {
                fact: [
                    defineContractComponent("label-value-row", {
                        label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: "Immutable context", size: "sm" }} />),
                        value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: contextLabel, size: "sm", weight: "semibold" }} />),
                    }),
                    defineContractComponent("label-value-row", {
                        label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: "Sandbox", size: "sm" }} />),
                        value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: `${contract.sandboxAdapter.key}@${contract.sandboxAdapter.version}`, size: "sm", weight: "semibold" }} />),
                    }),
                ],
            }),
            field: fields.map((field) => defineContractProjection("label-field-hint", () => (
                <Field
                    key={`${scenario.key}-${field.path}`}
                    props={{
                        id: `agentos-test-${field.path.replaceAll(".", "-")}`,
                        name: field.path,
                        label: field.path,
                        placeholder: JSON.stringify(overrides[field.path] ?? field.value),
                        hint: "Fake input only. Leave unchanged to use the registered fixture.",
                        disabled: pending,
                    }}
                    on={{ change: (value) => onOverride(field.path, parseOverride(value, field.value)) }}
                />
            ))),
            notice: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: "This run cannot call live channels, calendars, payment providers, credentials, or Execute sessions.", size: "sm", tone: "muted" }} />
            )),
            action: defineLeafComponent("button", {}, () => (
                <Button props={{ label: `Run ${scenario.label}`, variant: "primary", isPending: pending }} on={{ press: onRun }} />
            )),
        })} />
    )
}

/** Built-in registrations; adding a kind extends this table without editing the shell. */
export const DEFAULT_TEST_WORKBENCH_REGISTRY: TestWorkbenchRegistry = {
    "conversation-sandbox": TestWorkbenchContent,
    "accounting-fixture": TestWorkbenchContent,
    "calendar-sandbox": TestWorkbenchContent,
    "citation-check": TestWorkbenchContent,
    "generic-sandbox": TestWorkbenchContent,
}

const UnavailableTestWorkbench = ({
    contract, scenario, contextLabel, pending, showScenarioPicker, overrides, onSelectScenario, onOverride, onRun,
}: TestWorkbenchComponentProps) => {
    const callbacksReady = [onSelectScenario,
        onOverride,
        onRun].every((callback) => typeof callback === "function")
    const state = pending ? "Pending" : "No trusted ComponentType registration"
    const detail = `${scenario.key} · ${contextLabel} · ${Object.keys(overrides).length} override(s) · picker ${showScenarioPicker ? "local" : "cockpit"} · commands ${callbacksReady ? "ready" : "refused"}`
    return (
        <Tree contract="agentos-test-scenario-body" render={defineContractComponent("agentos-test-scenario-body", {
            identity: defineContractComponent("subject-over-muted-caption", {
                subject: defineLeafComponent("heading", {}, () => <Heading props={{ content: "Test workbench unavailable", level: 3 }} />),
                caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: contract.workbench.key, size: "xs", tone: "muted" }} />),
            }),
            context: defineContractComponent("labelled-fact-stack", {
                fact: [
                    defineContractComponent("label-value-row", {
                        label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: "State", size: "sm" }} />),
                        value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: state, size: "sm" }} />),
                    }),
                    defineContractComponent("label-value-row", {
                        label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: "Boundary", size: "sm" }} />),
                        value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: detail, size: "sm" }} />),
                    }),
                ],
            }),
            notice: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: "The registry failed closed; no test was executed.", size: "sm", tone: "muted" }} />),
            action: defineLeafComponent("button", {}, () => <Button props={{ label: "Run unavailable", disabled: true }} />),
        })} />
    )
}

const setPath = (root: Readonly<Record<string, AgentosRuntimeValue>>, path: string, value: AgentosRuntimeValue): Readonly<Record<string, AgentosRuntimeValue>> => {
    const [head, ...tail] = path.split(".")
    if (head === undefined) return root
    if (tail.length === 0) return { ...root, [head]: value }
    const current = root[head]
    const branch = typeof current === "object" && current !== null && !Array.isArray(current)
        ? current as Readonly<Record<string, AgentosRuntimeValue>>
        : {}
    return { ...root, [head]: setPath(branch, tail.join("."), value) }
}

/** Resolve and run one kind Test workbench from its versioned registry identity. */
export const KindTestWorkbenchBlock = ({
    contract, contextLabel, targetReady, pending, selectedScenarioKey, showScenarioPicker = true,
    registry, onSelectScenario, onRun,
}: KindTestWorkbenchBlockProps) => {
    const [localScenarioKey, setLocalScenarioKey] = useState(contract.scenarios[0]?.key ?? "")
    const [overrides, setOverrides] = useState<Readonly<Record<string, AgentosRuntimeValue>>>({})
    const scenarioKey = selectedScenarioKey ?? localScenarioKey
    const scenario = useMemo(() => contract.scenarios.find((candidate) => candidate.key === scenarioKey) ?? contract.scenarios[0], [contract.scenarios, scenarioKey])
    useEffect(() => setOverrides({}), [scenarioKey])
    if (scenario === undefined) return null
    const Workbench = registry[contract.workbench.key] ?? UnavailableTestWorkbench
    const render = defineContractComponent("agentos-test-scenario-body", Workbench)
    const contentProps: TestWorkbenchComponentProps = {
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
        onOverride: (path, value) => setOverrides((current) => setPath(current, path, value)),
        onRun: () => targetReady && onRun(scenario.key, overrides),
    }
    return (
        <SurfaceCard
            props={{ label: "Test scenario", fact: `${contract.workbench.key}@${contract.workbench.version}` }}
            contract="agentos-test-scenario-body"
            render={render}
            contentProps={contentProps}
        />
    )
}

/** Source-level tier marker for the pure Test workbench registry adapter. */
export const meta = { shape: "block", world: "pure" } as const
