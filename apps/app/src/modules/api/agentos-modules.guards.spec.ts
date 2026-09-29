import { describe, expect, it } from "vitest"

import {
    parseModuleInstallation,
    parseModuleInstallationDetail,
    parseModuleInstallations,
    parseSolutionModules,
} from "./agentos-modules.guards"

const installation = {
    id: "ins-1",
    agentWorkspaceId: "w-1",
    moduleKey: "mod",
    moduleVersion: "1",
    displayName: "Mod",
    status: "active",
    failureCode: null,
    createdAt: "t",
    updatedAt: "t",
}

describe("parseSolutionModules", () => {
    it("refuses a module whose role lists are not string arrays", () => {
        const module = {
            key: "mod",
            version: "1",
            name: "Mod",
            summary: "s",
            agentRoles: ["r"],
            channelRoles: [],
            safetyMode: "standard",
        }
        expect(parseSolutionModules([module])).toHaveLength(1)
        expect(parseSolutionModules([{ ...module, agentRoles: "all" }])).toBeNull()
        expect(parseSolutionModules(module)).toBeNull()
    })
})

describe("parseModuleInstallation / parseModuleInstallations", () => {
    it("refuses a row missing the installation identity", () => {
        expect(parseModuleInstallation(installation)).not.toBeNull()
        expect(parseModuleInstallations([installation])).toHaveLength(1)
        expect(parseModuleInstallation({ ...installation, moduleVersion: 1 })).toBeNull()
    })
})

describe("parseModuleInstallationDetail", () => {
    const detail = {
        ...installation,
        sagaId: null,
        generatedAgentIds: [],
        sharedKnowledgeSourceIds: [],
        channelAccountRefs: [],
        commonKnowledgeVersion: "1",
        privateKnowledgeVersion: "1",
        manifestDigest: "d",
        modelProfileRef: "m",
        desiredDigest: null,
        appliedDigest: null,
        knowledgeState: "current",
        knowledgeArtifact: null,
        retrievalScope: { installationId: "ins-1", moduleKey: "mod", knowledgeVersion: "1" },
    }

    it("refuses a knowledge state outside the closed set and a malformed scope", () => {
        expect(parseModuleInstallationDetail(detail)).not.toBeNull()
        expect(parseModuleInstallationDetail({ ...detail, knowledgeState: "half-synced" })).toBeNull()
        expect(parseModuleInstallationDetail({ ...detail, retrievalScope: {} })).toBeNull()
        expect(parseModuleInstallationDetail({ ...detail, knowledgeArtifact: { id: "a" } })).toBeNull()
    })
})
