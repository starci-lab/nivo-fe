import { readdirSync, readFileSync } from "node:fs"
import { relative, resolve } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * The invariants that keep the defect from coming back. nivo owns a family; a family never imports
 * another family. Every rule here is about a boundary rather than a rendered pixel, so it is checked
 * against the source text of the whole repository and not against one component.
 */
const ROOT = resolve(import.meta.dirname, "../../../..")
const APPS = ["apps/app", "apps/landing", "apps/expert"] as const
const SEARCHED = [...APPS, "packages/ui"] as const

const filesUnder = (dir: string): readonly string[] =>
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

describe("@starci/grammar import invariants", () => {
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
