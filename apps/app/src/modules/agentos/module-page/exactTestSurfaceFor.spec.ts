import type { ContextDraft } from "../../../components/blocks/agentos/ContextVersionBlock"
import { describe, expect, it } from "vitest"
import { moduleTestSurfaceFixture } from "../../../test-support/mock-result"
import { exactTestSurfaceFor } from "./exactTestSurfaceFor"

const testedDraftDigest = "a".repeat(64)
const testedDraftDefinitionDigest = "d".repeat(64)
const testedDraft: ContextDraft = {
    contextId: "22222222-2222-4222-8222-222222222222",
    setupSessionId: "11111111-1111-4111-8111-111111111111",
    revision: 2,
    status: "completed",
    version: 2,
    digest: testedDraftDigest,
    definitionDigest: testedDraftDefinitionDigest,
    authorityGeneration: 1,
    sourceGeneration: 1,
    retrievalGeneration: 1,
    summary: "A Vietnamese real-estate Support Desk",
    facts: ["Escalate qualified leads to the sales team"],
    gates: [],
    exactTestPassed: true,
    isActive: false,
}

describe("exactTestSurfaceFor", () => {
    it("accepts only evidence for the current setup target and generations", () => {
        const exact = moduleTestSurfaceFixture({
            contextVersionId: testedDraft.contextId,
            setupSessionId: testedDraft.setupSessionId,
            draftDigest: testedDraftDigest,
            definitionDigest: testedDraftDefinitionDigest,
            targetDigest: testedDraftDigest,
            authorityGeneration: testedDraft.authorityGeneration,
            sourceGeneration: testedDraft.sourceGeneration,
            retrievalGeneration: testedDraft.retrievalGeneration,
        })

        expect(exactTestSurfaceFor(exact, testedDraft)).toBe(exact)
        expect(exactTestSurfaceFor(null, testedDraft)).toBeNull()
        expect(exactTestSurfaceFor(exact, { ...testedDraft, digest: null })).toBeNull()
        expect(exactTestSurfaceFor(exact, { ...testedDraft, sourceGeneration: 2 })).toBeNull()
        expect(
            exactTestSurfaceFor(
                moduleTestSurfaceFixture({
                    ...exact.run,
                    contextVersionId: "other-context",
                    setupSessionId: null,
                    draftDigest: null,
                }),
                testedDraft,
            ),
        ).toBeNull()
    })

    it("accepts only exact setup digest evidence", () => {
        const draft: ContextDraft = {
            contextId: null,
            setupSessionId: "setup-1",
            revision: 1,
            status: "completed",
            version: null,
            summary: "Support context",
            facts: [],
            digest: "a".repeat(64),
            definitionDigest: "d".repeat(64),
            authorityGeneration: 1,
            sourceGeneration: 1,
            retrievalGeneration: 1,
            gates: [],
            exactTestPassed: true,
            isActive: false,
        }
        const exact = moduleTestSurfaceFixture({
            setupSessionId: "setup-1",
            draftDigest: "a".repeat(64),
            definitionDigest: "d".repeat(64),
            targetDigest: "a".repeat(64),
            authorityGeneration: 1,
            sourceGeneration: 1,
            retrievalGeneration: 1,
        })
        expect(exactTestSurfaceFor(exact, draft)).toBe(exact)
        const versionedDraft = { ...draft, contextId: "context-1" }
        const contextTargeted = moduleTestSurfaceFixture({
            ...exact.run,
            setupSessionId: null,
            draftDigest: null,
            contextVersionId: versionedDraft.contextId,
        })
        expect(exactTestSurfaceFor(contextTargeted, versionedDraft)).toBe(contextTargeted)
        expect(
            exactTestSurfaceFor(
                moduleTestSurfaceFixture({ ...contextTargeted.run, contextVersionId: null }),
                draft,
            ),
        ).toBeNull()
        expect(
            exactTestSurfaceFor(
                moduleTestSurfaceFixture({ ...contextTargeted.run, contextVersionId: "other-context" }),
                versionedDraft,
            ),
        ).toBeNull()
        expect(
            exactTestSurfaceFor(moduleTestSurfaceFixture({ ...exact.run, draftDigest: "b".repeat(64) }), draft),
        ).toBeNull()
        expect(exactTestSurfaceFor(null, draft)).toBeNull()
    })

    it("does not attach stale Test evidence to a different Setup draft", () => {
        const stale = moduleTestSurfaceFixture({
            setupSessionId: "33333333-3333-4333-8333-333333333333",
            draftDigest: "b".repeat(64),
        })
        const exact = moduleTestSurfaceFixture({
            setupSessionId: testedDraft.setupSessionId,
            draftDigest: testedDraftDigest,
            definitionDigest: testedDraftDefinitionDigest,
            targetDigest: testedDraftDigest,
            authorityGeneration: 1,
            sourceGeneration: 1,
            retrievalGeneration: 1,
        })

        expect(exactTestSurfaceFor(stale, testedDraft)).toBeNull()
        expect(exactTestSurfaceFor(exact, testedDraft)).toBe(exact)
        expect(exactTestSurfaceFor(exact, { ...testedDraft, digest: null })).toBeNull()
    })
})
