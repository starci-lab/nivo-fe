import { createTranslator } from "next-intl"
import { describe, expect, it } from "vitest"
import enMessages from "../../../messages/en.json"
import { TIME_ZONE } from "../../i18n/config"
import type { ContextDraft } from "../../../components/blocks/agentos/ContextVersionBlock"
import { buildModulePageCopy } from "../module-page-copy"
import { testContextLabelFor } from "./test-target"

const copy = buildModulePageCopy(
    createTranslator({
        locale: "en",
        messages: enMessages,
        namespace: "console.agentos.modules",
        timeZone: TIME_ZONE,
    }),
)

const draft = (overrides: Partial<ContextDraft>): ContextDraft => ({
    contextId: null,
    setupSessionId: "s-1",
    revision: 3,
    status: "ready",
    version: null,
    digest: "digest-abcdef0123",
    definitionDigest: null,
    authorityGeneration: 1,
    sourceGeneration: 1,
    retrievalGeneration: 1,
    summary: "s",
    facts: [],
    gates: [],
    exactTestPassed: false,
    isActive: false,
    ...overrides,
})

describe("testContextLabelFor", () => {
    it("requires a digest-bearing draft before a run can target it", () => {
        expect(testContextLabelFor(null, copy)).toBe(copy.setup.testableDraftRequired)
        expect(testContextLabelFor(draft({ digest: null }), copy)).toBe(copy.setup.testableDraftRequired)
    })

    it("names an unapplied draft by revision and short digest", () => {
        expect(testContextLabelFor(draft({ version: null }), copy)).toBe(
            copy.setup.testContext({
                revision: 3,
                version: copy.setup.draft,
                digest: "digest-a",
            }),
        )
    })

    it("names an applied draft by context version", () => {
        expect(testContextLabelFor(draft({ version: 7 }), copy)).toBe(
            copy.setup.testContext({
                revision: 3,
                version: copy.setup.contextVersion({ version: 7 }),
                digest: "digest-a",
            }),
        )
    })
})
