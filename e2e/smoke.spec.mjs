import assert from "node:assert/strict"
import test from "node:test"
import {runSmoke} from "../scripts/e2e-smoke.mjs"

test("the built customer app serves a complete localized document", async () => {
    const result = await runSmoke()

    assert.equal(result.status, 200)
    assert.equal(result.path, "/en")
})
