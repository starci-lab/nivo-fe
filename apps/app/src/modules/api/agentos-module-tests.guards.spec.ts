import { describe, expect, it } from "vitest"

import { parseModuleTestContract, parseModuleTestSurface } from "./agentos-module-tests.guards"

const contract = {
    workbench: { key: "wb", version: "1" },
    contract: { key: "tc", version: "1" },
    sandboxAdapter: { key: "sa", version: "1" },
    evidenceWidget: { key: "ew", version: "1" },
    scenarios: [
        {
            key: "s-1",
            label: "Happy",
            description: "d",
            fixture: {},
            assertions: [
                {
                    key: "a-1",
                    label: "Sees it",
                    source: "context",
                    path: "x",
                    operator: "present",
                    severity: "fail",
                },
            ],
        },
    ],
}

const run = {
    id: "r-1",
    installationId: "ins",
    moduleDefinitionId: "def",
    contextVersionId: null,
    setupSessionId: null,
    draftDigest: null,
    requestedByUserId: "u",
    kindKey: "k",
    kindVersion: "1",
    testContractKey: "tc",
    testContractVersion: "1",
    scenarioKey: "s-1",
    mode: "acceptance",
    definitionDigest: "d",
    targetDigest: "d",
    authorityGeneration: 1,
    sourceGeneration: 1,
    retrievalGeneration: 1,
    status: "passed",
    scenarioInput: {},
    summary: {},
    completedAt: null,
    createdAt: "t",
}

describe("parseModuleTestContract", () => {
    it("refuses a malformed contract: missing facet or unknown assertion vocabulary", () => {
        expect(parseModuleTestContract(contract)).not.toBeNull()
        expect(parseModuleTestContract({ ...contract, workbench: null })).toBeNull()
        const scenario = contract.scenarios[0]
        const assertion = scenario?.assertions[0]
        expect(
            parseModuleTestContract({
                ...contract,
                scenarios: [
                    {
                        ...(scenario ?? {}),
                        assertions: [{ ...(assertion ?? {}), operator: "roughly" }],
                    },
                ],
            }),
        ).toBeNull()
    })
})

describe("parseModuleTestSurface", () => {
    it("refuses a surface with a malformed run or assertion evidence", () => {
        const surface = { contract, runs: [run], run: null, assertions: [] }
        expect(parseModuleTestSurface(surface)).not.toBeNull()
        expect(parseModuleTestSurface({ ...surface, runs: [{ ...run, mode: "chaos" }] })).toBeNull()
        expect(
            parseModuleTestSurface({
                ...surface,
                assertions: [
                    {
                        id: "a",
                        runId: "r-1",
                        ordinal: 0,
                        assertionKey: "a-1",
                        label: "l",
                        verdict: "almost",
                        expected: null,
                        actual: null,
                        evidence: { component: "c", version: "1", props: {} },
                        createdAt: "t",
                    },
                ],
            }),
        ).toBeNull()
    })
})
