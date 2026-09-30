import type { MyAgentosModuleTestSurfaceQuery, RunAgentosModuleTestMutationVariables } from "./__generated__/core"

/**
 * The test contract of one installed module: its surface, its runs and their assertion results.
 *
 * Every operation selects exactly one root field (`graphql` reads the first one and no more), returns an
 * `Outcome` and never throws; a caller keys its sentence off `code`, never off the server's English `reason`.
 * The nullability of every type is the schema's, not a guess.
 */

import { type Outcome } from "@nivo/api"
import { graphql } from "./graphql"
import { parseModuleTestSurface } from "./agentos-module-tests.guards"
import type { AgentosRuntimeValue } from "./agentos-runtime-tree"
import {
    MyAgentosModuleTestRunDocument,
    MyAgentosModuleTestSurfaceDocument,
    RunAgentosModuleTestDocument,
} from "./__generated__/core"

/** One validated assertion in a module test contract JSON value. */
export type AgentosModuleTestAssertionContractView = {
    readonly key: string
    readonly label: string
    readonly source: "input" | "context"
    readonly path: string
    readonly operator: "equals" | "contains" | "count-at-least" | "present"
    readonly expected?: AgentosRuntimeValue
    readonly severity: "fail" | "warning"
}

/** One validated fake-data scenario registered by a kind-owned test workbench. */
export type AgentosModuleTestScenarioContractView = {
    readonly key: string
    readonly label: string
    readonly description: string
    readonly fixture: Readonly<Record<string, AgentosRuntimeValue>>
    readonly assertions: ReadonlyArray<AgentosModuleTestAssertionContractView>
}

/** Validated view of the open versioned contract carried in the backend JSON scalar. */
export type AgentosModuleTestContractView = {
    readonly workbench: {
        readonly key: string
        readonly version: string
    }
    readonly contract: {
        readonly key: string
        readonly version: string
    }
    readonly sandboxAdapter: {
        readonly key: string
        readonly version: string
    }
    readonly evidenceWidget: {
        readonly key: string
        readonly version: string
    }
    readonly scenarios: ReadonlyArray<AgentosModuleTestScenarioContractView>
}

/** Test surface mapped from a generated operation result and its validated contract JSON. */
export type AgentosModuleTestSurfaceView = {
    readonly contract: AgentosModuleTestContractView
    readonly runs: NonNullable<MyAgentosModuleTestSurfaceQuery["myAgentosModuleTestSurface"]["data"]>["runs"]
    readonly run: NonNullable<MyAgentosModuleTestSurfaceQuery["myAgentosModuleTestSurface"]["data"]>["run"]
    readonly assertions: NonNullable<MyAgentosModuleTestSurfaceQuery["myAgentosModuleTestSurface"]["data"]>["assertions"]
}

/** Read the kind-owned Test contract and recent persisted runs for one installation. */
export const myAgentosModuleTestSurface = (installationId: string): Promise<Outcome<AgentosModuleTestSurfaceView>> =>
    graphql(
        MyAgentosModuleTestSurfaceDocument,
        parseModuleTestSurface,
        {
            request: { installationId },
        },
    )

/** Read one exact persisted Test result without inferring it from Execute history. */
export const myAgentosModuleTestRun = (
    installationId: string,
    runId: string,
): Promise<Outcome<AgentosModuleTestSurfaceView>> =>
    graphql(
        MyAgentosModuleTestRunDocument,
        parseModuleTestSurface,
        {
            request: { installationId, runId },
        },
    )

/** Run one side-effect-free scenario against one explicit immutable context version. */
export const runAgentosModuleTest = (
    input: RunAgentosModuleTestMutationVariables["input"],
): Promise<Outcome<AgentosModuleTestSurfaceView>> =>
    graphql(
        RunAgentosModuleTestDocument,
        parseModuleTestSurface,
        {
            input,
        },
    )
