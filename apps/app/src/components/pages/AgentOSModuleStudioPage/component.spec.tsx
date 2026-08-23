import { describe, expect, it } from "vitest"
import { meta } from "./component"

describe("AgentOSModuleStudioPage pure twin", () => {
    it("keeps the approved pure page boundary", () => {
        expect(meta).toEqual({ shape: "page", world: "pure" })
    })
})
