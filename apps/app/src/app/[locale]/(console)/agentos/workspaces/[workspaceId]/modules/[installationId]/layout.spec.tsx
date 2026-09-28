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
    pathname: "/agentos/workspaces/workspace-1/modules/installation-1",
    installations: null as ReadonlyArray<{ readonly id: string; readonly moduleKey: string; readonly displayName: string }> | null,
}))

vi.mock("next/navigation", () => ({
    useParams: () => ({ locale: "vi", workspaceId: "workspace-1", installationId: "installation-1" }),
}))
const allInstallations = [
    { id: "installation-1", moduleKey: "multichannel-chatbot", displayName: "Chatbot Sales" },
    { id: "installation-2", moduleKey: "finance-copilot", displayName: "Kế toán Q3" },
    { id: "installation-3", moduleKey: "multichannel-chatbot", displayName: "Chatbot Web" },
]

vi.mock("@/hooks", () => ({
    useRouter: () => ({ push: mocks.push }),
    usePathname: () => mocks.pathname,
    useQueryMyAgentosModuleInstallationsSwr: () => ({
        data: mocks.installations === null ? { ok: false } : { ok: true, data: mocks.installations },
    }),
}))

import AgentOSModuleInstallationLayout from "./layout"

const renderLayout = (locale: "en" | "vi" = "vi") =>
    render(
        <NextIntlClientProvider locale={locale} messages={locale === "en" ? enMessages : viMessages} timeZone={TIME_ZONE}>
            <AgentOSModuleInstallationLayout>
                <div data-testid="installation-route-body">installation route body</div>
            </AgentOSModuleInstallationLayout>
        </NextIntlClientProvider>
    )

describe("AgentOSModuleInstallationLayout", () => {
    beforeEach(() => {
        mocks.installations = allInstallations
        mocks.pathname = "/agentos/workspaces/workspace-1/modules/installation-1"
        mocks.push.mockClear()
    })

    it("renders the workspace module subnavigation grouped by kind with the exact installation selected", () => {
        renderLayout()
        const shell = viMessages.console.agentos.modules.shell
        const subnav = screen.getByRole("navigation", { name: shell.modules })
        expect(subnav).toBeInTheDocument()
        expect(screen.getByText(shell.kind.chatbot)).toBeInTheDocument()
        expect(screen.getByText(shell.kind.accounting)).toBeInTheDocument()
        const current = screen.getByRole("option", { name: /Chatbot Sales/ })
        expect(current).toHaveAttribute("aria-selected", "true")
        expect(screen.getByRole("option", { name: /Chatbot Web/ })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: /Kế toán Q3/ })).toBeInTheDocument()
        expect(screen.getByTestId("installation-route-body")).toBeInTheDocument()
    })

    it("keeps the exact current installation visible when the sibling read is refused", () => {
        mocks.installations = null
        renderLayout()
        expect(screen.getByRole("option", { name: /installation-1/ })).toHaveAttribute("aria-selected", "true")
    })

    it("navigates to an exact sibling installation in the same workspace", () => {
        renderLayout()
        fireEvent.click(screen.getByRole("option", { name: /Kế toán Q3/ }))
        expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/workspace-1/modules/installation-2")
    })

    it("renders the five routed module sections in vi and en", () => {
        for (const locale of ["vi", "en"] as const) {
            const shell = (locale === "en" ? enMessages : viMessages).console.agentos.modules.shell
            const { unmount } = renderLayout(locale)
            for (const segment of ["setup", "operate", "test", "settings", "diagnostics"] as const) {
                expect(screen.getByRole("tab", { name: shell[segment] })).toBeInTheDocument()
            }
            unmount()
        }
    })

    it.each(["setup", "operate", "test", "settings", "diagnostics"] as const)(
        "navigates to the exact scoped %s section route",
        (segment) => {
            renderLayout()
            const shell = viMessages.console.agentos.modules.shell
            fireEvent.click(screen.getByRole("tab", { name: shell[segment] }))
            expect(mocks.push).toHaveBeenCalledWith(`/agentos/workspaces/workspace-1/modules/installation-1/${segment}`)
        }
    )

    it("marks the bare installation route as setup and the matching segment as selected", () => {
        const shell = viMessages.console.agentos.modules.shell
        mocks.pathname = "/agentos/workspaces/workspace-1/modules/installation-1"
        let view = renderLayout()
        expect(screen.getByRole("tab", { name: shell.setup })).toHaveAttribute("aria-selected", "true")
        view.unmount()
        mocks.pathname = "/agentos/workspaces/workspace-1/modules/installation-1/diagnostics"
        view = renderLayout()
        expect(screen.getByRole("tab", { name: shell.diagnostics })).toHaveAttribute("aria-selected", "true")
        expect(screen.getByRole("tab", { name: shell.setup })).not.toHaveAttribute("aria-selected", "true")
        view.unmount()
    })

    it("wraps only the exact installation segment and never the module siblings or purchase routes", () => {
        const installationSegment = join(process.cwd(), "apps/app/src/app/[locale]/(console)/agentos/workspaces/[workspaceId]/modules/[installationId]")
        const modulesSegment = join(installationSegment, "..")
        const workspaceSegment = join(modulesSegment, "..")
        const workspacesSegment = join(workspaceSegment, "..")
        expect(existsSync(join(installationSegment, "layout.tsx"))).toBe(true)
        expect(existsSync(join(modulesSegment, "layout.tsx"))).toBe(false)
        expect(existsSync(join(modulesSegment, "create", "layout.tsx"))).toBe(false)
        expect(existsSync(join(modulesSegment, "studio", "layout.tsx"))).toBe(false)
        expect(existsSync(join(workspacesSegment, "layout.tsx"))).toBe(false)
        expect(existsSync(join(workspacesSegment, "new", "layout.tsx"))).toBe(false)
        expect(existsSync(join(workspacesSegment, "new", "checkout", "layout.tsx"))).toBe(false)
        expect(existsSync(join(workspacesSegment, "purchases", "layout.tsx"))).toBe(false)
        expect(existsSync(join(workspacesSegment, "purchases", "[purchaseId]", "layout.tsx"))).toBe(false)
        expect(existsSync(join(workspacesSegment, "purchases", "[purchaseId]", "provisioning", "layout.tsx"))).toBe(false)
    })
})
