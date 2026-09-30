import { renderToStaticMarkup } from "react-dom/server"
import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { FleetRow } from "."

describe("FleetRow", () => {
    it("renders the distinct DNS warning and action state", () => {
        const html = renderToStaticMarkup(
            <FleetRow
                props={{
                    id: "site-1",
                    name: "Academy",
                    detail: "site-1",
                    kind: "site",
                    kindLabel: "Site",
                    status: "awaiting_dns",
                    statusLabel: "Awaiting DNS",
                    actionLabel: "Open",
                    isActionPending: true,
                }}
                on={{ open: vi.fn(), act: vi.fn() }}
            />,
        )
        expect(html).toContain("Awaiting DNS")
        expect(html).toContain("Open")
    })

    it("has no accessibility violations in the awaiting DNS row", async () => {
        const { container } = render(
            <FleetRow
                props={{
                    id: "site-1",
                    name: "Academy",
                    detail: "site-1",
                    kind: "site",
                    kindLabel: "Site",
                    status: "awaiting_dns",
                    statusLabel: "Awaiting DNS",
                    actionLabel: "Open",
                    isActionPending: true,
                }}
                on={{ open: vi.fn(), act: vi.fn() }}
            />,
        )
        await expectNoA11yViolations(container)
    })

    it("omits actions when lifecycle does not permit one", () => {
        const html = renderToStaticMarkup(
            <FleetRow
                props={{
                    id: "workspace-1",
                    name: "Workspace",
                    kind: "workspace",
                    kindLabel: "Workspace",
                    status: "provisioning",
                    statusLabel: "Provisioning",
                }}
            />,
        )
        expect(html).toContain("Provisioning")
        expect(html).not.toContain("button")
    })
})
