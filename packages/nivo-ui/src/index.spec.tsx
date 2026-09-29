import * as UI from "./index"
import { describe, expect, it } from "vitest"

describe("index", () => {
    it("publishes the React component entry points", () => {
        expect(UI.IconSource).toBeTypeOf("function")
        expect(UI.TileIcon).toBeTypeOf("function")
        expect(UI.RouteTabs).toBeTypeOf("function")
        expect(UI.NivoUnicornArtwork).toBeTypeOf("function")
        expect(UI.ModalBranch).toBeTypeOf("function")
        expect(UI.DropdownBranch).toBeTypeOf("function")
    })
})
