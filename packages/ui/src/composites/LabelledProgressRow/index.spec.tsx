import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { LabelledProgressRow } from "./"

describe("LabelledProgressRow", () => {
    it("renders progress value and hides it while loading", () => {
        const { rerender } = render(<LabelledProgressRow props={{ id: "course", title: "Course", percent: 60, percentText: "60%" }} />)
        expect(screen.getByText("Course")).toBeInTheDocument()
        expect(screen.getByText("60%")).toBeInTheDocument()
        rerender(<LabelledProgressRow props={{ id: "course", title: "Course", percent: 60, percentText: "60%" }} isLoading />)
        expect(screen.queryByText("60%")).not.toBeInTheDocument()
    })
})