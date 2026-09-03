import { readdirSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

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
const rulesIn = (text: string): readonly Rule[] => {
    const found: Rule[] = []
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
const sourcesUnder = (dir: string): readonly string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const path = resolve(dir, entry.name)
        if (entry.isDirectory()) return sourcesUnder(path)
        return /\.(?:ts|tsx|css|mjs|json)$/.test(entry.name) && !/\.spec\./.test(entry.name) ? [path] : []
    })

describe("the nivo family stylesheet", () => {
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
        const root = resolve(import.meta.dirname, "../../../..")
        const searched = ["packages/ui/src", "apps/app/src", "apps/landing/src", "apps/expert/src"]
        const hits = searched.flatMap((dir) =>
            sourcesUnder(resolve(root, dir)).filter((file) =>
                readFileSync(file, "utf8").toLowerCase().includes(STARCI_PURPLE),
            ),
        )

        expect(hits).toEqual([])
    })
})
