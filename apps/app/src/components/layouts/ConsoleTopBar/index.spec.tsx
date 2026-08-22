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
vi.mock("@/components/layouts/ConsoleNav", () => ({
    ConsoleNav: () => <button type="button">drawer</button>,
}))

import { ConsoleTopBar } from "."

describe("ConsoleTopBar", () => {
    afterEach(cleanup)

    it("renders one capability-backed global navbar and no unsupported actions", () => {
        render(<ConsoleTopBar />)

        expect(screen.getByRole("heading", { name: "brand" })).toBeInTheDocument()
        expect(screen.getByText("title")).toBeInTheDocument()
        expect(screen.getByText("language")).toBeInTheDocument()
        expect(screen.getByText("account")).toBeInTheDocument()
        expect(screen.getByText("drawer")).toBeInTheDocument()
        expect(screen.queryByText("search")).not.toBeInTheDocument()
        expect(screen.queryByText("cart")).not.toBeInTheDocument()
        expect(screen.queryByText("notifications")).not.toBeInTheDocument()

        fireEvent.click(screen.getByRole("switch", { name: "theme.dark" }))
        expect(setTheme).toHaveBeenCalledWith("dark")
    })
})
