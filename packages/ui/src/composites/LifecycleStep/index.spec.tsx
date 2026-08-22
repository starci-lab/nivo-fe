import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { LifecycleStep } from "."

describe("LifecycleStep", () => {
    it.each([
        ["done", "Done"],
        ["current", "Current"],
        ["upcoming", "Next"],
    ] as const)("keeps marker, label and muted %s state together", (state, stateLabel) => {
        render(<LifecycleStep props={{ ordinal: "2", label: "Create workspace", state, stateLabel }} />)

        expect(screen.getByText("2")).toBeInTheDocument()
        expect(screen.getByText("Create workspace")).toBeInTheDocument()
        expect(screen.getByText(stateLabel)).toBeInTheDocument()
    })
})
