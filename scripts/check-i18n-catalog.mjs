import { existsSync, readdirSync, readFileSync } from "node:fs"
import { extname, join, relative, resolve } from "node:path"
import { pathToFileURL } from "node:url"
import ts from "typescript"

/*
 * THE MESSAGE CATALOG GATE.
 *
 * Every app that ships `src/messages/{en,vi}.json` is held to four laws:
 *
 *   1. PARITY - en and vi hold exactly the same keys.
 *   2. EXISTENCE - every key a translator call names literally (`t("a.b")` under
 *      `useTranslations("ns")`) is a leaf in both catalogs. A computed key
 *      (`t(`status.${x}`)`) must match at least one leaf.
 *   3. NO DEAD KEYS - every leaf is reached by some call, some computed pattern, or some string
 *      literal that spells its path. A key nothing reads is copy nobody can find a reason to keep.
 *   4. NO COPY OUTSIDE THE CATALOGS - no source file carries a Vietnamese-only letter in a string,
 *      template or JSX text, and no JSX text or copy attribute (aria-label, title, alt, placeholder,
 *      label) is a literal sentence in any language. There is no suppression marker; the copy moves
 *      to the catalog.
 *
 * Specs render through the same catalogs (vitest.setup.ts) and throw on a missing key, so law 2 is
 * enforced twice: statically here, and at runtime in every rendered spec.
 */

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"])
const IGNORED_DIRECTORIES = new Set([".next", ".turbo", "coverage", "dist", "messages", "node_modules", "out"])
const TRANSLATOR_FACTORIES = new Set(["useTranslations", "getTranslations"])
const TRANSLATOR_MEMBERS = new Set(["rich", "markup", "raw", "has"])
/** The letters only the second language uses; the same set the retired lint pragma guarded. */
const SECOND_LANGUAGE_LETTER = /[À-ÃÈ-ÊÌÍÒ-ÕÙÚÝà-ãè-êìíò-õùúýĂăĐđĨĩŨũƠơƯưẠ-ỿ]/u
const LOCALES = ["en", "vi"]
/** JSX attributes whose string value a reader sees or hears. */
const COPY_ATTRIBUTES = new Set(["aria-label", "aria-description", "aria-placeholder", "title", "alt", "placeholder", "label"])
const HAS_WORD = /\p{L}{2,}/u

const normalizePath = (value) => String(value).replaceAll("\\", "/")
const isTestFile = (filePath) => /\.(?:spec|test)\.[cm]?[jt]sx?$/u.test(normalizePath(filePath))

const walk = (directory) => {
    const files = []
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!IGNORED_DIRECTORIES.has(entry.name)) files.push(...walk(join(directory, entry.name)))
        } else if (SOURCE_EXTENSIONS.has(extname(entry.name)) && !entry.name.endsWith(".d.ts")) {
            files.push(join(directory, entry.name))
        }
    }
    return files
}

/** Every leaf path of a catalog. A leaf is any value that is not a plain object. */
export const flattenCatalog = (node, prefix = "") => {
    const leaves = []
    for (const [key, value] of Object.entries(node)) {
        const path = prefix === "" ? key : `${prefix}.${key}`
        if (value !== null && typeof value === "object" && !Array.isArray(value)) leaves.push(...flattenCatalog(value, path))
        else leaves.push(path)
    }
    return leaves
}

const segmentsOf = (path) => path.split(".")

/** Does a computed key pattern (segments, `*` for a hole) match a full leaf path? */
const patternMatches = (pattern, leaf) => {
    const parts = segmentsOf(leaf)
    if (pattern.length !== parts.length) return false
    return pattern.every((segment, index) => segment === "*" || segment === parts[index])
}

/** The key text a call argument spells: a literal, or a template with `*` for every hole. */
const keyPatternOf = (argument) => {
    if (ts.isStringLiteralLike(argument)) return { text: argument.text, computed: false }
    if (ts.isTemplateExpression(argument)) {
        const spans = argument.templateSpans.map((span) => span.literal.text)
        return { text: [argument.head.text, ...spans].join("\u0000").split("\u0000").join("*"), computed: true }
    }
    return undefined
}

/** A conditional argument (`t(a ? "x" : "y")`) names every branch. */
const keyArgumentsOf = (argument) => {
    if (ts.isConditionalExpression(argument)) return [...keyArgumentsOf(argument.whenTrue), ...keyArgumentsOf(argument.whenFalse)]
    if (ts.isParenthesizedExpression(argument)) return keyArgumentsOf(argument.expression)
    if (ts.isAsExpression(argument) || ts.isSatisfiesExpression(argument)) return keyArgumentsOf(argument.expression)
    return [argument]
}

