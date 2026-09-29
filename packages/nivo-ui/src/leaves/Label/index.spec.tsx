import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Label } from "./"

describe("Label", () => {
    it("associates labels and optional icons with controls", () => {
        render(
            <>
                <Label props={{ htmlFor: "email", content: "Email", icon: "email" }} />
                <input id="email" />
            </>,
        )
        expect(screen.getByRole("textbox", { name: "Email" })).toBeInTheDocument()
        expect(screen.getByText("Email").closest("label")).toHaveAttribute("for", "email")
        expect(document.querySelector("label svg")).toBeInTheDocument()
    })
})
