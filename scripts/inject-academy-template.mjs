#!/usr/bin/env node
/**
 * scripts/inject-academy-template.mjs -- mount one academy's template into the expert app.
 *
 *   npm run academy:inject                  from the default .stacks location
 *   npm run academy:inject -- --from <path> from a JSON file you already have
 *   npm run academy:inject -- --reset       back to the unprovisioned default
 *
 * WHAT PROVISIONING DOES, DONE BY HAND. Every academy runs as its own instance, and provisioning
 * writes that academy's appearance into the image before it is built -- `template.ts` says so, and
 * it is why the app needs no tenant lookup and cannot show an unstyled first paint. This script is
 * the developer-machine equivalent of that write: it replaces `template.data.json`, which is the
 * only file the app reads its appearance from.
 *
 * WHY IT READS FROM `.stacks` AND NOT FROM A BACKEND CALL. The template is a build-time input. A
 * fetch would need the API up before the front end could render, which is exactly the coupling an
 * instance-per-academy deployment exists to avoid.
 *
 * A COURSE IS NOT PART OF A TEMPLATE. The expert edits courses in their own database, so nothing
 * here carries one and `--reset` cannot destroy one. That separation is what makes re-applying a
 * template safe rather than a decision.
 *
 * THE SOURCE FILE IS ENCRYPTED AT REST. `.stacks/dev/runtime/config/academy-template.json.enc` is
 * the committed twin; the plaintext beside it is produced on demand by the backend repo's
 * `npm run secret:show -- dev/runtime/config/academy-template.json` and deleted when done. This
 * script never decrypts anything itself -- it has no business holding a master key -- so it asks
 * for that command rather than running it.
 */

import {
    copyFileSync, existsSync, readFileSync, writeFileSync,
} from "node:fs"
import {
    dirname, join, resolve,
} from "node:path"
import {
    fileURLToPath,
} from "node:url"

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const TARGET = join(REPO_ROOT, "apps/expert/src/academy/template.data.json")
const DEFAULT_SOURCE = resolve(
    REPO_ROOT,
    "../nivo-backend/.stacks/dev/runtime/config/academy-template.json",
)

/**
 * The unprovisioned default, rebuilt by `--reset` rather than kept as a second file on disk.
 *
 * `theme` is EMPTY, not a palette. An instance nobody has branded should look exactly as HeroUI
 * intends; restating the vendor's own colours here would be a second copy of them, and the copy is
 * the one that goes stale after a HeroUI release.
 */
const UNPROVISIONED = {
    identity: {
        // A bare value means "the same in every language"; a map is one the expert authored twice.
        name: { vi: "Học viện", en: "The Academy" },
        tagline: {
            vi: "Khoá học trực tuyến, dạy bởi người đã làm nghề.",
            en: "Online courses, taught by someone who has done the work.",
        },
    },
    theme: {},
    layout: {
        sections: [
            { key: "hero", visible: true },
            { key: "outcomes", visible: true },
            { key: "courses", visible: true },
            { key: "instructor", visible: true },
            { key: "faq", visible: true },
            { key: "lead", visible: true },
            { key: "problems", visible: false },
            { key: "roadmap", visible: false },
            { key: "stats", visible: false },
            { key: "testimonials", visible: false },
            { key: "gallery", visible: false },
            { key: "community", visible: false },
            { key: "offer", visible: false },
            { key: "magnet", visible: false },
        ],
    },
    content: {
        testimonials: [],
        stats: [],
        gallery: [],
        problems: [],
        roadmap: [],
        faq: [],
    },
}

/** Every section key this build can draw, kept in step with `SYSTEM_SECTION_KEYS`. */
const SYSTEM_SECTION_KEYS = new Set([
    "hero", "problems", "outcomes", "roadmap", "instructor", "stats",
    "testimonials", "gallery", "courses", "community", "offer", "faq",
    "magnet", "lead",
])

const die = (message, hints = []) => {
    console.error(`\nacademy:inject: ${message}`)
    for (const hint of hints) {
        console.error(`  ${hint}`)
    }
    console.error("")
    process.exit(1)
}

