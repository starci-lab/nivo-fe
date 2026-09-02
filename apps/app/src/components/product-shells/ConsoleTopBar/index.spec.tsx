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
vi.mock("@/components/product-shells/Sidebar", () => ({
    Sidebar: () => <button type="button">drawer</button>,
}))

import { ConsoleTopBar } from "."

describe("ConsoleTopBar", () => {
    afterEach(cleanup)

    it("renders one capability-backed global navbar and no unsupported actions", () => {
        render(<ConsoleTopBar />)

        expect(screen.getByRole("img", { name: "brand" })).toBeInTheDocument()
        expect(screen.getByText("title")).toBeInTheDocument()
        const identity = screen.getByRole("img", { name: "brand" }).closest("div.gap-3")
        const topBar = identity?.parentElement
        const actions = screen.getByText("language").closest("div.flex")
        expect(topBar).toHaveClass("flex", "min-w-0", "flex-wrap", "items-center", "justify-between", "gap-3")
        expect(identity).toHaveClass("flex", "min-w-0", "items-center", "gap-3")
        expect(actions).toHaveClass("flex", "max-w-full", "flex-wrap", "items-center", "justify-end", "gap-2")
        expect(screen.getByText("language")).toBeInTheDocument()
        expect(screen.getByText("account")).toBeInTheDocument()
        expect(screen.getByText("drawer").parentElement).toHaveClass("md:hidden")
        expect(screen.queryByText("search")).not.toBeInTheDocument()
        expect(screen.queryByText("cart")).not.toBeInTheDocument()
        expect(screen.queryByText("notifications")).not.toBeInTheDocument()

        fireEvent.click(screen.getByRole("switch", { name: "theme.dark" }))
        expect(setTheme).toHaveBeenCalledWith("dark")
    })
})
