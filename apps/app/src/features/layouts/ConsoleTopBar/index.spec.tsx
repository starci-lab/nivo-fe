import { cleanup, render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { afterEach, describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import type * as NivoUI from "@nivo/ui"

vi.mock("@/components/blocks/locale/LanguageMenu", () => ({
    LanguageMenu: () => <button type="button">language</button>,
}))
vi.mock("@nivo/ui", async () => ({
    ...(await vi.importActual<typeof NivoUI>("@nivo/ui")),
    ThemeToggle: () => <button type="button">theme</button>,
}))
vi.mock("@/components/blocks/auth/AccountMenu", () => ({
    AccountMenu: () => <button type="button">account</button>,
}))

import { ConsoleTopBar } from "."
import en from "@/messages/en.json"

const renderWithMessages = () =>
    render(
        <NextIntlClientProvider locale="en" messages={en}>
            <ConsoleTopBar />
        </NextIntlClientProvider>,
    )

describe("ConsoleTopBar", () => {
    afterEach(cleanup)

    it("renders one capability-backed global navbar and no unsupported actions", () => {
        renderWithMessages()

        expect(screen.getAllByRole("banner")).toHaveLength(1)
        expect(screen.queryAllByRole("navigation")).toHaveLength(0)
        expect(screen.getByRole("img", { name: en.console.brand })).toBeInTheDocument()
        expect(screen.getByText(en.console.title)).toBeInTheDocument()
        expect(screen.getByRole("group", { name: en.console.actionsLabel })).toBeInTheDocument()
        expect(screen.getByText("language")).toBeInTheDocument()
        expect(screen.getByText("account")).toBeInTheDocument()
        expect(screen.queryByText("search")).not.toBeInTheDocument()
        expect(screen.queryByText("cart")).not.toBeInTheDocument()
        expect(screen.queryByText("notifications")).not.toBeInTheDocument()
        expect(screen.getByText("theme")).toBeInTheDocument()
    })

    it("mounts no compact drawer trigger - the shell's compactNavigation owns that band", () => {
        renderWithMessages()

        expect(screen.queryByText("drawer")).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: en.console.openMenu })).toBeNull()
        const compact = document.querySelector("[data-grammar-navigation-feature-nav-compact-navigation]")
        expect(compact).not.toBeNull()
        expect(compact).toBeEmptyDOMElement()
    })

    it("has no axe violations in the real top bar", async () => {
        const { container } = renderWithMessages()
        await expectNoA11yViolations(container)
    })
})
