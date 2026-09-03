import assert from "node:assert/strict"
import {spawnSync} from "node:child_process"
import {mkdirSync, mkdtempSync, writeFileSync} from "node:fs"
import {tmpdir} from "node:os"
import {dirname, join} from "node:path"
import test from "node:test"
import {fileURLToPath} from "node:url"
import {assertPatchThresholds, buildPatchSummary, lineCounts, resolveBase} from "./write-patch-coverage.mjs"

const file = (name, statementMap, statements) => ({[name]: {statementMap, s: statements, f: {0: statements[0]}, b: {0: statements}}})

test("normalizes monorepo paths and measures every metric", () => {
    const report = file("C:/repo/apps/app/src/changed.ts", {
        0: {start: {line: 4}, end: {line: 4}},
        1: {start: {line: 8}, end: {line: 8}},
    }, [1, 0])
    const summary = buildPatchSummary(report, ["apps/app/src/changed.ts"], "C:/repo")
    assert.deepEqual(summary.total.lines, {total: 2, covered: 1, pct: 50})
    assert.deepEqual(lineCounts(report["C:/repo/apps/app/src/changed.ts"]), [1, 0])
})

test("fails missing changed production and ignores tests", () => {
    assert.throws(() => buildPatchSummary({}, ["packages/ui/src/missing.tsx"], "C:/repo"), /missing from coverage-final/)
    assert.equal(buildPatchSummary({}, ["apps/app/src/example.spec.tsx", "apps/app/vitest.config.ts"], "C:/repo").notApplicable, true)
})

test("skips deleted production files", () => {
    const report = file("C:/repo/apps/app/src/kept.ts", {0: {start: {line: 1}, end: {line: 1}}}, [1])
    const changed = ["apps/app/src/kept.ts", "apps/app/src/removed.tsx"]
    const summary = buildPatchSummary(report, changed, "C:/repo", ["apps/app/src/removed.tsx"])
    assert.deepEqual(summary.total.lines, {total: 1, covered: 1, pct: 100})
    assert.equal(buildPatchSummary({}, ["apps/app/src/removed.tsx"], "C:/repo", ["apps/app/src/removed.tsx"]).notApplicable, true)
})

test("requires an explicit base and executes on this platform", () => {
    assert.equal(resolveBase({}, ["node", "script"]), undefined)
    const cwd = mkdtempSync(join(tmpdir(), "nivo-patch-cli-"))
    mkdirSync(join(cwd, "coverage"))
    writeFileSync(join(cwd, "coverage", "coverage-final.json"), "{}")
    const script = join(dirname(fileURLToPath(import.meta.url)), "write-patch-coverage.mjs")
    const result = spawnSync(process.execPath, [script], {cwd, encoding: "utf8", env: {}})
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /COVERAGE_BASE_SHA/)
})

test("blocks every patch metric below ninety percent", () => {
    assert.throws(() => assertPatchThresholds({total: {
        statements: {pct: 100}, lines: {pct: 100}, functions: {pct: 89.99}, branches: {pct: 100},
    }}), /functions/)
    assert.doesNotThrow(() => assertPatchThresholds({total: {
        statements: {pct: 90}, lines: {pct: 90}, functions: {pct: 90}, branches: {pct: 90},
    }}))
})
