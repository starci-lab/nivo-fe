import { describe, expect, it } from "vitest"
import { meta } from "./"

describe("AgentOSModuleCollectionPage connected owner", () => {
    it("keeps the approved connected page boundary", () => {
        expect(meta).toEqual({ shape: "page", world: "connected" })
    })
})
