import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { TaskProgressRow } from "./"

describe("TaskProgressRow", () => {
    it("draws complete and pending task marks", () => {
        const { rerender } = render(<TaskProgressRow props={{ id: "t", title: "Ship", fact: "today", isComplete: true }} />)
        expect(document.querySelector("svg")).toBeInTheDocument()
        rerender(<TaskProgressRow props={{ id: "t", title: "Ship", fact: "today", isComplete: false }} />)
        expect(document.querySelector("svg")).toBeInTheDocument()
    })
})