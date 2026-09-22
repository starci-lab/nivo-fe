import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const setTheme = vi.fn()
vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
}))
vi.mock("next-themes", () => ({
    useTheme: () => ({ resolvedTheme: "light", setTheme }),
}))
vi.mock("@/components/blocks/locale/LanguageMenu", () => ({
    LanguageMenu: () => <button type="button">language</button>,
}))
vi.mock("@/components/blocks/auth/AccountMenu", () => ({
    AccountMenu: () => <button type="button">account</button>,
}))

import { ConsoleTopBar } from "."

describe("ConsoleTopBar", () => {
    afterEach(cleanup)

    it("renders one capability-backed global navbar and no unsupported actions", () => {
        render(<ConsoleTopBar />)

        expect(screen.getAllByRole("banner")).toHaveLength(1)
        expect(screen.queryAllByRole("navigation")).toHaveLength(0)
        expect(screen.getByRole("img", { name: "brand" })).toBeInTheDocument()
        expect(screen.getByText("title")).toBeInTheDocument()
        expect(screen.getByRole("group", { name: "actionsLabel" })).toBeInTheDocument()
        expect(screen.getByText("language")).toBeInTheDocument()
        expect(screen.getByText("account")).toBeInTheDocument()
        expect(screen.queryByText("search")).not.toBeInTheDocument()
        expect(screen.queryByText("cart")).not.toBeInTheDocument()
        expect(screen.queryByText("notifications")).not.toBeInTheDocument()

        fireEvent.click(screen.getByRole("switch", { name: "theme.dark" }))
        expect(setTheme).toHaveBeenCalledWith("dark")
    })

    it("mounts no compact drawer trigger - the shell's compactNavigation owns that band", () => {
        render(<ConsoleTopBar />)

        expect(screen.queryByText("drawer")).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "openMenu" })).toBeNull()
        const compact = document.querySelector("[data-grammar-navigation-feature-nav-compact-navigation]")
        expect(compact).not.toBeNull()
        expect(compact).toBeEmptyDOMElement()
    })
})
