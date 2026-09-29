import { describe, expect, it } from "vitest"

import { parseModuleStudio, parseModuleUploadCapability } from "./agentos-module-studio.guards"

const module_ = {
    id: "m-1",
    agentWorkspaceId: "w-1",
    name: "Mod",
    status: "draft",
    progress: 0,
    missingFields: [],
    currentQuestion: null,
    specificationVersion: null,
    installationId: null,
    failureCode: null,
}

const studio = {
    module: module_,
    profileFacts: [{ key: "k", value: "v" }],
    messages: [{ id: "msg", role: "assistant", content: "hi", sequence: 1 }],
    attachments: [],
    integrations: [],
    specification: null,
}

describe("parseModuleStudio", () => {
    it("refuses a malformed payload: bad module status, malformed message, poisoned attachment", () => {
        expect(parseModuleStudio(studio)).not.toBeNull()
        expect(parseModuleStudio({ ...studio, module: { ...module_, status: "halfway" } })).toBeNull()
        expect(
            parseModuleStudio({ ...studio, messages: [{ id: "m", role: "system", content: "x", sequence: 0 }] }),
        ).toBeNull()
        expect(parseModuleStudio({ ...studio, attachments: [{ id: "a" }] })).toBeNull()
        expect(parseModuleStudio({ ...studio, specification: { id: "s", version: 1, status: "drafting" } })).toBeNull()
    })
})

describe("parseModuleUploadCapability", () => {
    it("refuses a capability whose method is not PUT or that lacks the studio projection", () => {
        const capability = { ...studio, attachmentId: "a-1", uploadUrl: "u", uploadMethod: "PUT", uploadExpiresAt: "t" }
        expect(parseModuleUploadCapability(capability)).not.toBeNull()
        expect(parseModuleUploadCapability({ ...capability, uploadMethod: "POST" })).toBeNull()
        expect(parseModuleUploadCapability({ ...capability, module: null })).toBeNull()
    })
})
