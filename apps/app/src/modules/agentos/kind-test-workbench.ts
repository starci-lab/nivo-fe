import type { ComponentType } from "react"
import type { AgentosModuleTestContract, AgentosModuleTestScenarioContract } from "../api/agentos-module-tests"
import type { AgentosRuntimeValue } from "../api/agentos-runtime-tree"

type RuntimeKindTestBoundaryDetailValues = {
    readonly scenario: string
    readonly context: string
    readonly count: number
    readonly picker: string
    readonly commands: string
}
type RuntimeKindTestRunValues = { readonly scenario: string }

/** Settled display labels and typed formatters supplied by the page owner. */
export type KindTestWorkbenchBlockCopy = {
    readonly kindTest: {
        readonly accounting: string
        readonly boundary: string
        readonly boundaryDetail: (values: RuntimeKindTestBoundaryDetailValues) => string
        readonly calendar: string
        readonly citation: string
        readonly closed: string
        readonly cockpit: string
        readonly context: string
        readonly conversation: string
        readonly default: string
        readonly fakeHint: string
        readonly generic: string
        readonly local: string
        readonly noRegistration: string
        readonly pending: string
        readonly ready: string
        readonly refused: string
        readonly run: (values: RuntimeKindTestRunValues) => string
        readonly runUnavailable: string
        readonly safety: string
        readonly sandbox: string
        readonly scenario: string
        readonly state: string
        readonly unavailable: string
    }
}

/** Shared runtime input for one registered kind-owned Test workbench. */
export type TestWorkbenchComponentProps = {
    readonly copy: KindTestWorkbenchBlockCopy
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
    readonly copy: KindTestWorkbenchBlockCopy
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

export type ScenarioField = {
    readonly path: string
    readonly value: AgentosRuntimeValue
}

/** Read a nested fixture as dotted input paths, keeping arrays as one editable value. */
export const flattenFixture = (value: AgentosRuntimeValue, prefix = ""): ReadonlyArray<ScenarioField> => {
    if (Array.isArray(value) || value === null || typeof value !== "object")
        return prefix === "" ? [] : [{ path: prefix, value }]
    return Object.entries(value).flatMap(([key, child]) =>
        flattenFixture(child, prefix === "" ? key : `${prefix}.${key}`),
    )
}

/** Parse the edited input using the fixture's original scalar or collection shape. */
export const parseOverride = (raw: string, fixture: AgentosRuntimeValue): AgentosRuntimeValue => {
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
            return raw
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
        }
    }
    return raw
}

/** Set one dotted fixture path immutably. */
export const setScenarioPath = (
    root: Readonly<Record<string, AgentosRuntimeValue>>,
    path: string,
    value: AgentosRuntimeValue,
): Readonly<Record<string, AgentosRuntimeValue>> => {
    const [head, ...tail] = path.split(".")
    if (head === undefined) return root
    if (tail.length === 0) return { ...root, [head]: value }
    const current = root[head]
    const branch =
        typeof current === "object" && current !== null && !Array.isArray(current)
            ? (current as Readonly<Record<string, AgentosRuntimeValue>>)
            : {}
    return { ...root, [head]: setScenarioPath(branch, tail.join("."), value) }
}

/** Closed mapping from built-in workbench ids to their localized headings. */
export const titleByWorkbench: Readonly<
    Partial<Record<string, "conversation" | "accounting" | "calendar" | "citation" | "generic">>
> = {
    "conversation-sandbox": "conversation",
    "accounting-fixture": "accounting",
    "calendar-sandbox": "calendar",
    "citation-check": "citation",
    "generic-sandbox": "generic",
}
