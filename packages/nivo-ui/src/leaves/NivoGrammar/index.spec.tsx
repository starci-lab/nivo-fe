import { readdirSync, readFileSync } from "node:fs"
import { relative, resolve } from "node:path"
import { COMMON_GRAMMAR_COMPONENTS } from "@starci/grammar/common"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { NIVO_GRAMMAR, NIVO_GRAMMAR_FAMILY_ID, NivoGrammarRoot, nivoRuleConformance } from "."

describe("NIVO_GRAMMAR", () => {
    it("stamps the family attribute its stylesheet is scoped to", () => {
        const { container } = render(<NivoGrammarRoot>content</NivoGrammarRoot>)

        const root = container.querySelector("[data-grammar-family]")
        expect(root).toHaveAttribute("data-grammar-family", "nivo")
        expect(root).toHaveTextContent("content")
    })

    it("carries the family root through every theme the provider can resolve", () => {
        for (const theme of ["light", "dark", "system"] as const) {
            const { container } = render(<NivoGrammarRoot theme={theme}>content</NivoGrammarRoot>)
            const root = container.querySelector("[data-grammar-family]")

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

/**
 * The invariants that keep the defect from coming back. nivo owns a family; a family never imports
 * another family. Every rule here is about a boundary rather than a rendered pixel, so it is checked
 * against the source text of the whole repository and not against one component.
 */
const ROOT = resolve(import.meta.dirname, "../../../../..")
const APPS = ["apps/app", "apps/landing", "apps/expert"] as const
const SEARCHED = [...APPS, "packages/nivo-ui"] as const

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
                forms.some((form) =>
                    file.text
                        .split(form)
                        .slice(1)
                        .some((rest) => !rest.startsWith("common")),
                ),
            )
            .map((file) => file.path)

        expect(foreign).toEqual([])
    })

    it("loads Common's stylesheet and no other family's", () => {
        const stylesheets = sources.filter(
            (file) => file.text.includes("@starci/grammar") && file.path.endsWith(".css"),
        )

        expect(stylesheets.map((file) => file.path).sort()).toEqual(
            APPS.map((app) => `${app}/src/app/globals.css`).sort(),
        )
        for (const sheet of stylesheets) {
            expect(sheet.text).toContain('@import "@starci/grammar/common.css";')
            expect(sheet.text).not.toContain('@import "@starci/grammar/core.css";')
        }
    })

    it("leaves no Core-only name behind", () => {
        const coreNames =
            /\b(?:CoreGrammarRoot|coreGrammar|CORE_GRAMMAR_COMPONENTS|CoreGrammarComponentName|STARCI_CORE_[A-Z_]+|coreRuleConformance)\b/
        const survivors = sources.filter((file) => coreNames.test(file.text)).map((file) => file.path)

        expect(survivors).toEqual([])
    })

    it("mounts exactly one family root per app, and it is the nivo one", () => {
        for (const app of APPS) {
            const mounting = sources.filter(
                (file) => file.path.startsWith(`${app}/`) && file.text.includes("GrammarRoot"),
            )

            expect(mounting).toHaveLength(1)
            expect(mounting[0]?.text).toContain("NivoGrammarRoot")
        }
    })

    it("declares the family's stylesheet, then the app's brand layer, in every app that mounts the family root", () => {
        for (const app of APPS) {
            const globals = sources.find((file) => file.path === `${app}/src/app/globals.css`)?.text ?? ""
            const family = globals.indexOf('@import "@nivo/ui/family.css";')
            const brand = globals.indexOf('@import "../modules/brand/brand.css";')

            expect(family).toBeGreaterThan(-1)
            expect(brand).toBeGreaterThan(family)
        }
    })
})

/**
 * jsdom parses CSS but resolves no custom property, so `getComputedStyle` on a rendered root
 * reports an empty `--accent` whatever the stylesheet says. The declaration itself is therefore the
 * assertion: these specs read the family stylesheet and each app's brand layer as text and check
 * which file owns which value. The first block of specs proves the root carries the attribute the
 * theme bridge sets.
 */
