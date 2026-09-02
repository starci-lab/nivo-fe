import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { LabelledProgressRow } from "./LabelledProgressRow"
import { LifecycleStep } from "./LifecycleStep"
import { TaskProgressRow } from "./TaskProgressRow"

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
