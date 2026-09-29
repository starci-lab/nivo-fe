import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ContactPage } from "./index"

describe("ContactPage", () => {
    it("routes six Contact intents without collecting personal data", () => {
        render(<ContactPage />)

        expect(screen.getAllByRole("radio")).toHaveLength(6)
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole("radio", { name: /Partnership/i }))
        expect(screen.getByRole("radio", { name: /Partnership/i })).toBeChecked()
    })

    it("resolves the requested intent and offers its direct paths", () => {
        render(<ContactPage initialIntent="media" />)

        expect(screen.getByRole("radio", { name: /Media/i })).toBeChecked()
        expect(screen.getByRole("navigation", { name: "Media direct paths" })).toBeInTheDocument()
    })
})