const namespaceOfFactoryCall = (call) => {
    const [first] = call.arguments
    if (first === undefined) return ""
    if (ts.isStringLiteralLike(first)) return first.text
    if (ts.isObjectLiteralExpression(first)) {
        for (const property of first.properties) {
            if (ts.isPropertyAssignment(property) && property.name.getText() === "namespace" && ts.isStringLiteralLike(property.initializer)) return property.initializer.text
        }
        return ""
    }
    return undefined
}

const unwrapAwait = (node) => (node !== undefined && ts.isAwaitExpression(node) ? node.expression : node)

/** Read one source file: translator bindings, key calls, and every string literal that could spell a key. */
export const scanSource = (filePath, sourceText) => {
    const extension = extname(filePath)
    const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, extension === ".tsx" ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
    const bindings = new Map()
    const namespaces = new Set()
    const literals = new Set()
    const calls = []
    const secondLanguage = []

    const record = (name, namespace) => {
        bindings.set(name, namespace)
        namespaces.add(namespace)
    }

    const collectBindings = (node) => {
        if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
            const initializer = unwrapAwait(node.initializer)
            if (initializer !== undefined && ts.isCallExpression(initializer) && ts.isIdentifier(initializer.expression) && TRANSLATOR_FACTORIES.has(initializer.expression.text)) {
                const namespace = namespaceOfFactoryCall(initializer)
                if (namespace !== undefined) record(node.name.text, namespace)
            }
        }
        ts.forEachChild(node, collectBindings)
    }
    collectBindings(sourceFile)

    const translatorOf = (expression) => {
        if (ts.isIdentifier(expression)) return { name: expression.text, member: undefined }
        if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.expression) && TRANSLATOR_MEMBERS.has(expression.name.text)) return { name: expression.expression.text, member: expression.name.text }
        return undefined
    }

    const visit = (node) => {
        if (ts.isStringLiteralLike(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
            literals.add(node.text)
            if (SECOND_LANGUAGE_LETTER.test(node.text)) secondLanguage.push(sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1)
        }
        if (ts.isTemplateExpression(node)) {
            const pattern = keyPatternOf(node)
            if (pattern !== undefined) literals.add(pattern.text)
            for (const text of [node.head.text, ...node.templateSpans.map((span) => span.literal.text)]) {
                if (SECOND_LANGUAGE_LETTER.test(text)) secondLanguage.push(sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1)
            }
        }
        if (ts.isJsxText(node) && HAS_WORD.test(node.text)) secondLanguage.push(sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1)
        if (ts.isJsxAttribute(node) && COPY_ATTRIBUTES.has(node.name.getText()) && node.initializer !== undefined && ts.isStringLiteral(node.initializer) && HAS_WORD.test(node.initializer.text)) secondLanguage.push(sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1)
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "pageMetadata") {
            // The page metadata helper reads `<page>.metadata.title` and `.description` itself.
            const [argument] = node.arguments
            const pageProperty = argument !== undefined && ts.isObjectLiteralExpression(argument)
                ? argument.properties.find((property) => ts.isPropertyAssignment(property) && property.name.getText() === "page")
                : undefined
            if (pageProperty !== undefined && ts.isPropertyAssignment(pageProperty) && ts.isStringLiteralLike(pageProperty.initializer)) {
                for (const key of ["title", "description"]) calls.push({ namespace: `${pageProperty.initializer.text}.metadata`, text: key, computed: false, member: undefined, line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1 })
            }
        }
        if (ts.isCallExpression(node)) {
            const translator = translatorOf(node.expression)
            const [first] = node.arguments
            if (translator !== undefined && first !== undefined && (bindings.has(translator.name) || translator.name === "t")) {
                const namespace = bindings.get(translator.name)
                for (const argument of keyArgumentsOf(first)) {
                    const pattern = keyPatternOf(argument)
                    if (pattern === undefined) continue
                    calls.push({ namespace, text: pattern.text, computed: pattern.computed, member: translator.member, line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1 })
                }
            }
        }
        ts.forEachChild(node, visit)
    }
    visit(sourceFile)

    return { filePath: normalizePath(filePath), namespaces, literals, calls, secondLanguage }
}

const withNamespace = (namespace, text) => (namespace === undefined || namespace === "" ? text : `${namespace}.${text}`)

