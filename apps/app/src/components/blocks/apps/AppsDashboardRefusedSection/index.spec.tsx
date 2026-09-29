import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AppsDashboardRefusedSection } from "."

describe("AppsDashboardRefusedSection", () => {
    it("keeps the source failure sentence beside its section label", () => {
        render(<AppsDashboardRefusedSection label="Owned apps" note="The apps could not be read." />)
        expect(screen.getByText("Owned apps")).toBeInTheDocument()
        expect(screen.getByText("The apps could not be read.")).toBeInTheDocument()
    })
})
