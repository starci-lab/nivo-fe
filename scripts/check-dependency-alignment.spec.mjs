import assert from "node:assert/strict"
import test from "node:test"
import { findDrift } from "./check-dependency-alignment.mjs"

const manifest = (path, manifestBody) => ({ path, manifest: manifestBody })

test("passes when every dependency has one spec and workspace links are ignored", () => {
    const manifests = [
        manifest("package.json", { devDependencies: { typescript: "^5" }, overrides: { "@starci/grammar": "0.7.0" } }),
        manifest("apps/a/package.json", {
            dependencies: { "@starci/grammar": "0.7.0", "@nivo/ui": "*" },
            devDependencies: { typescript: "^5" },
        }),
        manifest("apps/b/package.json", { dependencies: { "@starci/grammar": "0.7.0", "@nivo/ui": "*" } }),
    ]
    assert.deepEqual(findDrift(manifests), [])
})

test("reports a dependency declared with two specs", () => {
    const manifests = [
        manifest("package.json", {}),
        manifest("apps/a/package.json", { dependencies: { "@starci/grammar": "0.7.0" } }),
        manifest("apps/b/package.json", { dependencies: { "@starci/grammar": "0.4.11" } }),
    ]
    const findings = findDrift(manifests)
    assert.equal(findings.length, 1)
    assert.match(findings[0], /@starci\/grammar has 2 specs/u)
})

test("reports a spec that disagrees with the root override pin", () => {
    const manifests = [
        manifest("package.json", { overrides: { "@heroui/react": "3.2.6" } }),
        manifest("apps/a/package.json", { dependencies: { "@heroui/react": "^3.2.6" } }),
    ]
    assert.match(findDrift(manifests)[0], /pinned to 3\.2\.6 by root overrides/u)
})
