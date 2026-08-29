import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Input } from "./"

describe("Input", () => {
    it("maps a password kind to password-manager semantics", () => {
        render(<Input props={{ id: "password", name: "password", kind: "password", revealLabel: "Show password", hideLabel: "Hide password" }} />)
        const input = document.querySelector("input") as HTMLInputElement
        expect(input).toHaveAttribute("type", "password")
        expect(input).toHaveAttribute("autocomplete", "current-password")
        expect(screen.getByRole("button", { name: "Show password" })).toBeInTheDocument()
    })

    it("reveals a secret and reports changes", async () => {
        const change = vi.fn()
        render(<Input props={{ id: "password", name: "password", kind: "newPassword", revealLabel: "Show", hideLabel: "Hide" }} on={{ change }} />)
        const input = document.querySelector("input") as HTMLInputElement
        fireEvent.change(input, { target: { value: "secret" } })
        fireEvent.click(screen.getByRole("button", { name: "Show" }))
        expect(change).toHaveBeenCalledWith("secret")
        expect(input).toHaveAttribute("type", "text")
        expect(screen.getByRole("button", { name: "Hide" })).toBeInTheDocument()
    })

    it("disables the field while loading", () => {
        render(<Input props={{ id: "code", name: "code", kind: "code" }} isLoading />)
        expect(screen.getByRole("textbox")).toBeDisabled()
    })
})