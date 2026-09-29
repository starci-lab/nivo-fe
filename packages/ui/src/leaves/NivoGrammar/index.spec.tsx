import { COMMON_GRAMMAR_COMPONENTS } from "@starci/grammar/common"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { NIVO_GRAMMAR, NIVO_GRAMMAR_FAMILY_ID, NivoGrammarRoot, nivoRuleConformance } from "."

describe("NIVO_GRAMMAR", () => {
    it("stamps the family attribute its stylesheet is scoped to", () => {
        const { container } = render(<NivoGrammarRoot>content</NivoGrammarRoot>)

        const root = container.querySelector(".grammar-common-root")
        expect(root).toHaveAttribute("data-grammar-family", "nivo")
        expect(root).toHaveTextContent("content")
    })

    it("carries the family root through every theme the provider can resolve", () => {
        for (const theme of ["light", "dark", "system"] as const) {
            const { container } = render(<NivoGrammarRoot theme={theme}>content</NivoGrammarRoot>)
            const root = container.querySelector(".grammar-common-root")

            expect(root).toHaveAttribute("data-grammar-family", "nivo")
            expect(root).toHaveAttribute("data-grammar-theme", theme)
        }
    })

    it("names itself nivo, and says where its values live", () => {
        expect(NIVO_GRAMMAR_FAMILY_ID).toBe("nivo")
        expect(NIVO_GRAMMAR.id).toBe("nivo")
        expect(NIVO_GRAMMAR.familyId).toBe("nivo")
        expect(NIVO_GRAMMAR.scopeProps).toEqual({ "data-grammar-family": "nivo" })
        expect(NIVO_GRAMMAR.styles).toEqual({
            entrypoint: "@nivo/ui/family.css",
            scope: { attribute: "data-grammar-family", value: "nivo" },
        })
    })

    it("replaces only the root, and inherits every other Common renderer unchanged", () => {
        expect(Object.keys(NIVO_GRAMMAR.components).sort()).toEqual(Object.keys(COMMON_GRAMMAR_COMPONENTS).sort())
        expect(NIVO_GRAMMAR.components.GrammarRoot).not.toBe(COMMON_GRAMMAR_COMPONENTS.GrammarRoot)

        const inherited = Object.entries(NIVO_GRAMMAR.components).filter(([name]) => name !== "GrammarRoot")
        expect(inherited.length).toBeGreaterThan(0)
        for (const [name, renderer] of inherited) {
            expect(renderer).toBe(COMMON_GRAMMAR_COMPONENTS[name as keyof typeof COMMON_GRAMMAR_COMPONENTS])
        }
    })

    it("inherits the Common rule set rather than claiming rules of its own", () => {
        expect(nivoRuleConformance.familyId).toBe("nivo")
        expect(nivoRuleConformance.inheritedCommonRules.length).toBeGreaterThan(0)
    })
})
