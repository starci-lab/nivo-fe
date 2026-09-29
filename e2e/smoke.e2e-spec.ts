import { expect, test } from "@playwright/test"
import { runSmoke } from "./support/smoke"

test("the built customer app serves a complete localized document", async () => {
    const result = await runSmoke()

    expect(result.status).toBe(200)
    expect(result.path).toBe("/en")
})
