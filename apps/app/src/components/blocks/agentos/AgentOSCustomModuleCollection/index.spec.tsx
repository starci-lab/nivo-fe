import { describe, expect, it } from "vitest"
import { meta } from "./"

describe("AgentOSCustomModuleCollection connected owner", () => {
    it("keeps the approved connected block boundary", () => {
        expect(meta).toEqual({ shape: "block", world: "connected" })
    })
})
