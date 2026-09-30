import type { MyAgentosModuleTestSurfaceQuery } from "./__generated__/core"

/**
 * The parsers of the module-test documents' payloads: the open contract, the runs and the
 * assertion evidence. Each returns the value or null, which `graphql` reports as `unavailable`.
 */

import { isNullableString, isNumber, isOneOf, isRecord, isString, parseEach } from "@nivo/api"
import { isAgentosRuntimeValue, isAgentosRuntimeRecord, isAgentosRuntimeWidgetNode } from "./agentos-runtime-tree.guards"
import type {
    AgentosModuleTestAssertionContractView,
    AgentosModuleTestContractView,
    AgentosModuleTestScenarioContractView,
    AgentosModuleTestSurfaceView,
} from "./agentos-module-tests"

type TestSurface = NonNullable<MyAgentosModuleTestSurfaceQuery["myAgentosModuleTestSurface"]["data"]>
type TestRun = TestSurface["runs"][number]
type TestAssertionResult = TestSurface["assertions"][number]

const parseKeyedVersion = (
    value: unknown,
): { readonly key: string; readonly version: string } | null =>
    isRecord(value) && isString(value.key) && isString(value.version)
        ? { key: value.key, version: value.version }
        : null

const parseAssertionContract = (value: unknown): AgentosModuleTestAssertionContractView | null => {
    if (
        !isRecord(value) ||
        !isString(value.key) ||
        !isString(value.label) ||
        !isOneOf(value.source, ["input", "context"]) ||
        !isString(value.path) ||
        !isOneOf(value.operator, ["equals", "contains", "count-at-least", "present"]) ||
        !isOneOf(value.severity, ["fail", "warning"])
    ) {
        return null
    }
    const contract: {
        key: string
        label: string
        source: "input" | "context"
        path: string
        operator: "equals" | "contains" | "count-at-least" | "present"
        severity: "fail" | "warning"
        expected?: AgentosModuleTestAssertionContractView["expected"]
    } = {
        key: value.key,
        label: value.label,
        source: value.source,
        path: value.path,
        operator: value.operator,
        severity: value.severity,
    }
    if (value.expected !== undefined) {
        if (!isAgentosRuntimeValue(value.expected)) return null
        contract.expected = value.expected
    }
    return contract
}

const parseScenarioContract = (value: unknown): AgentosModuleTestScenarioContractView | null => {
    if (
        !isRecord(value) ||
        !isString(value.key) ||
        !isString(value.label) ||
        !isString(value.description) ||
        !isAgentosRuntimeRecord(value.fixture)
    ) {
        return null
    }
    const assertions = parseEach(value.assertions, parseAssertionContract)
    if (assertions === null) return null
    return {
        key: value.key,
        label: value.label,
        description: value.description,
        fixture: value.fixture,
        assertions,
    }
}

/** Parse one open versioned test registry contract - also the manifest's `test` facet. */
export const parseModuleTestContract = (input: unknown): AgentosModuleTestContractView | null => {
    if (!isRecord(input)) return null
    const workbench = parseKeyedVersion(input.workbench)
    const contract = parseKeyedVersion(input.contract)
    const sandboxAdapter = parseKeyedVersion(input.sandboxAdapter)
    const evidenceWidget = parseKeyedVersion(input.evidenceWidget)
    if (workbench === null || contract === null || sandboxAdapter === null || evidenceWidget === null) return null
    const scenarios = parseEach(input.scenarios, parseScenarioContract)
    if (scenarios === null) return null
    return { workbench, contract, sandboxAdapter, evidenceWidget, scenarios }
}

const parseModuleTestRun = (value: unknown): TestRun | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.installationId) &&
    isString(value.moduleDefinitionId) &&
    isNullableString(value.contextVersionId) &&
    isNullableString(value.setupSessionId) &&
    isNullableString(value.draftDigest) &&
    isString(value.requestedByUserId) &&
    isString(value.kindKey) &&
    isString(value.kindVersion) &&
    isString(value.testContractKey) &&
    isString(value.testContractVersion) &&
    isString(value.scenarioKey) &&
    isOneOf(value.mode, ["exploratory", "acceptance"]) &&
    isString(value.definitionDigest) &&
    isString(value.targetDigest) &&
    isNumber(value.authorityGeneration) &&
    isNumber(value.sourceGeneration) &&
    isNumber(value.retrievalGeneration) &&
    isOneOf(value.status, ["running", "passed", "warning", "failed"]) &&
    isAgentosRuntimeRecord(value.scenarioInput) &&
    isAgentosRuntimeRecord(value.summary) &&
    isNullableString(value.completedAt) &&
    isString(value.createdAt)
        ? {
              id: value.id,
              installationId: value.installationId,
              moduleDefinitionId: value.moduleDefinitionId,
              contextVersionId: value.contextVersionId,
              setupSessionId: value.setupSessionId,
              draftDigest: value.draftDigest,
              requestedByUserId: value.requestedByUserId,
              kindKey: value.kindKey,
              kindVersion: value.kindVersion,
              testContractKey: value.testContractKey,
              testContractVersion: value.testContractVersion,
              scenarioKey: value.scenarioKey,
              mode: value.mode,
              definitionDigest: value.definitionDigest,
              targetDigest: value.targetDigest,
              authorityGeneration: value.authorityGeneration,
              sourceGeneration: value.sourceGeneration,
              retrievalGeneration: value.retrievalGeneration,
              status: value.status,
              scenarioInput: value.scenarioInput,
              summary: value.summary,
              completedAt: value.completedAt,
              createdAt: value.createdAt,
          }
        : null

const parseAssertionResult = (value: unknown): TestAssertionResult | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.runId) &&
    isNumber(value.ordinal) &&
    isString(value.assertionKey) &&
    isString(value.label) &&
    isOneOf(value.verdict, ["pass", "warning", "fail"]) &&
    isAgentosRuntimeValue(value.expected) &&
    isAgentosRuntimeValue(value.actual) &&
    isAgentosRuntimeWidgetNode(value.evidence) &&
    isString(value.createdAt)
        ? {
              id: value.id,
              runId: value.runId,
              ordinal: value.ordinal,
              assertionKey: value.assertionKey,
              label: value.label,
              verdict: value.verdict,
              expected: value.expected,
              actual: value.actual,
              evidence: value.evidence,
              createdAt: value.createdAt,
          }
        : null

/** Parse the `data` of `myAgentosModuleTestSurface`/`myAgentosModuleTestRun`/`runAgentosModuleTest`. */
export const parseModuleTestSurface = (input: unknown): AgentosModuleTestSurfaceView | null => {
    if (!isRecord(input)) return null
    const contract = parseModuleTestContract(input.contract)
    const runs = parseEach(input.runs, parseModuleTestRun)
    const run = input.run === null || input.run === undefined ? null : parseModuleTestRun(input.run)
    const assertions = parseEach(input.assertions, parseAssertionResult)
    if (
        contract === null ||
        runs === null ||
        (input.run !== null && input.run !== undefined && run === null) ||
        assertions === null
    ) {
        return null
    }
    return { contract, runs, run, assertions }
}