const FAMILY_SCOPE = '.grammar-common-root[data-grammar-family="nivo"]'
const STARCI_PURPLE = "#7547ff"

/** Comments are stripped first: a comment before a selector would otherwise be read as part of it. */
const stripComments = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "")
const family = stripComments(readFileSync(resolve(import.meta.dirname, "nivo.css"), "utf8"))
const brandOf = (app: string) => stripComments(readFileSync(resolve(ROOT, app, "src/modules/brand/brand.css"), "utf8"))

/** The declarations inside the first block whose selector is exactly `selector`. */
const blockOf = (text: string, selector: string): ReadonlyMap<string, string> => {
    const open = text.indexOf(`${selector} {`)
    if (open === -1) return new Map()
    const body = text.slice(open + selector.length + 2, text.indexOf("}", open))
    return new Map(
        [...body.matchAll(/^\s*(--[a-z-]+|color-scheme):\s*([^;]+);/gm)].map((match) => [
            match[1] as string,
            (match[2] as string).trim(),
        ]),
    )
}

describe("the nivo family stylesheet", () => {
    it("writes no colour: every colour is the brand layer's", () => {
        expect(family).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lch|lab|color-mix)\(/i)
    })

    it("makes the family root inherit every value the brand layer sets, and nothing more", () => {
        const rebound = blockOf(family, FAMILY_SCOPE)
        const light = blockOf(brandOf("apps/app"), ":root")

        expect(rebound.size).toBeGreaterThan(0)
        for (const value of rebound.values()) expect(value).toBe("inherit")
        expect([...rebound.keys()].sort()).toEqual([...light.keys()].sort())
    })

    it("steps aside for forced colours, which Common's own root answers", () => {
        expect(family).toContain("@media (forced-colors: none)")
        expect(family).not.toContain("forced-colors: active")
    })

    it("collapses its one motion duration under reduced motion", () => {
        expect(family).toContain("@media (prefers-reduced-motion: reduce)")
    })

    it("keeps its legacy names as pure aliases of grammar tokens", () => {
        const aliases = [...family.matchAll(/^\s*(--nivo-[a-z-]+):\s*var\((--[a-z-]+)\);/gm)]

        expect(aliases.length).toBeGreaterThan(0)
        for (const alias of aliases) expect(alias[2]).not.toMatch(/^--nivo-/)
    })
})

describe("every app's brand layer", () => {
    it("carries one light block and one dark block over the same tokens", () => {
        for (const app of APPS) {
            const light = blockOf(brandOf(app), ":root")
            const dark = blockOf(brandOf(app), ".dark")

            expect(light.size).toBeGreaterThan(0)
            expect([...dark.keys()].sort()).toEqual([...light.keys()].sort())
            expect(light.get("color-scheme")).toBe("light")
            expect(dark.get("color-scheme")).toBe("dark")
        }
    })

    it("names only grammar tokens, never a family-private one", () => {
        for (const app of APPS) {
            for (const name of blockOf(brandOf(app), ":root").keys()) expect(name).not.toMatch(/^--nivo-/)
        }
    })

    it("is the same layer in every app", () => {
        const [first, ...rest] = APPS.map(brandOf)

        for (const other of rest) expect(other).toBe(first)
    })

    it("holds unicorn red as the accent in both themes, so one red serves light and dark", () => {
        for (const app of APPS) {
            expect(blockOf(brandOf(app), ":root").get("--accent")).toBe("oklch(57% 0.24 25)")
            expect(blockOf(brandOf(app), ".dark").get("--accent")).toBe("oklch(57% 0.24 25)")
        }
    })
})

