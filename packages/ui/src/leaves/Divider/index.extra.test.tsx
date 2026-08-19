import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Divider } from "./"

describe("Divider extra semantics", () => {
    it("labels the separator and keeps both rules decorative", () => {
        render(<Divider props={{ label: "OR" }} />)
        expect(screen.getByRole("separator", { name: "OR" })).toHaveAttribute("data-tier", "leaf")
        expect(document.querySelectorAll("[aria-hidden='true']")).toHaveLength(2)
    })
})