/** Check one app: catalogs against source. Returns a list of `{ code, message }` findings. */
export const checkApp = ({ appName, catalogs, sources }) => {
    const findings = []
    const problem = (code, message) => findings.push({ code, message: `${appName}: ${message}` })
    const leaves = Object.fromEntries(LOCALES.map((locale) => [locale, new Set(flattenCatalog(catalogs[locale]))]))

    for (const locale of LOCALES) {
        const other = LOCALES.find((candidate) => candidate !== locale)
        for (const key of leaves[locale]) if (!leaves[other].has(key)) problem("I18N_PARITY", `key "${key}" is in ${locale} but not in ${other}`)
    }

    const used = new Set()
    const allLeaves = [...leaves.en]
    const markPattern = (text) => {
        const pattern = segmentsOf(text)
        let matched = 0
        for (const leaf of allLeaves) {
            if (patternMatches(pattern, leaf)) {
                used.add(leaf)
                matched += 1
            }
        }
        return matched
    }

    for (const source of sources) {
        for (const call of source.calls) {
            const full = withNamespace(call.namespace, call.text)
            if (call.member === "has") {
                if (call.computed) markPattern(full)
                else if (allLeaves.some((leaf) => leaf === full || leaf.startsWith(`${full}.`))) markPattern(full)
                continue
            }
            if (call.namespace === undefined) {
                // A translator handed in as a parameter: its namespace is the caller's, so the key must exist under some namespace.
                const tail = segmentsOf(call.text)
                const matches = allLeaves.filter((leaf) => {
                    const parts = segmentsOf(leaf)
                    return tail.every((segment, index) => segment === "*" || segment === parts[parts.length - tail.length + index]) && parts.length >= tail.length
                })
                if (matches.length === 0) problem("I18N_MISSING_KEY", `${source.filePath}:${call.line} asks for "${call.text}" and no catalog leaf ends with it`)
                for (const match of matches) used.add(match)
                continue
            }
            if (call.member === "raw" && !call.computed && allLeaves.some((leaf) => leaf.startsWith(`${full}.`))) {
                markPattern(`${full}.*`)
                continue
            }
            if (markPattern(full) === 0) problem("I18N_MISSING_KEY", `${source.filePath}:${call.line} asks for "${full}" and the catalog holds no such key`)
            for (const locale of LOCALES) {
                if (!call.computed && !leaves[locale].has(full) && !allLeaves.some((leaf) => leaf.startsWith(`${full}.`))) problem("I18N_MISSING_KEY", `${source.filePath}:${call.line} asks for "${full}" and ${locale} holds no such key`)
            }
        }
        // A key spelled as a plain string (a helper that returns "refusal.no_access") is a use.
        for (const literal of source.literals) {
            for (const leaf of allLeaves) {
                if (used.has(leaf)) continue
                if (leaf === literal) used.add(leaf)
                else if (literal.includes(".") || literal.includes("*")) {
                    if (leaf.endsWith(`.${literal}`) || patternMatches(segmentsOf(literal), leaf)) used.add(leaf)
                    else if (source.namespaces.size > 0 && [...source.namespaces].some((namespace) => namespace !== "" && withNamespace(namespace, literal) === leaf)) used.add(leaf)
                } else if ([...source.namespaces].some((namespace) => withNamespace(namespace, literal) === leaf)) {
                    used.add(leaf)
                }
            }
        }
        for (const line of source.secondLanguage) problem("I18N_LITERAL_COPY", `${source.filePath}:${line} carries literal copy in source; move it to the catalogs`)
    }

    for (const leaf of allLeaves) if (!used.has(leaf)) problem("I18N_UNUSED_KEY", `key "${leaf}" is never read`)
    return findings
}

const readJson = (filePath) => JSON.parse(readFileSync(filePath, "utf8"))

/** Check every app under a repository root. */
export const checkRepository = (root) => {
    const findings = []
    const appsRoot = join(root, "apps")
    for (const entry of readdirSync(appsRoot, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue
        const appDirectory = join(appsRoot, entry.name)
        const messagesDirectory = join(appDirectory, "src", "messages")
        const catalogFiles = LOCALES.map((locale) => join(messagesDirectory, `${locale}.json`))
        if (!existsSync(join(appDirectory, "src"))) continue
        if (!catalogFiles.every((file) => existsSync(file))) {
            findings.push({ code: "I18N_NO_CATALOG", message: `${entry.name}: src/messages/en.json and vi.json are both required` })
            continue
        }
        const catalogs = Object.fromEntries(LOCALES.map((locale, index) => [locale, readJson(catalogFiles[index])]))
        const sources = walk(join(appDirectory, "src"))
            .filter((file) => !isTestFile(file))
            .map((file) => scanSource(relative(root, file), readFileSync(file, "utf8")))
        findings.push(...checkApp({ appName: entry.name, catalogs, sources }))
    }
    return findings
}

const main = () => {
    const root = resolve(process.argv[2] ?? process.cwd())
    const findings = checkRepository(root)
    for (const finding of findings) console.error(`${finding.code} ${finding.message}`)
    if (findings.length > 0) {
        console.error(`check-i18n-catalog: ${findings.length} finding(s)`)
        process.exit(1)
    }
    console.log("check-i18n-catalog: every catalog is in parity, every key is read, no source carries copy")
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main()
