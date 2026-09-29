import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { NivoIcon } from "."

describe("NivoIcon", () => {
    it("resolves a name to a glyph without ever taking a component prop", () => {
        render(<NivoIcon props={{ name: "brand", usage: "heading" }} />)
        const glyph = document.querySelector("svg[data-usage='heading']")
        expect(glyph).not.toBeNull()
        expect(screen.queryByRole("img")).not.toBeInTheDocument()
    })

    it("carries the meaningful glyph's label through to the resolved svg", () => {
        render(<NivoIcon props={{ name: "streak", ariaLabel: "Streak" }} />)
        expect(document.querySelector("svg[aria-label='Streak']")).not.toBeNull()
    })
})
