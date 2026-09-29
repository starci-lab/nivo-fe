import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AgentOSWorkspaceControlCenterHeader } from "./index"

describe("AgentOSWorkspaceControlCenterHeader", () => {
    it("shows the workspace identity, observation time and selected page tabs", () => {
        const onSelectPageState = vi.fn()
        render(
            <AgentOSWorkspaceControlCenterHeader
                eyebrow="AgentOS"
                title="Acme workspace"
                description="Manage this workspace"
                sourceTime={{ label: "Observed", value: "Today · Instance runtime-1" }}
                tabsLabel="Workspace pages"
                pageState="overview"
                tabs={[
                    { id: "overview", label: "Overview" },
                    { id: "applications", label: "Applications" },
                ]}
                onSelectPageState={onSelectPageState}
            />,
        )

        expect(screen.getByRole("heading", { name: "Acme workspace" })).toBeInTheDocument()
        expect(screen.getByText("Today · Instance runtime-1")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("tab", { name: "Applications" }))
        expect(onSelectPageState).toHaveBeenCalledWith("applications")
    })
})