/** Linear-light sRGB of an `oklch(L% C H)` colour, clamped to the gamut. */
const linearOf = (value: string): ReadonlyArray<number> => {
    const parts = /oklch\(([\d.]+)% ([\d.]+) ([\d.]+)/.exec(value)
    if (parts === null) throw new Error(`not an oklch colour: ${value}`)
    const [lightness, chroma, hue] = [Number(parts[1]) / 100, Number(parts[2]), (Number(parts[3]) * Math.PI) / 180]
    const a = chroma * Math.cos(hue)
    const b = chroma * Math.sin(hue)
    const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
    const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
    const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
    return [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ].map((channel) => Math.min(1, Math.max(0, channel)))
}
const luminance = (value: string) => {
    const [red = 0, green = 0, blue = 0] = linearOf(value)
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}
/** WCAG 2 contrast ratio of two colours. */
const contrast = (foreground: string, background: string) => {
    const [high = 0, low = 0] = [luminance(foreground), luminance(background)].sort((x, y) => y - x)
    return (high + 0.05) / (low + 0.05)
}

/** The text pairs the brand promises: [foreground token, ground token]. */
const TEXT_PAIRS = [
    ["--foreground", "--background"],
    ["--foreground", "--surface"],
    ["--foreground", "--surface-secondary"],
    ["--foreground", "--surface-tertiary"],
    ["--foreground", "--overlay"],
    ["--foreground", "--segment"],
    ["--muted", "--background"],
    ["--muted", "--surface"],
    ["--muted", "--surface-secondary"],
    ["--muted", "--surface-tertiary"],
    ["--muted", "--overlay"],
    ["--field-foreground", "--field-background"],
    ["--field-placeholder", "--field-background"],
    ["--default-foreground", "--default"],
    ["--accent-foreground", "--accent"],
    ["--danger-foreground", "--danger"],
    ["--success-foreground", "--success"],
    ["--warning-foreground", "--warning"],
    ["--info-foreground", "--info"],
] as const

describe("the brand layer's contrast, measured with the WCAG 2 formula", () => {
    it.each([":root", ".dark"])("keeps every text pair at 4.5:1 or better under %s", (selector) => {
        const tokens = blockOf(brandOf("apps/app"), selector)
        const failing = TEXT_PAIRS.filter(
            ([foreground, ground]) => contrast(tokens.get(foreground) ?? "", tokens.get(ground) ?? "") < 4.5,
        )

        expect(failing).toEqual([])
    })

    it.each([":root", ".dark"])(
        "keeps the accent, which is also the focus ring, at 3:1 on the canvas and the surface under %s",
        (selector) => {
            const tokens = blockOf(brandOf("apps/app"), selector)

            for (const ground of ["--background", "--surface"]) {
                expect(contrast(tokens.get("--accent") ?? "", tokens.get(ground) ?? "")).toBeGreaterThanOrEqual(3)
            }
        },
    )

    it.each([":root", ".dark"])(
        "keeps the success, warning, info and danger tones, which are also bare glyphs, at 3:1 on the canvas and every surface under %s",
        (selector) => {
            const tokens = blockOf(brandOf("apps/app"), selector)
            const failing = ["--success", "--warning", "--info", "--danger"].flatMap((glyph) =>
                ["--background", "--surface", "--surface-secondary", "--surface-tertiary"]
                    .filter((ground) => contrast(tokens.get(glyph) ?? "", tokens.get(ground) ?? "") < 3)
                    .map((ground) => [glyph, ground]),
            )

            expect(failing).toEqual([])
        },
    )
})

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
    it("keeps StarCi purple out of the family, and out of every app that mounts it", () => {
        const searched = ["packages/nivo-ui/src", "apps/app/src", "apps/landing/src", "apps/expert/src"]
        const hits = searched.flatMap((dir) =>
            sourcesUnder(resolve(ROOT, dir)).filter((file) =>
                readFileSync(file, "utf8").toLowerCase().includes(STARCI_PURPLE),
            ),
        )

        expect(hits).toEqual([])
    })
})
