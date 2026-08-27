import { readdirSync, readFileSync } from "node:fs"
import { extname, join, relative, resolve } from "node:path"
import { pathToFileURL } from "node:url"
import ts from "typescript"

const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"])
const IGNORED_DIRECTORIES = new Set([".next", ".turbo", "coverage", "dist", "node_modules", "out"])

const normalizePath = (value) => String(value).replaceAll("\\", "/")
const isTestFile = (filePath) => /\.(?:spec|test)\.[cm]?[jt]sx?$/u.test(normalizePath(filePath))
const isComponentFile = (filePath) => normalizePath(filePath).includes("/src/components/")
const isApiTransportFile = (filePath) => normalizePath(filePath).includes("/src/modules/api/")
const isTransportSource = (value) => /(?:^|\/)modules\/api(?:\/|$)/u.test(String(value))

const scriptKindFor = (filePath) => {
    const extension = extname(filePath)
    if (extension === ".tsx") return ts.ScriptKind.TSX
    if (extension === ".jsx") return ts.ScriptKind.JSX
    if (extension === ".ts") return ts.ScriptKind.TS
    return ts.ScriptKind.JS
}

const locationOf = (sourceFile, node) => {
    const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
    return { line: position.line + 1, column: position.character + 1 }
}

const finding = (sourceFile, filePath, node, code, message) => ({
    filePath: normalizePath(filePath),
    ...locationOf(sourceFile, node),
    code,
    message,
})

const isRawFetchCall = (node) => {
    if (!ts.isCallExpression(node)) return false
    if (ts.isIdentifier(node.expression)) return node.expression.text === "fetch"
    if (!ts.isPropertyAccessExpression(node.expression)) return false
    const owner = node.expression.expression
    return node.expression.name.text === "fetch"
        && ts.isIdentifier(owner)
        && (owner.text === "globalThis" || owner.text === "window")
}

const runtimeImportBindings = (sourceFile) => {
    const bindings = new Set()
    const declarations = []
    const effectBindings = new Set()
    const reactNamespaces = new Set()

    for (const statement of sourceFile.statements) {
        if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue
        const source = statement.moduleSpecifier.text
        const clause = statement.importClause
        if (source === "react" && clause?.namedBindings) {
            if (ts.isNamespaceImport(clause.namedBindings)) reactNamespaces.add(clause.namedBindings.name.text)
            if (ts.isNamedImports(clause.namedBindings)) {
                for (const specifier of clause.namedBindings.elements) {
                    if ((specifier.propertyName?.text ?? specifier.name.text) === "useEffect") {
                        effectBindings.add(specifier.name.text)
                    }
                }
            }
        }
        if (!isTransportSource(source) || !clause || clause.isTypeOnly) continue

        const names = []
        if (clause.name) names.push(clause.name.text)
        if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
            names.push(clause.namedBindings.name.text)
        }
        if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
            for (const specifier of clause.namedBindings.elements) {
                if (!specifier.isTypeOnly) names.push(specifier.name.text)
            }
        }
        if (names.length === 0) continue
        names.forEach((name) => bindings.add(name))
        declarations.push({ node: statement, source, names })
    }
    return { bindings, declarations, effectBindings, reactNamespaces }
}

const isEffectCall = (node, imports) => {
    if (!ts.isCallExpression(node)) return false
    if (ts.isIdentifier(node.expression)) return imports.effectBindings.has(node.expression.text)
    if (!ts.isPropertyAccessExpression(node.expression) || node.expression.name.text !== "useEffect") return false
    return ts.isIdentifier(node.expression.expression)
        && imports.reactNamespaces.has(node.expression.expression.text)
}

const localFunctions = (sourceFile) => {
    const functions = new Map()
    const visit = (node) => {
        if (ts.isFunctionDeclaration(node) && node.name) functions.set(node.name.text, node)
        if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)
            && node.initializer && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) {
            functions.set(node.name.text, node.initializer)
        }
        ts.forEachChild(node, visit)
    }
    visit(sourceFile)
    return functions
}

