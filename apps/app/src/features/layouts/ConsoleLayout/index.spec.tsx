import { render, screen, waitFor } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import type { ReactNode } from "react"
import type * as NivoUI from "@nivo/ui"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"

const mocks = vi.hoisted(() => ({
    pathname: "/overview",
    replace: vi.fn(),
    session: { state: { status: "signed-in" } },
    labels: { navigationLabel: "", primaryLabel: "", skipLabel: "" },
}))
vi.mock("@/hooks", () => ({
    useRouter: () => ({ replace: mocks.replace }),
    usePathname: () => mocks.pathname,
    useSession: () => mocks.session,
}))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => mocks.session }))
vi.mock("@/components/blocks/locale/LanguageMenu", () => ({
    LanguageMenu: () => <button type="button">language</button>,
}))
vi.mock("@/components/blocks/auth/AccountMenu", () => ({
    AccountMenu: () => <button type="button">account</button>,
}))
vi.mock("@nivo/ui", async () => ({
    ...(await vi.importActual<typeof NivoUI>("@nivo/ui")),
    ThemeToggle: () => <button type="button">theme</button>,
}))
interface MockBaseProps {
    readonly state: { readonly children: ReactNode }
    readonly props: { readonly navigationLabel: string; readonly primaryLabel: string; readonly skipLabel: string }
}
vi.mock("./component", () => ({
    ConsoleLayoutBase: ({ state, props: data }: MockBaseProps) => {
        mocks.labels = { navigationLabel: data.navigationLabel, primaryLabel: data.primaryLabel, skipLabel: data.skipLabel }
        return <div>{state.children}</div>
    },
}))

import { ConsoleLayout } from "."
import en from "@/messages/en.json"

const workspace = <main id="main-content" tabIndex={-1}>workspace</main>
const renderWithMessages = (content: ReactNode) =>
    render(
        <NextIntlClientProvider locale="en" messages={en}>
            {content}
        </NextIntlClientProvider>,
    )

describe("ConsoleLayout", () => {
    beforeEach(() => {
        mocks.session.state = { status: "signed-in" }
        mocks.replace.mockClear()
    })

    it("keeps a signed-in routed page", () => {
        renderWithMessages(<ConsoleLayout>{workspace}</ConsoleLayout>)
        expect(screen.getByText("workspace")).toBeInTheDocument()
        expect(mocks.replace).not.toHaveBeenCalled()
    })

    it("names the rail and the routed region apart, and neither after the band's context", () => {
        renderWithMessages(<ConsoleLayout>{workspace}</ConsoleLayout>)
        expect(mocks.labels.navigationLabel).toBe(en.console.navigationLabel)
        expect(mocks.labels.primaryLabel).toBe(en.console.workspaceLabel)
        expect(mocks.labels.primaryLabel).not.toBe(mocks.labels.navigationLabel)
        expect(mocks.labels.primaryLabel).not.toBe(en.console.title)
        expect(mocks.labels.skipLabel).toBe(en.console.skipToContent)
    })

    it("returns an anonymous reader to the locale-aware door carrying the interrupted route", async () => {
        mocks.session.state = { status: "anonymous" }
        mocks.pathname = "/agentos/workspaces/w1/modules/m1/setup"
        renderWithMessages(<ConsoleLayout>{workspace}</ConsoleLayout>)
        expect(screen.queryByText("workspace")).toBeNull()
        await waitFor(() =>
            expect(mocks.replace).toHaveBeenCalledWith(
                "/authentication?returnTo=%2Fagentos%2Fworkspaces%2Fw1%2Fmodules%2Fm1%2Fsetup",
            ),
        )
    })

    it("carries nothing when the interrupted route is the root", async () => {
        mocks.session.state = { status: "anonymous" }
        mocks.pathname = "/"
        renderWithMessages(<ConsoleLayout>{workspace}</ConsoleLayout>)
        await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/authentication"))
    })

    it("draws no private shell while the refresh cookie is still being restored", () => {
        mocks.session.state = { status: "restoring" }
        renderWithMessages(<ConsoleLayout>{workspace}</ConsoleLayout>)
        expect(screen.queryByText("workspace")).toBeNull()
        expect(mocks.replace).not.toHaveBeenCalled()
    })

    it("has no axe violations in the real console frame", async () => {
        const { ConsoleLayoutBase } = await vi.importActual<typeof import("./component")>("./component")
        const { container } = renderWithMessages(
            <ConsoleLayoutBase
                state={{ children: workspace }}
                props={{
                    navigationLabel: en.console.navigationLabel,
                    primaryLabel: en.console.workspaceLabel,
                    skipLabel: en.console.skipToContent,
                }}
            />,
        )

        await expectNoA11yViolations(container)
    })
})
