import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { StatRow } from "./"

describe("StatRow", () => {
    it("keeps its label while loading the optional value", () => {
        render(<StatRow props={{ icon: "streak", label: "Streak", value: "12 days" }} isLoading />)
        expect(screen.getByText("Streak")).toBeInTheDocument()
        expect(screen.queryByText("12 days")).not.toBeInTheDocument()
        expect(document.querySelectorAll("[data-loading='true']").length).toBeGreaterThan(0)
    })
})