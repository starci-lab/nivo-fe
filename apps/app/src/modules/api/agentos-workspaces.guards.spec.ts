import { describe, expect, it } from "vitest"

import {
    parseAgentWorkspaceAppLaunch,
    parseAgentWorkspaceControlCenter,
    parseAgentWorkspaceRowAnswer,
    parseAgentWorkspaceRows,
    parseRenewedAgentWorkspaceAppLaunch,
    parseRevokedAgentWorkspaceAppLaunch,
} from "./agentos-workspaces.guards"

const row = { id: "w-1", name: "Alpha", status: "active", catalogOrder: null }

const runtime = {
    instanceId: "i-1",
    appKey: "OPENCLAW",
    status: "running",
    releaseName: null,
    chartName: null,
    chartVersion: null,
    components: [],
    storage: [],
    totals: {
        cpuUsageMillicores: null,
        cpuRequestMillicores: 0,
        cpuLimitMillicores: 0,
        memoryUsageBytes: null,
        memoryRequestBytes: 0,
        memoryLimitBytes: 0,
        restartCount: 0,
        oomKilled: false,
        throttled: null,
    },
    probeStatus: "available",
    fingerprint: "fp",
    lastError: null,
    observedAt: "t",
    stale: false,
}

const center = {
    workspace: { id: "w-1", name: null, status: "active", externalWorkspaceRef: null },
    instance: null,
    apps: [{ app: "OPENCLAW", accessMode: "NIVO_CONSOLE", available: true, reason: null, observedVersion: null }],
    runtime: null,
}

describe("parseAgentWorkspaceRows / parseAgentWorkspaceRowAnswer", () => {
    it("refuses a malformed row and a malformed catalog-order handle", () => {
        expect(parseAgentWorkspaceRows([row])).toHaveLength(1)
        expect(parseAgentWorkspaceRowAnswer(row)).not.toBeNull()
        expect(parseAgentWorkspaceRows([{ id: "w-1" }])).toBeNull()
        expect(parseAgentWorkspaceRowAnswer({ ...row, catalogOrder: "o-1" })).toBeNull()
    })
})

describe("parseAgentWorkspaceControlCenter", () => {
    it("refuses a malformed payload: unknown app name, poisoned runtime, malformed instance", () => {
        expect(parseAgentWorkspaceControlCenter(center)).not.toBeNull()
        expect(parseAgentWorkspaceControlCenter({ ...center, runtime })).not.toBeNull()
        expect(
            parseAgentWorkspaceControlCenter({
                ...center,
                apps: [{ ...center.apps[0], app: "MAGIC" }],
            }),
        ).toBeNull()
        expect(
            parseAgentWorkspaceControlCenter({
                ...center,
                runtime: { ...runtime, probeStatus: "half-seen" },
            }),
        ).toBeNull()
        expect(
            parseAgentWorkspaceControlCenter({
                ...center,
                instance: { id: "i-1", name: "n", hostname: "h", status: "running", chartVersion: "1", ramMb: "lots", vcpu: 2, planCode: null, planRamGb: null, planVcpu: null },
            }),
        ).toBeNull()
        expect(
            parseAgentWorkspaceControlCenter({ ...center, recovery: { state: "x" } }),
        ).toBeNull()
    })
})

describe("parseAgentWorkspaceAppLaunch", () => {
    it("refuses a launch answer without its redirect", () => {
        expect(parseAgentWorkspaceAppLaunch({ launchId: "l", redirectUrl: "u", expiresAt: "t" })).not.toBeNull()
        expect(parseAgentWorkspaceAppLaunch({ launchId: "l", expiresAt: "t" })).toBeNull()
    })
})

describe("parseRenewedAgentWorkspaceAppLaunch", () => {
    it("refuses a renewal without its expiry", () => {
        expect(parseRenewedAgentWorkspaceAppLaunch({ launchId: "l", expiresAt: "t" })).not.toBeNull()
        expect(parseRenewedAgentWorkspaceAppLaunch({ launchId: 4, expiresAt: "t" })).toBeNull()
    })
})

describe("parseRevokedAgentWorkspaceAppLaunch", () => {
    it("refuses a revocation flag that is not boolean", () => {
        expect(parseRevokedAgentWorkspaceAppLaunch({ launchId: "l", revoked: true })).not.toBeNull()
        expect(parseRevokedAgentWorkspaceAppLaunch({ launchId: "l", revoked: "yes" })).toBeNull()
    })
})
