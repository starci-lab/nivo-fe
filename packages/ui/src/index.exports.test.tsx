import * as UI from "./index"
import { describe, expect, it } from "vitest"

describe("UI public exports", () => {
    it("publishes the leaf, composite, branch, and contract entry points", () => {
        expect(UI.Button).toBeTypeOf("function")
        expect(UI.Field).toBeTypeOf("function")
        expect(UI.SurfaceCard).toBeTypeOf("function")
        expect(UI.Tree).toBeTypeOf("function")
        expect(UI.defineContractComponent).toBeTypeOf("function")
    })
})
