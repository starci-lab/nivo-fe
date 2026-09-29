import { describe, expect, it } from "vitest"

import { parseChannelSetting, parseModuleRuntime } from "./agentos-module-runtime.guards"

const installation = {
    id: "i-1",
    agentWorkspaceId: "w-1",
    moduleKey: "mod",
    moduleVersion: "1",
    displayName: "Mod",
    kindKey: "k",
    kindVersion: "1",
    workbenchKey: "wb",
    workbenchVersion: "1",
    runtimeManifest: {
        schemaVersion: 1,
        kind: { key: "k", version: "1" },
        workbench: { key: "wb", version: "1" },
        widgets: [],
        config: {},
    },
    settingsVersion: 1,
    setupAuthorityGeneration: 1,
    setupSourceGeneration: 1,
    setupRetrievalGeneration: 1,
    activeContextVersionId: null,
    liveEnabled: false,
    operatingMode: "assist",
    channelAccountRef: null,
    primaryOpsSessionId: null,
    status: "active",
    failureCode: null,
    createdAt: "t",
    updatedAt: "t",
}

const runtime = {
    installation,
    setupSession: null,
    setupSessions: [],
    executeSessions: [],
    participants: [],
    messages: [],
    contextVersions: [],
    widgets: [],
    operationEvents: [],
    tasks: [],
    credentials: [],
    settings: null,
    diagnostics: {},
}

describe("parseModuleRuntime", () => {
    it("refuses a malformed projection: missing installation, poisoned diagnostics, bad manifest facet", () => {
        expect(parseModuleRuntime(runtime)).not.toBeNull()
        expect(parseModuleRuntime({ ...runtime, installation: null })).toBeNull()
        expect(parseModuleRuntime({ ...runtime, diagnostics: { bad: undefined } })).toBeNull()
        expect(
            parseModuleRuntime({
                ...runtime,
                installation: {
                    ...installation,
                    runtimeManifest: {
                        ...installation.runtimeManifest,
                        widgets: [{ component: "c", version: "1", allowedProps: "any" }],
                    },
                },
            }),
        ).toBeNull()
        expect(
            parseModuleRuntime({
                ...runtime,
                installation: {
                    ...installation,
                    runtimeManifest: {
                        ...installation.runtimeManifest,
                        credentialSlots: [{ key: "k", label: "l", provider: "p", secret: false }],
                    },
                },
            }),
        ).toBeNull()
    })
})

describe("parseChannelSetting", () => {
    const setting = {
        provider: "zalo",
        accountId: "a-1",
        state: "APPLIED",
        displayName: null,
        credentials: [{ key: "token", required: true, configured: false, hint: null, syncedAt: null }],
    }

    it("refuses a state outside the closed set and a credential row missing its flags", () => {
        expect(parseChannelSetting(setting)).not.toBeNull()
        expect(parseChannelSetting({ ...setting, state: "SYNCING" })).toBeNull()
        expect(
            parseChannelSetting({ ...setting, credentials: [{ key: "token", required: true, configured: "yes", hint: null, syncedAt: null }] }),
        ).toBeNull()
    })
})
