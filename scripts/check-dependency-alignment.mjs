import { readdirSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

// Peer ranges state what a package tolerates, not what the workspace installs, so they are not compared.
const DEPENDENCY_FIELDS = ["dependencies", "devDependencies", "optionalDependencies"]
const WORKSPACE_SPECS = new Set(["*"])

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"))

/**
 * Collect every declared spec per package name across the root and each workspace manifest.
 *
 * @param manifests - Manifest objects tagged with the path they were read from.
 * @returns Map of dependency name to a map of spec to the manifests that declare it.
 */
export const collectSpecs = (manifests) => {
    const specs = new Map()
    for (const { path, manifest } of manifests) {
        for (const field of DEPENDENCY_FIELDS) {
            for (const [name, spec] of Object.entries(manifest[field] ?? {})) {
                if (WORKSPACE_SPECS.has(spec)) continue
                const bySpec = specs.get(name) ?? new Map()
                bySpec.set(spec, [...(bySpec.get(spec) ?? []), path])
                specs.set(name, bySpec)
            }
        }
    }
    return specs
}

/**
 * One version per dependency across the monorepo: every name has exactly one spec, and a name the
 * root `overrides` pins carries that pin everywhere.
 *
 * @param manifests - Manifest objects tagged with the path they were read from.
 * @returns Human-readable drift findings; empty when the workspace is aligned.
 */
export const findDrift = (manifests) => {
    const findings = []
    const root = manifests[0]?.manifest ?? {}
    for (const [name, bySpec] of collectSpecs(manifests)) {
        if (bySpec.size > 1) {
            const detail = [...bySpec].map(([spec, paths]) => `${spec} (${paths.join(", ")})`).join(" vs ")
            findings.push(`${name} has ${bySpec.size} specs: ${detail}`)
        }
        const pinned = root.overrides?.[name]
        if (typeof pinned === "string" && !pinned.startsWith("$")) {
            for (const [spec, paths] of bySpec) {
                if (spec !== pinned)
                    findings.push(
                        `${name} is pinned to ${pinned} by root overrides but ${paths.join(", ")} declare ${spec}`,
                    )
            }
        }
    }
    return findings
}

/**
 * Read the root manifest and every workspace manifest its `workspaces` globs name.
 *
 * @param rootDirectory - Repository root.
 * @returns Manifests tagged with their repository-relative path, root first.
 */
export const readManifests = (rootDirectory) => {
    const rootManifest = readJson(join(rootDirectory, "package.json"))
    const manifests = [{ path: "package.json", manifest: rootManifest }]
    for (const pattern of rootManifest.workspaces ?? []) {
        const parent = pattern.replace(/\/\*$/u, "")
        for (const entry of readdirNames(join(rootDirectory, parent))) {
            const path = `${parent}/${entry}/package.json`
            try {
                manifests.push({ path, manifest: readJson(join(rootDirectory, path)) })
            } catch {
                // A folder without a manifest is not a workspace (an untracked leftover directory).
            }
        }
    }
    return manifests
}

const readdirNames = (directory) =>
    readdirSync(directory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const findings = findDrift(readManifests(resolve(dirname(fileURLToPath(import.meta.url)), "..")))
    if (findings.length > 0) {
        console.error(`Dependency drift:\n${findings.map((finding) => `  - ${finding}`).join("\n")}`)
        process.exit(1)
    }
    console.log("Dependency alignment passed: one version per dependency.")
}
