import { createTranslator } from "next-intl"
import { describe, expect, it } from "vitest"
import enMessages from "../../../messages/en.json"
import { TIME_ZONE } from "@/modules/i18n"
import {
    moduleRuntimeFixture,
    runtimeContextFixture,
    runtimeSessionFixture,
} from "../../../test-support/mock-result"
import { buildModulePageCopy } from "../module-page-copy"
import {
    activeVersionFor,
    executeSessionFor,
    executeSessionIdFor,
    executeSessionTitleFor,
    primarySessionFor,
    selectedSessionTitleFor,
} from "./sessions"

const copy = buildModulePageCopy(
    createTranslator({
        locale: "en",
        messages: enMessages,
        namespace: "console.agentos.modules",
        timeZone: TIME_ZONE,
    }),
)

const session = (id: string, title = "New Execute session") =>
    runtimeSessionFixture({ id, mode: "execute", title })

describe("activeVersionFor", () => {
    it("reads the version of the context the installation applied", () => {
        const runtime = moduleRuntimeFixture({
            installation: { activeContextVersionId: "ctx-1" },
            contextVersions: [runtimeContextFixture({ id: "ctx-1", version: 4 })],
        })
        expect(activeVersionFor(runtime)).toBe(4)
        expect(activeVersionFor(moduleRuntimeFixture())).toBeNull()
    })
})

describe("primarySessionFor", () => {
    it("keeps the named primary while it exists, otherwise the first session", () => {
        const runtime = moduleRuntimeFixture({
            installation: { primaryOpsSessionId: "s1" },
            executeSessions: [session("s1"), session("s2")],
        })
        expect(primarySessionFor(runtime)).toBe("s1")
        const renamed = moduleRuntimeFixture({
            installation: { primaryOpsSessionId: "gone" },
            executeSessions: [session("s2"), session("s3")],
        })
        expect(primarySessionFor(renamed)).toBe("s2")
        expect(primarySessionFor(moduleRuntimeFixture())).toBeNull()
    })
})

describe("executeSessionIdFor and executeSessionFor", () => {
    const runtime = moduleRuntimeFixture({
        executeSessions: [session("s1"), session("s2")],
    })

    it("keeps a valid selection and repairs a stale one", () => {
        expect(executeSessionIdFor(runtime, "s2")).toBe("s2")
        expect(executeSessionIdFor(runtime, "gone")).toBe("s1")
        expect(executeSessionIdFor(runtime, null)).toBe("s1")
        expect(executeSessionFor(runtime, "s2")?.id).toBe("s2")
        expect(executeSessionFor(moduleRuntimeFixture(), null)).toBeNull()
    })
})

describe("session titles", () => {
    it("names untitled sessions by ordinal and honors the primary label", () => {
        expect(executeSessionTitleFor("My session", 0, copy)).toBe("My session")
        expect(executeSessionTitleFor("New Execute session", 1, copy)).toBe(
            copy.shell.conversation({ number: 2 }),
        )
    })

    it("gives the selected session the primary label, its title, or the empty state", () => {
        const primary = session("s1", "My session")
        const runtime = moduleRuntimeFixture({
            installation: { primaryOpsSessionId: "s1" },
            executeSessions: [primary],
        })
        expect(selectedSessionTitleFor(null, runtime, copy)).toBe(copy.shell.noExecuteSession)
        expect(selectedSessionTitleFor(primary, runtime, copy)).toBe(copy.shell.primaryOperations)
        const ordinary = moduleRuntimeFixture({ executeSessions: [session("s2", "Mine")] })
        expect(selectedSessionTitleFor(ordinary.executeSessions[0] ?? null, ordinary, copy)).toBe("Mine")
    })
})
