import { createTranslator } from "next-intl"
import { describe, expect, it } from "vitest"
import enMessages from "../../../messages/en.json"
import { TIME_ZONE } from "../../i18n/config"
import {
    moduleRuntimeFixture,
    moduleTestSurfaceFixture,
    runtimeContextFixture,
    runtimeSessionFixture,
} from "../../../test-support/mock-result"
import { buildModulePageCopy } from "../module-page-copy"
import { contextDraftFor, draftFactsFor, exactTestPassedFor, setupSessionFor } from "./setup-draft"

const copy = buildModulePageCopy(
    createTranslator({
        locale: "en",
        messages: enMessages,
        namespace: "console.agentos.modules",
        timeZone: TIME_ZONE,
    }),
)

const setupSession = (id: string, overrides = {}) =>
    runtimeSessionFixture({
        id,
        mode: "setup",
        setupRevision: 2,
        setupStatus: "ready",
        draftDigest: "digest-1",
        draftSnapshot: { summary: "hello" },
        ...overrides,
    })

describe("setupSessionFor", () => {
    it("keeps a live selection, then the runtime session, then the latest one", () => {
        const a = setupSession("s-a")
        const b = setupSession("s-b")
        const runtime = moduleRuntimeFixture({
            setupSession: a,
            setupSessions: [a, b],
        })
        expect(setupSessionFor(runtime, "s-b")?.id).toBe("s-b")
        expect(setupSessionFor(runtime, "gone")?.id).toBe("s-a")
        const noCurrent = moduleRuntimeFixture({ setupSessions: [a, b] })
        expect(setupSessionFor(noCurrent, null)?.id).toBe("s-b")
        expect(setupSessionFor(moduleRuntimeFixture(), null)).toBeNull()
    })
})

describe("draftFactsFor", () => {
    it("lists explicit string facts first and sample entries otherwise", () => {
        expect(draftFactsFor(null)).toEqual([])
        expect(draftFactsFor({ facts: ["a", "b"] })).toEqual(["a", "b"])
        expect(draftFactsFor({ facts: ["a", 4] })).toEqual(["a"])
        expect(draftFactsFor({ summary: "skip-me", hours: "9-5" })).toEqual(["hours: 9-5"])
    })
})

describe("contextDraftFor", () => {
    it("is null while the session carries no revision", () => {
        const runtime = moduleRuntimeFixture({ setupSession: setupSession("s-1", { setupRevision: null }) })
        expect(contextDraftFor(runtime, runtime.setupSession, null, copy)).toBeNull()
    })

    it("summarises the draft snapshot and marks an applied context active", () => {
        const session = setupSession("s-1")
        const context = runtimeContextFixture({ id: "ctx-1", sourceSetupSessionId: "s-1" })
        const runtime = moduleRuntimeFixture({
            installation: { activeContextVersionId: "ctx-1" },
            setupSession: session,
            setupSessions: [session],
            contextVersions: [context],
        })
        const draft = contextDraftFor(runtime, session, null, copy)
        expect(draft?.summary).toBe("hello")
        expect(draft?.version).toBe(1)
        expect(draft?.isActive).toBe(true)
        expect(draft?.contextId).toBe("ctx-1")
    })
})

describe("exactTestPassedFor", () => {
    const context = runtimeContextFixture({ id: "ctx-1", sourceSetupSessionId: "s-1" })
    const runtime = moduleRuntimeFixture({
        installation: {
            runtimeManifest: {
                schemaVersion: 1,
                kind: { key: "k", version: "1" },
                workbench: { key: "w", version: "1" },
                widgets: [],
                config: {},
                test: {
                    workbench: { key: "w", version: "1" },
                    contract: { key: "c", version: "1" },
                    sandboxAdapter: { key: "s", version: "1" },
                    evidenceWidget: { key: "e", version: "1" },
                    scenarios: [
                        {
                            key: "acceptance-basic",
                            label: "Basic",
                            description: "",
                            fixture: {},
                            assertions: [],
                        },
                    ],
                },
            },
        },
        contextVersions: [context],
    })

    it("is false without a digest, a context, or matching passed runs", () => {
        expect(exactTestPassedFor(null, runtime, context, "s-1", "digest-1")).toBe(false)
        expect(exactTestPassedFor(null, runtime, context, "s-1", null)).toBe(false)
        expect(exactTestPassedFor(null, runtime, null, "s-1", "digest-1")).toBe(false)
    })

    it("is true when every required scenario passed against this exact draft", () => {
        const surface = moduleTestSurfaceFixture({
            scenarioKey: "acceptance-basic",
            mode: "acceptance",
            status: "passed",
            contextVersionId: "ctx-1",
            setupSessionId: "s-1",
            draftDigest: "digest-1",
            definitionDigest: "definition-fixture",
            targetDigest: "digest-1",
            authorityGeneration: 1,
            sourceGeneration: 1,
            retrievalGeneration: 1,
        })
        expect(exactTestPassedFor(surface, runtime, context, "s-1", "digest-1")).toBe(true)
    })
})
