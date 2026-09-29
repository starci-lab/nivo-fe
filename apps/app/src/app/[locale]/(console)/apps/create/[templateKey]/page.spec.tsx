import { describe, expect, it } from "vitest"
import TemplateAppCreateRoute from "./page"

describe("TemplateAppCreateRoute", () => {
    it("keeps the canonical template route and both localized legacy redirects", async () => {
        await expect(
            TemplateAppCreateRoute({
                params: Promise.resolve({
                    templateKey: "academy starter",
                }),
            }),
        ).resolves.toEqual(
            expect.objectContaining({
                props: expect.objectContaining({
                    mode: "new",
                    templateKey: "academy starter",
                }),
            }),
        )
    })
})
