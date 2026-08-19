import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Field } from "./Field"
import { LabelledProgressRow } from "./LabelledProgressRow"
import { LifecycleStep } from "./LifecycleStep"
import { TaskProgressRow } from "./TaskProgressRow"

describe("Field", () => {
    it("connects label, input, invalid hint, and change callback", () => {
        const change = vi.fn()
        render(<Field props={{ id: "email", name: "email", label: "Email", placeholder: "you@example.com", hint: "Invalid email", isInvalid: true }} on={{ change }} />)
        const input = screen.getByRole("textbox", { name: "Email" })
        expect(input).toHaveAttribute("aria-describedby", "email-hint")
        expect(screen.getByText("Invalid email")).toHaveAttribute("role", "alert")
        fireEvent.change(input, { target: { value: "a@b.com" } })
        expect(change).toHaveBeenCalledWith("a@b.com")
    })

    it("renders password reveal controls through the field", () => {
        render(<Field props={{ id: "password", name: "password", label: "Password", kind: "password", revealLabel: "Show", hideLabel: "Hide" }} />)
        expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password")
        expect(screen.getByRole("button", { name: "Show" })).toBeInTheDocument()
    })
})

describe("progress and lifecycle rows", () => {
    it("renders progress value and hides it while loading", () => {
        const { rerender } = render(<LabelledProgressRow props={{ id: "course", title: "Course", percent: 60, percentText: "60%" }} />)
        expect(screen.getByText("Course")).toBeInTheDocument()
        expect(screen.getByText("60%")).toBeInTheDocument()
        rerender(<LabelledProgressRow props={{ id: "course", title: "Course", percent: 60, percentText: "60%" }} isLoading />)
        expect(screen.queryByText("60%")).not.toBeInTheDocument()
    })

    it.each([["done", "Done"], ["current", "Current"], ["upcoming", "Next"]] as const)("maps lifecycle state %s", (state, stateLabel) => {
        render(<LifecycleStep props={{ ordinal: "1", label: "Build", state, stateLabel }} />)
        expect(screen.getByText(stateLabel)).toBeInTheDocument()
    })

    it("draws complete and pending task marks", () => {
        const { rerender } = render(<TaskProgressRow props={{ id: "t", title: "Ship", fact: "today", isComplete: true }} />)
        expect(document.querySelector("svg")).toBeInTheDocument()
        rerender(<TaskProgressRow props={{ id: "t", title: "Ship", fact: "today", isComplete: false }} />)
        expect(document.querySelector("svg")).toBeInTheDocument()
    })
})
