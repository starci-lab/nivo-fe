import { describe, expect, it } from "vitest"
import { NIVO_GRAMMAR, NIVO_GRAMMAR_CONTRACTS } from "./grammar"

describe("Nivo Grammar binding", () => {
    it("binds directly to the exact package-owned Core Grammar", () => {
        expect(NIVO_GRAMMAR).toMatchObject({ id: "core", version: "1.1.0" })
    })

    it("aliases canonical owners without creating Nivo derivative identities", () => {
        expect(NIVO_GRAMMAR_CONTRACTS.surfaceCard).toBe(
            NIVO_GRAMMAR.contracts["core.surface-card"],
        )
        expect(NIVO_GRAMMAR_CONTRACTS.surfaceCard).toMatchObject({
            key: "core.surface-card", version: "1.1.0", base: null,
        })
        expect(NIVO_GRAMMAR_CONTRACTS.surfaceListCard.spec.closedInvariants)
            .toContain("one-list-one-shell")
        expect(NIVO_GRAMMAR_CONTRACTS.surfaceListCard.spec.closedInvariants)
            .toContain("one-collection-one-shell")
        expect(NIVO_GRAMMAR_CONTRACTS.rail.key).toBe("core.rail")
        expect(NIVO_GRAMMAR_CONTRACTS.visualTreatment.resolvedAxes).toEqual({})
    })
})
