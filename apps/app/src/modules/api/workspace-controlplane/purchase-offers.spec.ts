import { afterEach, describe, expect, it, vi } from "vitest"
import { listWorkspacePurchaseOffers } from "./index"
import { envelope, requestBody } from "./spec-helpers"
describe("listWorkspacePurchaseOffers", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("lists the current offers through the catalog capability", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(
            envelope("catalogItems", [
                {
                    id: "item-1",
                    slug: "agentos-workspace",
                    name: "AgentOS Workspace",
                    tagline: null,
                    templateKey: "agentos",
                    tiers: [],
                },
            ]),
        )
        vi.stubGlobal("fetch", fetchMock)

        const result = await listWorkspacePurchaseOffers("ai_agent")

        expect(result).toEqual({
            ok: true,
            data: [
                {
                    id: "item-1",
                    slug: "agentos-workspace",
                    name: "AgentOS Workspace",
                    tagline: null,
                    templateKey: "agentos",
                    tiers: [],
                },
            ],
        })
        const body = requestBody(fetchMock, 0)
        expect(body.query).toContain("catalogItems(request: $request)")
        expect(body.variables).toEqual({ request: { category: "ai_agent" } })
    })
})
