import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import en from "@/messages/en.json"
import { CONTACT_INTENT_IDS, ContactPage, normalizeContactIntent } from "."

describe("ContactPage", () => {
    it("routes six Contact intents without collecting personal data", () => {
        render(<ContactPage />)
        expect(screen.getAllByRole("radio")).toHaveLength(6)
        expect(screen.getByRole("radiogroup", { name: en.contact.router.legend })).toBeInTheDocument()
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
        expect(screen.getByText(en.contact.result.emptyTitle)).toBeInTheDocument()
        fireEvent.click(screen.getByRole("radio", { name: /Partnership/i }))
        expect(screen.getByRole("radio", { name: /Partnership/i })).toBeChecked()
    })

    it("shows the expectation and direct paths of the resolved intent", () => {
        render(<ContactPage initialIntent="product" />)
        expect(screen.getByRole("radio", { name: /Product Assistance/i })).toBeChecked()
        expect(screen.getByText(en.contact.intents.product.expectation)).toBeInTheDocument()
        const paths = screen.getByRole("navigation", { name: "Product Assistance direct paths" })
        expect(paths).toHaveTextContent(en.contact.paths.nivoOs)
        expect(paths).toHaveTextContent(en.contact.paths.applications)
        expect(paths).toHaveTextContent(en.contact.paths.pricing)
    })

    it("accepts only the six stable intent ids from the query", () => {
        expect(CONTACT_INTENT_IDS.map((id) => normalizeContactIntent(id))).toEqual([...CONTACT_INTENT_IDS])
        expect(normalizeContactIntent(["media", "talent"])).toBe("media")
        expect(normalizeContactIntent("unknown")).toBeNull()
        expect(normalizeContactIntent(undefined)).toBeNull()
    })
})
