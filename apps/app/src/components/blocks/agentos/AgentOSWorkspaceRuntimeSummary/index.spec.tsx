import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AgentOSWorkspaceRuntimeSummary } from "./index"

const data = {
    workspace: { id: "workspace-1", name: "Acme", status: "active", externalWorkspaceRef: null },
    instance: null,
    apps: [],
    runtime: null,
}

describe("AgentOSWorkspaceRuntimeSummary", () => {
    it("draws the workspace summary from the aggregate", () => {
        render(
            <AgentOSWorkspaceRuntimeSummary
                view="summary"
                data={data}
                labels={{
                    section: "Summary",
                    status: "Status",
                    plan: "Plan",
                    allocation: "Allocation",
                    host: "Host",
                    chart: "Chart",
                    unprovisioned: "Not provisioned",
                }}
            />,
        )

        expect(screen.getByText("Summary")).toBeInTheDocument()
    })
})