/**
 * Rejects a template the app would render as a broken page.
 *
 * Checked here rather than trusted, because the failure this catches is silent: `page.tsx` skips a
 * layout key it cannot draw -- correct, so an older build survives a newer catalog -- which means a
 * misspelled key produces a missing section and no error anywhere.
 *
 * @param template - the parsed template.
 * @returns A list of complaints; empty means it is fit to mount.
 */
const problemsWith = (template) => {
    const complaints = []
    for (const part of ["identity", "theme", "layout", "content"]) {
        if (template[part] === undefined) {
            complaints.push(`missing required part: ${part}`)
        }
    }
    if (template.identity && !template.identity.name) {
        complaints.push("identity.name is empty -- it is the document title and the header")
    }
    const sections = template.layout?.sections
    if (!Array.isArray(sections)) {
        complaints.push("layout.sections must be an array -- position in it IS render order")
    } else {
        for (const section of sections) {
            const known = SYSTEM_SECTION_KEYS.has(section.key)
                || String(section.key).startsWith("custom:")
            if (!known) {
                complaints.push(`layout key this build cannot draw: ${section.key}`)
            }
        }
    }
    // A theme entry that is not a custom property, or whose value could close the
    // declaration, is dropped silently at render time -- which is the same invisible
    // failure the unknown-key check above exists for. Name it here instead.
    for (const [scheme, variables] of Object.entries(template.theme ?? {})) {
        for (const [name, value] of Object.entries(variables ?? {})) {
            if (!/^--[a-z0-9-]+$/i.test(name)) {
                complaints.push(`theme.${scheme}: not a custom property name: ${name}`)
            } else if (typeof value !== "string" || /[;{}<>]/.test(value)
                || /url\s*\(|expression\s*\(|@import/i.test(value)) {
                complaints.push(`theme.${scheme}.${name}: value would escape the declaration`)
            }
        }
    }
    if (template.content?.courses !== undefined || template.courses !== undefined) {
        complaints.push("`courses` is not part of a template -- the expert owns those in the database")
    }
    return complaints
}

const argv = process.argv.slice(2)
if (argv.includes("--help") || argv.includes("-h")) {
    console.log(`
academy:inject -- mount one academy's template into the expert app.

  (no args)        read .stacks/dev/runtime/config/academy-template.json
  --from <path>    read a JSON file you already have
  --reset          restore the unprovisioned default
`)
    process.exit(0)
}

if (argv.includes("--reset")) {
    writeFileSync(TARGET, `${JSON.stringify(UNPROVISIONED, null, 2)}\n`)
    console.log("\nok  restored the unprovisioned default\n")
    process.exit(0)
}

const fromIndex = argv.indexOf("--from")
const source = fromIndex === -1 ? DEFAULT_SOURCE : resolve(argv[fromIndex + 1] ?? "")
if (fromIndex !== -1 && !argv[fromIndex + 1]) {
    die("--from needs a path")
}
if (!existsSync(source)) {
    die(`no template at ${source}`, [
        "the plaintext is produced on demand and deleted when done. From nivo-backend:",
        "  npm run secret:show -- dev/runtime/config/academy-template.json",
    ])
}

let parsed
try {
    parsed = JSON.parse(readFileSync(source, "utf8"))
} catch (error) {
    die(`${source} is not valid JSON: ${error.message}`)
}

const complaints = problemsWith(parsed)
if (complaints.length > 0) {
    die("this template would render a broken page", complaints)
}

copyFileSync(source, TARGET)
const sections = parsed.layout.sections
const visible = sections.filter((section) => section.visible).length
const overrides = Object.values(parsed.theme ?? {})
    .reduce((total, variables) => total + Object.keys(variables ?? {}).length, 0)
console.log(`\nok  mounted "${parsed.identity.name}"`)
console.log(`    ${visible} visible section(s) of ${sections.length}`)
console.log(`    ${overrides} HeroUI variable override(s) across ${Object.keys(parsed.theme ?? {}).length} scheme(s)`)
console.log(`    -> apps/expert/src/academy/template.data.json\n`)