const networkCallIn = (root, transportBindings, functions, visitedFunctions = new Set()) => {
    let match = null
    const visit = (node) => {
        if (match) return
        if (isRawFetchCall(node)) {
            match = { node, description: "fetch" }
            return
        }
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
            const name = node.expression.text
            if (transportBindings.has(name)) {
                match = { node, description: name }
                return
            }
            const local = functions.get(name)
            if (local && !visitedFunctions.has(name)) {
                visitedFunctions.add(name)
                match = networkCallIn(local, transportBindings, functions, visitedFunctions)
                if (match) return
            }
        }
        if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
            && ts.isIdentifier(node.expression.expression)
            && transportBindings.has(node.expression.expression.text)) {
            match = { node, description: node.expression.getText() }
            return
        }
        ts.forEachChild(node, visit)
    }
    visit(root)
    return match
}

/** Analyze one source file without reading the repository. Exported for deterministic rule tests. */
export const analyzeSource = (sourceText, filePath) => {
    if (isTestFile(filePath)) return []
    const sourceFile = ts.createSourceFile(
        filePath,
        sourceText,
        ts.ScriptTarget.Latest,
        true,
        scriptKindFor(filePath),
    )
    const findings = []
    const component = isComponentFile(filePath)
    const transport = isApiTransportFile(filePath)
    const imports = runtimeImportBindings(sourceFile)
    const functions = localFunctions(sourceFile)

    if (component) {
        for (const declaration of imports.declarations) {
            findings.push(finding(
                sourceFile,
                filePath,
                declaration.node,
                "component-runtime-transport-import",
                `Component source imports runtime transport ${declaration.names.join(", ")} from ${declaration.source}; expose a named hook instead.`,
            ))
        }
    }

    const visit = (node) => {
        if (!transport && isRawFetchCall(node)) {
            findings.push(finding(
                sourceFile,
                filePath,
                node,
                "fetch-outside-api-transport",
                "Raw fetch belongs under src/modules/api so credentials, locale, refusal and tracing stay in one transport boundary.",
            ))
        }
        if (component && isEffectCall(node, imports)) {
            const callback = node.arguments[0]
            if (callback && (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))) {
                const network = networkCallIn(callback, imports.bindings, functions)
                if (network) {
                    findings.push(finding(
                        sourceFile,
                        filePath,
                        network.node,
                        "network-request-in-component-effect",
                        `Component useEffect performs network work through ${network.description}; query/mutation hooks own request lifecycle while effects remain for external synchronization.`,
                    ))
                }
            }
        }
        ts.forEachChild(node, visit)
    }
    visit(sourceFile)
    return findings
}

const productionFiles = (repositoryRoot) => {
    const files = []
    const walk = (directory) => {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
            if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) continue
            const fullPath = join(directory, entry.name)
            if (entry.isDirectory()) {
                walk(fullPath)
                continue
            }
            if (!SOURCE_EXTENSIONS.has(extname(entry.name))) continue
            const normalized = normalizePath(fullPath)
            if (!normalized.includes("/src/") || isTestFile(normalized)) continue
            files.push(fullPath)
        }
    }
    for (const rootName of ["apps", "packages"]) {
        const root = join(repositoryRoot, rootName)
        try {
            walk(root)
        } catch (error) {
            if (error?.code !== "ENOENT") throw error
        }
    }
    return files.sort()
}

/** Scan the repository's production source and return stable, relative diagnostics. */
export const scanRepository = (repositoryRoot) => {
    const root = resolve(repositoryRoot)
    const files = productionFiles(root)
    const findings = files.flatMap((filePath) => analyzeSource(
        readFileSync(filePath, "utf8"),
        `/${normalizePath(relative(root, filePath))}`,
    ))
    return { files: files.length, findings }
}

const run = () => {
    const root = resolve(process.argv[2] ?? process.cwd())
    const result = scanRepository(root)
    if (result.findings.length === 0) {
        console.log(`FE architecture boundaries passed (${result.files} production files).`)
        return
    }
    console.error(`FE architecture boundaries failed with ${result.findings.length} finding(s):`)
    for (const item of result.findings) {
        console.error(`${item.filePath}:${item.line}:${item.column} [${item.code}] ${item.message}`)
    }
    process.exitCode = 1
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) run()
