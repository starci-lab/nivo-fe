import { readdirSync, readFileSync } from "node:fs"
import { relative, resolve } from "node:path"
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
        expect(Object.keys(NIVO_GRAMMAR.components).sort()).toEqual(
            Object.keys(COMMON_GRAMMAR_COMPONENTS).sort(),
        )
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

/**
 * The invariants that keep the defect from coming back. nivo owns a family; a family never imports
 * another family. Every rule here is about a boundary rather than a rendered pixel, so it is checked
 * against the source text of the whole repository and not against one component.
 */
const ROOT = resolve(import.meta.dirname, "../../../../..")
const APPS = ["apps/app", "apps/landing", "apps/expert"] as const
const SEARCHED = [...APPS, "packages/ui"] as const

const filesUnder = (dir: string): ReadonlyArray<string> =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const path = resolve(dir, entry.name)
        if (entry.isDirectory()) return entry.name === "node_modules" || entry.name === ".next" ? [] : filesUnder(path)
        return /\.(?:ts|tsx|css)$/.test(entry.name) ? [path] : []
    })

/**
 * Specs are excluded on purpose: this file quotes the very names it forbids, so a scan that read
 * itself would report itself and never go green.
 */
const sources = SEARCHED.flatMap((dir) => filesUnder(resolve(ROOT, dir, "src")))
    .filter((path) => !/\.spec\.[a-z]+$/.test(path))
    .map((path) => ({ path: relative(ROOT, path).split("\\").join("/"), text: readFileSync(path, "utf8") }))

describe("NIVO_GRAMMAR", () => {
    it("imports Grammar renderers from the Common entry, never from another family's", () => {
        // Only a real specifier counts; prose naming Core in a comment explains the boundary rather than crossing it.
        const forms = ['from "@starci/grammar/', 'import "@starci/grammar/'] as const
        const foreign = sources
            .filter((file) =>
                forms.some((form) => file.text.split(form).slice(1).some((rest) => !rest.startsWith("common"))),
            )
            .map((file) => file.path)

        expect(foreign).toEqual([])
    })

    it("loads Common's stylesheet and no other family's", () => {
        const stylesheets = sources.filter((file) => file.text.includes("@starci/grammar") && file.path.endsWith(".css"))

        expect(stylesheets.map((file) => file.path).sort()).toEqual(
            APPS.map((app) => `${app}/src/app/globals.css`).sort(),
        )
        for (const sheet of stylesheets) {
            expect(sheet.text).toContain('@import "@starci/grammar/common.css";')
            expect(sheet.text).not.toContain('@import "@starci/grammar/core.css";')
        }
    })

    it("leaves no Core-only name behind", () => {
        const coreNames = /\b(?:CoreGrammarRoot|coreGrammar|CORE_GRAMMAR_COMPONENTS|CoreGrammarComponentName|STARCI_CORE_[A-Z_]+|coreRuleConformance)\b/
        const survivors = sources.filter((file) => coreNames.test(file.text)).map((file) => file.path)

        expect(survivors).toEqual([])
    })

    it("mounts exactly one family root per app, and it is the nivo one", () => {
        for (const app of APPS) {
            const mounting = sources.filter((file) => file.path.startsWith(`${app}/`) && file.text.includes("GrammarRoot"))

            expect(mounting).toHaveLength(1)
            expect(mounting[0]?.text).toContain("NivoGrammarRoot")
        }
    })

    it("declares the family's stylesheet in every app that mounts the family root", () => {
        for (const app of APPS) {
            const globals = sources.find((file) => file.path === `${app}/src/app/globals.css`)

            expect(globals?.text).toContain('@import "@nivo/ui/family.css";')
        }
    })
})

/**
 * jsdom parses CSS but resolves no custom property, so `getComputedStyle` on a rendered root
 * reports an empty `--accent` whatever the stylesheet says. The declaration itself is therefore the
 * assertion: this file reads the family stylesheet as text and checks which selector owns which
 * value. `index.spec.tsx` proves the root carries the attribute those selectors key off.
 */
