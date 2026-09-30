import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { test } from "node:test"
import { checkApp, checkRepository, flattenCatalog, scanSource } from "./check-i18n-catalog.mjs"

const run = ({ en, vi = en, files }) =>
    checkApp({
        appName: "fixture",
        catalogs: { en, vi },
        sources: Object.entries(files).map(([name, text]) => scanSource(name, text)),
    })
const codes = (findings) => findings.map((finding) => finding.code)

test("flattenCatalog lists every leaf path", () => {
    assert.deepEqual(flattenCatalog({ a: { b: "x", c: { d: "y" } }, e: "z" }), ["a.b", "a.c.d", "e"])
})

test("a used key in parity is clean", () => {
    const findings = run({
        en: { home: { title: "Title" } },
        files: {
            "a.tsx":
                'import { useTranslations } from "next-intl"\nexport const A = () => { const t = useTranslations("home"); return <h1>{t("title")}</h1> }',
        },
    })
    assert.deepEqual(findings, [])
})

test("a key present in one language only is drift", () => {
    const findings = run({
        en: { a: "x" },
        vi: { a: "x", b: "y" },
        files: { "a.ts": 'const t = useTranslations(""); t("a"); t("b")' },
    })
    assert.ok(codes(findings).includes("I18N_PARITY"))
})

test("a key the catalog does not hold fails, whichever way it is spelled", () => {
    const literal = run({
        en: { home: { title: "T" } },
        files: { "a.ts": 'const t = useTranslations("home"); t("title"); t("missing")' },
    })
    assert.ok(codes(literal).includes("I18N_MISSING_KEY"))
    const computed = run({
        en: { home: { steps: { a: "A" } } },
        files: { "a.ts": 'const t = useTranslations("home"); t(`steps.${id}`); t(`nothing.${id}`)' },
    })
    assert.equal(codes(computed).filter((code) => code === "I18N_MISSING_KEY").length, 1)
})

test("a computed key reads only the leaves it can match", () => {
    const findings = run({
        en: { home: { steps: { a: { label: "A" }, b: { label: "B" } }, other: "O" } },
        files: { "a.ts": 'const t = useTranslations("home"); t(`steps.${id}.label`)' },
    })
    assert.deepEqual(
        findings.map((finding) => finding.message),
        ['fixture: key "home.other" is never read'],
    )
})

test("a template namespace matches leaves for each dynamic page", () => {
    const findings = run({
        en: {
            product: {
                pricing: { metadata: { title: "Pricing", description: "Pricing details" } },
                applications: { metadata: { title: "Applications", description: "Applications details" } },
            },
        },
        files: {
            "a.ts":
                'const t = getTranslations({ namespace: `${page}.metadata` }); t("title"); t("description")',
        },
    })
    assert.deepEqual(findings, [])
})

test("a shared package translator uses the namespace passed by its app component", () => {
    const root = mkdtempSync(join(tmpdir(), "i18n-package-consumer-"))
    const appSource = join(root, "apps", "landing", "src")
    const appMessages = join(appSource, "messages")
    const packageSource = join(root, "packages", "nivo-ui", "src")
    const catalog = {
        site: {
            theme: {
                label: "Theme",
                options: { system: "System", light: "Light", dark: "Dark" },
            },
        },
    }

    try {
        mkdirSync(appMessages, { recursive: true })
        mkdirSync(packageSource, { recursive: true })
        writeFileSync(join(root, "packages", "nivo-ui", "package.json"), JSON.stringify({ name: "@nivo/ui" }))
        writeFileSync(join(appMessages, "en.json"), JSON.stringify(catalog))
        writeFileSync(join(appMessages, "vi.json"), JSON.stringify(catalog))
        writeFileSync(
            join(appSource, "header.tsx"),
            'import { ThemeToggle as ThemeControl } from "@nivo/ui"\n' +
                'export const Header = () => <ThemeControl namespace="site.theme" />\n',
        )
        writeFileSync(
            join(packageSource, "ThemeToggle.tsx"),
            'import { useTranslations } from "next-intl"\n' +
                'export const ThemeToggle = ({ namespace }: { readonly namespace: string }) => {\n' +
                '    const t = useTranslations(namespace)\n' +
                '    return <button>{t("label")}{t(`options.${mode}`)}</button>\n' +
                '}\n',
        )

        assert.deepEqual(checkRepository(root), [])
    } finally {
        rmSync(root, { recursive: true, force: true })
    }
})

test("a leaf nothing reads is dead", () => {
    const findings = run({
        en: { home: { title: "T", unused: "U" } },
        files: { "a.ts": 'const t = useTranslations("home"); t("title")' },
    })
    assert.deepEqual(codes(findings), ["I18N_UNUSED_KEY"])
})

test("copy in a source file fails, in any language, with no marker to excuse it", () => {
    const findings = run({
        en: { a: "x" },
        files: {
            "a.tsx":
                'const t = useTranslations(""); t("a"); export const A = () => <p aria-label="Close menu">Hello there</p>',
            "b.ts": '// vn-ok: reason\nexport const S = "Đã huỷ"',
        },
    })
    assert.equal(codes(findings).filter((code) => code === "I18N_LITERAL_COPY").length, 3)
})
