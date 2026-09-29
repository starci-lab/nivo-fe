import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ContactIntentForm } from "."

describe("ContactIntentForm", () => {
    it("exposes named intent choices and a grammar submit action", () => {
        render(
            <ContactIntentForm
                action="/contact#intent-router"
                legend="Choose a path"
                options={[
                    { id: "product", label: "Product assistance", description: "Understand NIVO OS." },
                    { id: "general", label: "General", description: "Other questions." },
                ]}
                submitLabel="Resolve next path"
            />,
        )

        const group = screen.getByRole("radiogroup", { name: "Choose a path" })
        expect(group).toBeInTheDocument()
        expect(screen.getAllByRole("radio")).toHaveLength(2)
        expect(screen.getByRole("button", { name: /Resolve next path/ })).toBeInTheDocument()
        fireEvent.click(screen.getByRole("radio", { name: /General/ }))
        expect(screen.getByRole("radio", { name: /General/ })).toBeChecked()
    })
})
