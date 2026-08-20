import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AgentOSSummary } from "./index"

describe("AgentOSSummary", () => {
    it("draws the workspace and its one safe service action", () => {
        const html = renderToStaticMarkup(<AgentOSSummary label="AgentOS" state={{ phase: "populated", workspace: {
            id: "workspace-1", name: "Support", description: "OpenClaw workspace", statusLabel: "Available", statusTone: "success", actionLabel: "Open service", actionHref: "/agentos/workspace-1",
        } }} onOpenService={vi.fn()} />)
        expect(html).toContain("Support")
        expect(html).toContain("Available")
        expect(html).toContain("Open service")
    })

    it("draws a settled missing workspace", () => {
        const html = renderToStaticMarkup(<AgentOSSummary label="AgentOS" state={{ phase: "empty", message: "No workspace" }} onOpenService={vi.fn()} />)
        expect(html).toContain("No workspace")
    })
})
