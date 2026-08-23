import { describe, expect, it } from "vitest"
import { meta } from "./"

describe("AgentOSModuleCreatePage connected owner", () => {
    it("keeps the approved connected page boundary", () => {
        expect(meta).toEqual({ shape: "page", world: "connected" })
    })
})
