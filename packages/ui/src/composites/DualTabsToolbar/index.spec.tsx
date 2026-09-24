import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DualTabsToolbar } from "./"

describe("DualTabsToolbar", () => {
    it("renders both controlled axes", () => {
        render(<DualTabsToolbar props={{ leading: { label: "Period", selectedKey: "week", tabs: [{ id: "week", label: "Week" }] }, trailing: { label: "Scope", selectedKey: "all", tabs: [{ id: "all", label: "All" }] } }} />)
        expect(screen.getByRole("radiogroup", { name: "Period" })).toBeInTheDocument()
        expect(screen.getByRole("radiogroup", { name: "Scope" })).toBeInTheDocument()
    })
})