/**
 * The test contract of one installed module: its surface, its runs and their assertion results.
 *
 * Every operation selects exactly one root field (`graphql` reads the first one and no more), returns an
 * `Outcome` and never throws; a caller keys its sentence off `code`, never off the server's English `reason`.
 * The nullability of every type is the schema's, not a guess.
 */

import type { Outcome } from "./outcome";
import { graphql } from "./graphql";
import type { AgentosRuntimeValue, AgentosRuntimeWidgetNode } from "./agentos-runtime-tree";

/** One declarative assertion pinned to a side-effect-free module test scenario. */
export type AgentosModuleTestAssertionContract = {
  readonly key: string;
  readonly label: string;
  readonly source: "input" | "context";
  readonly path: string;
  readonly operator: "equals" | "contains" | "count-at-least" | "present";
  readonly expected?: AgentosRuntimeValue;
  readonly severity: "fail" | "warning";
};

/** One fake-data scenario registered by a kind-owned test workbench. */
export type AgentosModuleTestScenarioContract = {
  readonly key: string;
  readonly label: string;
  readonly description: string;
  readonly fixture: Readonly<Record<string, AgentosRuntimeValue>>;
  readonly assertions: ReadonlyArray<AgentosModuleTestAssertionContract>;
};

/** Open versioned test registry contract pinned to an installation manifest. */
export type AgentosModuleTestContract = {
  readonly workbench: {
    readonly key: string;
    readonly version: string;
  };
  readonly contract: {
    readonly key: string;
    readonly version: string;
  };
  readonly sandboxAdapter: {
    readonly key: string;
    readonly version: string;
  };
  readonly evidenceWidget: {
    readonly key: string;
    readonly version: string;
  };
  readonly scenarios: ReadonlyArray<AgentosModuleTestScenarioContract>;
};

/** Immutable summary for one persisted module test run. */
export type AgentosModuleTestRun = {
  readonly id: string;
  readonly installationId: string;
  readonly moduleDefinitionId: string;
  readonly contextVersionId: string | null;
  readonly setupSessionId: string | null;
  readonly draftDigest: string | null;
  readonly requestedByUserId: string;
  readonly kindKey: string;
  readonly kindVersion: string;
  readonly testContractKey: string;
  readonly testContractVersion: string;
  readonly scenarioKey: string;
  readonly mode: "exploratory" | "acceptance";
  readonly definitionDigest: string;
  readonly targetDigest: string;
  readonly authorityGeneration: number;
  readonly sourceGeneration: number;
  readonly retrievalGeneration: number;
  readonly status: "running" | "passed" | "warning" | "failed";
  readonly scenarioInput: Readonly<Record<string, AgentosRuntimeValue>>;
  readonly summary: Readonly<Record<string, AgentosRuntimeValue>>;
  readonly completedAt: string | null;
  readonly createdAt: string;
};

/** Trusted, normalized assertion evidence for one module test run. */
export type AgentosModuleTestAssertionResult = {
  readonly id: string;
  readonly runId: string;
  readonly ordinal: number;
  readonly assertionKey: string;
  readonly label: string;
  readonly verdict: "pass" | "warning" | "fail";
  readonly expected: AgentosRuntimeValue | null;
  readonly actual: AgentosRuntimeValue | null;
  readonly evidence: AgentosRuntimeWidgetNode;
  readonly createdAt: string;
};

/** Owner-only Test surface, including the open contract and persisted evidence. */
export type AgentosModuleTestSurface = {
  readonly contract: AgentosModuleTestContract;
  readonly runs: ReadonlyArray<AgentosModuleTestRun>;
  readonly run: AgentosModuleTestRun | null;
  readonly assertions: ReadonlyArray<AgentosModuleTestAssertionResult>;
};

/** Explicit immutable-context request for one isolated module test. */
export type RunAgentosModuleTestInput = {
  readonly installationId: string;
  readonly contextVersionId?: string;
  readonly setupSessionId?: string;
  readonly scenarioKey: string;
  readonly mode: "exploratory" | "acceptance";
  readonly idempotencyKey: string;
  readonly scenarioInput?: Readonly<Record<string, AgentosRuntimeValue>>;
};

const MODULE_TEST_FIELDS = `
    contract
    runs {
        id installationId moduleDefinitionId contextVersionId setupSessionId draftDigest requestedByUserId kindKey kindVersion
        testContractKey testContractVersion scenarioKey mode definitionDigest targetDigest authorityGeneration sourceGeneration retrievalGeneration status scenarioInput summary completedAt createdAt
    }
    run {
        id installationId moduleDefinitionId contextVersionId setupSessionId draftDigest requestedByUserId kindKey kindVersion
        testContractKey testContractVersion scenarioKey mode definitionDigest targetDigest authorityGeneration sourceGeneration retrievalGeneration status scenarioInput summary completedAt createdAt
    }
    assertions { id runId ordinal assertionKey label verdict expected actual evidence createdAt }
`;

/** Read the kind-owned Test contract and recent persisted runs for one installation. */
export const myAgentosModuleTestSurface = (installationId: string): Promise<Outcome<AgentosModuleTestSurface>> => graphql(`query MyAgentosModuleTestSurface($request: MyAgentosModuleTestSurfaceRequest!) {
            myAgentosModuleTestSurface(request: $request) {
                data { ${MODULE_TEST_FIELDS} }
                message success error
            }
        }`, {
  request: { installationId }
});

/** Read one exact persisted Test result without inferring it from Execute history. */
export const myAgentosModuleTestRun = (installationId: string, runId: string): Promise<Outcome<AgentosModuleTestSurface>> => graphql(`query MyAgentosModuleTestRun($request: MyAgentosModuleTestRunRequest!) {
            myAgentosModuleTestRun(request: $request) {
                data { ${MODULE_TEST_FIELDS} }
                message success error
            }
        }`, {
  request: { installationId, runId }
});

/** Run one side-effect-free scenario against one explicit immutable context version. */
export const runAgentosModuleTest = (input: RunAgentosModuleTestInput): Promise<Outcome<AgentosModuleTestSurface>> => graphql(`mutation RunAgentosModuleTest($input: RunAgentosModuleTestInput!) {
            runAgentosModuleTest(request: $input) {
                data { ${MODULE_TEST_FIELDS} }
                message success error
            }
        }`, {
  input
});