const FAMILY_SCOPE = '.grammar-common-root[data-grammar-family="nivo"]'
const NIVO_RED = "oklch(57% 0.24 25)"
const STARCI_PURPLE = "#7547ff"

type Rule = { readonly selector: string; readonly body: string }

/** Comments are stripped first: a comment before a selector would otherwise be read as part of it. */
const css = readFileSync(resolve(import.meta.dirname, "nivo.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "")

/** Every style rule in the sheet, at-rules descended into rather than treated as one rule. */
const rulesIn = (text: string): ReadonlyArray<Rule> => {
    const found: Array<Rule> = []
    let cursor = 0
    while (cursor < text.length) {
        const open = text.indexOf("{", cursor)
        if (open === -1) break
        const selector = text.slice(cursor, open).trim()
        let depth = 1
        let scan = open + 1
        while (scan < text.length && depth > 0) {
            if (text[scan] === "{") depth += 1
            if (text[scan] === "}") depth -= 1
            scan += 1
        }
        const body = text.slice(open + 1, scan - 1)
        found.push(...(selector.startsWith("@") ? rulesIn(body) : [{ selector, body }]))
        cursor = scan
    }
    return found
}

const rules = rulesIn(css)
const declares = (rule: Rule, property: string) => new RegExp(`(?:^|\\s)${property}:`, "m").test(rule.body)
const declaring = (property: string) => rules.filter((rule) => declares(rule, property))

/**
 * Every source file under `dir` a colour literal could hide in. Specs are excluded: this one names
 * the purple in order to forbid it, and a scan that read itself could never go green.
 */
const sourcesUnder = (dir: string): ReadonlyArray<string> =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const path = resolve(dir, entry.name)
        if (entry.isDirectory()) return sourcesUnder(path)
        return /\.(?:ts|tsx|css|mjs|json)$/.test(entry.name) && !/\.spec\./.test(entry.name) ? [path] : []
    })

describe("NIVO_GRAMMAR", () => {
    it("scopes every value it declares to the nivo family root", () => {
        const valued = rules.filter((rule) => /(?:^|\s)--[a-z]/m.test(rule.body))

        expect(valued.length).toBeGreaterThan(0)
        for (const rule of valued) {
            expect(rule.selector).toContain(FAMILY_SCOPE)
        }
    })

    it("binds --accent to the nivo red under the family root, in light and in dark", () => {
        const accent = declaring("--accent")
        expect(accent).toHaveLength(1)
        expect(accent[0]?.selector).toContain(FAMILY_SCOPE)
        expect(accent[0]?.body).toContain("--accent: var(--nivo-accent);")

        const light = declaring("--nivo-accent").find((rule) => rule.body.includes(`--nivo-accent: ${NIVO_RED};`))
        expect(light?.selector).toContain(FAMILY_SCOPE)

        // Dark restates the neutrals and never the accent, so one red serves both themes.
        const dark = rules.find((rule) => rule.selector.includes('[data-grammar-theme="dark"]'))
        expect(dark?.body).toContain("--nivo-foreground:")
        expect(declares(dark as Rule, "--nivo-accent")).toBe(false)
    })

    it("answers the accessibility media queries the family is responsible for", () => {
        expect(css).toContain("@media (prefers-color-scheme: dark)")
        expect(css).toContain("@media (forced-colors: active)")
        expect(css).toContain("@media (prefers-reduced-motion: reduce)")
    })

    it("keeps StarCi purple out of the family, and out of every app that mounts it", () => {
        const root = resolve(import.meta.dirname, "../../../../..")
        const searched = ["packages/ui/src", "apps/app/src", "apps/landing/src", "apps/expert/src"]
        const hits = searched.flatMap((dir) =>
            sourcesUnder(resolve(root, dir)).filter((file) =>
                readFileSync(file, "utf8").toLowerCase().includes(STARCI_PURPLE),
            ),
        )

        expect(hits).toEqual([])
    })
})