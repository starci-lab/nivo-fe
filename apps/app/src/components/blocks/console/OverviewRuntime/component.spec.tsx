import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { OverviewRuntimeBase, type OverviewRuntimeFact } from "./component"

const facts: ReadonlyArray<OverviewRuntimeFact> = [
    { id: "reachable", label: "Pod answered", value: "Yes" },
    { id: "httpStatus", label: "HTTP status", value: "200" },
    { id: "token", label: "Token", value: "Configured · ocw_…4f21" },
    { id: "checked", label: "Checked", value: "03/09 22:31" },
]

describe("OverviewRuntimeBase", () => {
    it("draws the pod's own fields as their own labelled surface", () => {
        render(<OverviewRuntimeBase label="Runtime" fact="The workspace pod, as it answered" facts={facts} />)

        expect(screen.getByText("Pod answered")).toBeInTheDocument()
        expect(screen.getByText("Yes")).toBeInTheDocument()
        expect(screen.getByText("Configured · ocw_…4f21")).toBeInTheDocument()
        expect(screen.getByText("03/09 22:31")).toBeInTheDocument()
    })

    it("shows the unresolved carrier as the same tree at rest", () => {
        const { container } = render(<OverviewRuntimeBase label="Runtime" facts={[{ id: "pending", label: "", value: "", isSkeleton: true }]} />)

        expect(container.querySelectorAll('[data-loading="true"]').length).toBeGreaterThan(0)
    })
})
