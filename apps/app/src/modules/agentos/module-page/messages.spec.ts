import { createFormatter, createTranslator } from "next-intl"
import { describe, expect, it } from "vitest"
import enMessages from "../../../messages/en.json"
import { TIME_ZONE } from "@/modules/i18n"
import {
    moduleRuntimeFixture,
    runtimeContextFixture,
    runtimeMessageFixture,
    runtimeSessionFixture,
} from "../../../test-support/mock-result"
import { buildModulePageCopy } from "../module-page-copy"
import {
    executeMessagesFor,
    executeSessionsFor,
    setupMessagesFor,
    setupOpenFor,
    setupRevisionsFor,
} from "./messages"

const copy = buildModulePageCopy(
    createTranslator({
        locale: "en",
        messages: enMessages,
        namespace: "console.agentos.modules",
        timeZone: TIME_ZONE,
    }),
)

describe("setupMessagesFor", () => {
    it("keeps only the lines of the selected setup session", () => {
        const selected = runtimeSessionFixture({ id: "s-1", mode: "setup" })
        const runtime = moduleRuntimeFixture({
            setupSessions: [selected],
            messages: [
                runtimeMessageFixture({ id: "m-1", sessionId: "s-1", content: "one" }),
                runtimeMessageFixture({ id: "m-2", sessionId: "s-2", content: "other" }),
            ],
        })
        expect(setupMessagesFor(runtime, selected).map((line) => line.id)).toEqual(["m-1"])
        expect(setupMessagesFor(runtime, null)).toEqual([])
    })
})

describe("setupRevisionsFor and setupOpenFor", () => {
    it("lists only revisioned sessions and reports an open gate", () => {
        const runtime = moduleRuntimeFixture({
            setupSessions: [
                runtimeSessionFixture({ id: "s-1", setupRevision: 1, setupStatus: "completed" }),
                runtimeSessionFixture({ id: "s-2", setupRevision: 2, setupStatus: "open" }),
                runtimeSessionFixture({ id: "s-3" }),
            ],
        })
        expect(setupRevisionsFor(runtime).map((row) => row.id)).toEqual(["s-1", "s-2"])
        expect(setupOpenFor(runtime)).toBe(true)
        const allDone = moduleRuntimeFixture({
            setupSessions: [
                runtimeSessionFixture({ id: "s-1", setupRevision: 1, setupStatus: "completed" }),
            ],
        })
        expect(setupOpenFor(allDone)).toBe(false)
    })
})

describe("executeSessionsFor", () => {
    it("titles the primary session and ordinals the rest", () => {
        const runtime = moduleRuntimeFixture({
            installation: { primaryOpsSessionId: "s-1" },
            executeSessions: [
                runtimeSessionFixture({ id: "s-1", mode: "execute" }),
                runtimeSessionFixture({ id: "s-2", mode: "execute", isArchived: true }),
            ],
        })
        const rows = executeSessionsFor(runtime, copy, createFormatter({ locale: "en" }))
        expect(rows.map((row) => row.title)).toEqual([
            copy.shell.primaryOperations,
            copy.shell.conversation({ number: 2 }),
        ])
        expect(rows.map((row) => row.status)).toEqual(["active", "archived"])
    })
})

describe("executeMessagesFor", () => {
    it("labels messages with the context version they were accepted under", () => {
        const session = runtimeSessionFixture({ id: "s-1", mode: "execute" })
        const runtime = moduleRuntimeFixture({
            executeSessions: [session],
            contextVersions: [runtimeContextFixture({ id: "ctx-1", version: 3 })],
            messages: [
                runtimeMessageFixture({ id: "m-1", sessionId: "s-1", contextVersionId: "ctx-1" }),
                runtimeMessageFixture({ id: "m-2", sessionId: "s-1", contextVersionId: null }),
            ],
        })
        const rows = executeMessagesFor(runtime, session, copy)
        expect(rows.map((row) => row.contextLabel)).toEqual([
            copy.shell.boundContext({ version: 3 }),
            copy.shell.noContextApplied,
        ])
        expect(executeMessagesFor(runtime, null, copy)).toEqual([])
    })
})
