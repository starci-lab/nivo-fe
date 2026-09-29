import { fireEvent, render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { TIME_ZONE } from "@/modules/i18n/config"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    push: vi.fn(),
    pathname: "/agentos/workspaces/workspace-1",
    workspaceName: "Support desk" as string | null,
}))

vi.mock("next/navigation", () => ({
    useParams: () => ({ locale: "vi", workspaceId: "workspace-1" }),
}))
vi.mock("@/hooks", () => ({
    useRouter: () => ({ push: mocks.push }),
    usePathname: () => mocks.pathname,
    useQueryMyAgentWorkspaceControlCenterSwr: () => ({
        data: {
            ok: true,
            data: {
                workspace: { id: "workspace-1", name: mocks.workspaceName },
            },
        },
    }),
}))

import AgentOSWorkspaceNestedLayout from "./layout"

const renderLayout = (locale: "en" | "vi" = "vi") =>
    render(
        <NextIntlClientProvider
            locale={locale}
            messages={locale === "en" ? enMessages : viMessages}
            timeZone={TIME_ZONE}
        >
            <AgentOSWorkspaceNestedLayout>
                <div data-testid="nested-route-body">workspace route body</div>
            </AgentOSWorkspaceNestedLayout>
        </NextIntlClientProvider>,
    )

describe("AgentOSWorkspaceNestedLayout", () => {
    beforeEach(() => {
        mocks.pathname = "/agentos/workspaces/workspace-1"
        mocks.workspaceName = "Support desk"
        mocks.push.mockClear()
    })

    it("renders the workspace header above the overview/modules route tabs and the nested body", () => {
        renderLayout()
        const workspaceCopy = viMessages.console.agentos.workspace
        expect(screen.getByRole("heading", { level: 2, name: "Support desk" })).toBeInTheDocument()
        expect(screen.getByText(workspaceCopy.eyebrow)).toBeInTheDocument()
        expect(
            screen.getByText(viMessages.console.agentos.workspaceReference.replace("{id}", "workspace-1")),
        ).toBeInTheDocument()
        expect(screen.getByRole("tab", { name: workspaceCopy.tabs.overview })).toBeInTheDocument()
        expect(screen.getByRole("tab", { name: workspaceCopy.tabs.modules })).toBeInTheDocument()
        expect(screen.getByTestId("nested-route-body")).toBeInTheDocument()
    })

    it("keeps the workspace reference when the control-center name is absent", () => {
        mocks.workspaceName = null
        renderLayout("en")
        expect(screen.getByRole("heading", { level: 2, name: "workspace-1" })).toBeInTheDocument()
    })

    it.each(["en", "vi"] as const)("selects the overview tab on the bare workspace route in %s", (locale) => {
        mocks.pathname = "/agentos/workspaces/workspace-1"
        renderLayout(locale)
        const copy = locale === "en" ? enMessages.console.agentos.workspace : viMessages.console.agentos.workspace
        expect(screen.getByRole("tab", { name: copy.tabs.overview })).toHaveAttribute("aria-selected", "true")
        expect(screen.getByRole("tab", { name: copy.tabs.modules })).not.toHaveAttribute("aria-selected", "true")
    })

    it.each([
        "/agentos/workspaces/workspace-1/modules",
        "/agentos/workspaces/workspace-1/modules/installation-9/operate",
    ] as const)("selects the modules tab on nested module route %s", (pathname) => {
        mocks.pathname = pathname
        renderLayout()
        expect(screen.getByRole("tab", { name: viMessages.console.agentos.workspace.tabs.modules })).toHaveAttribute(
            "aria-selected",
            "true",
        )
    })

    it("navigates to the exact workspace destinations on tab selection", () => {
        renderLayout()
        const copy = viMessages.console.agentos.workspace
        fireEvent.click(screen.getByRole("tab", { name: copy.tabs.modules }))
        fireEvent.click(screen.getByRole("tab", { name: copy.tabs.overview }))
        expect(mocks.push.mock.calls).toEqual([
            ["/agentos/workspaces/workspace-1/modules"],
            ["/agentos/workspaces/workspace-1"],
        ])
    })

    it("wraps only the exact workspace segment and never the purchase or creation siblings", () => {
        const workspaceSegment = join(
            process.cwd(),
            "apps/app/src/app/[locale]/(console)/agentos/workspaces/[workspaceId]",
        )
        const workspacesSegment = join(workspaceSegment, "..")
        expect(existsSync(join(workspaceSegment, "layout.tsx"))).toBe(true)
        expect(existsSync(join(workspacesSegment, "layout.tsx"))).toBe(false)
        expect(existsSync(join(workspacesSegment, "new", "layout.tsx"))).toBe(false)
        expect(existsSync(join(workspacesSegment, "new", "checkout", "layout.tsx"))).toBe(false)
        expect(existsSync(join(workspacesSegment, "purchases", "layout.tsx"))).toBe(false)
        expect(existsSync(join(workspacesSegment, "purchases", "[purchaseId]", "layout.tsx"))).toBe(false)
        expect(existsSync(join(workspacesSegment, "purchases", "[purchaseId]", "provisioning", "layout.tsx"))).toBe(
            false,
        )
        expect(existsSync(join(workspaceSegment, "modules", "layout.tsx"))).toBe(false)
    })
})
