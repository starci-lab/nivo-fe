import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ConsoleTopBarBase } from "./component"

const LocaleControl = () => <button type="button">language</button>
const AccountControl = () => <button type="button">account</button>

describe("ConsoleTopBarBase", () => {
    afterEach(cleanup)

    it("draws one global navbar landmark carrying only capability-backed tools", () => {
        const onToggleTheme = vi.fn()
        render(
            <ConsoleTopBarBase
                state={{
                    localeControl: LocaleControl,
                    localeControlProps: {},
                    accountControl: AccountControl,
                    accountControlProps: {},
                }}
                props={{
                    brandLabel: "nivo",
                    contextLabel: "Console",
                    actionsLabel: "Console controls",
                    isDark: false,
                    lightThemeLabel: "Use light theme",
                    darkThemeLabel: "Use dark theme",
                }}
                on={{ toggleTheme: onToggleTheme }}
            />,
        )

        expect(screen.getAllByRole("banner")).toHaveLength(1)
        expect(screen.queryAllByRole("navigation")).toHaveLength(0)
        expect(screen.getByRole("group", { name: "Console controls" })).toBeInTheDocument()
        expect(screen.getByRole("img", { name: "nivo" })).toBeInTheDocument()
        expect(screen.getByText("Console")).toBeInTheDocument()
        expect(screen.getByText("language")).toBeInTheDocument()
        expect(screen.getByText("account")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("switch", { name: "Use dark theme" }))
        expect(onToggleTheme).toHaveBeenCalledTimes(1)
    })

    it("leaves the compact trigger slot empty and unnamed because the shell owns the compact band", () => {
        render(
            <ConsoleTopBarBase
                state={{
                    localeControl: LocaleControl,
                    localeControlProps: {},
                    accountControl: AccountControl,
                    accountControlProps: {},
                }}
                props={{
                    brandLabel: "nivo",
                    contextLabel: "Console",
                    actionsLabel: "Console controls",
                    isDark: false,
                    lightThemeLabel: "Use light theme",
                    darkThemeLabel: "Use dark theme",
                }}
                on={{ toggleTheme: vi.fn() }}
            />,
        )

        const compact = document.querySelector("[data-grammar-navigation-feature-nav-compact-navigation]")
        expect(compact).not.toBeNull()
        expect(compact).toBeEmptyDOMElement()
        expect(compact).toHaveAttribute("aria-label", "")
        expect(screen.queryByRole("button", { name: "Menu" })).toBeNull()
    })

    it("orders actions locale, then theme, then account", () => {
        render(
            <ConsoleTopBarBase
                state={{
                    localeControl: LocaleControl,
                    localeControlProps: {},
                    accountControl: AccountControl,
                    accountControlProps: {},
                }}
                props={{
                    brandLabel: "nivo",
                    contextLabel: "Console",
                    actionsLabel: "Console controls",
                    isDark: false,
                    lightThemeLabel: "Use light theme",
                    darkThemeLabel: "Use dark theme",
                }}
                on={{ toggleTheme: vi.fn() }}
            />,
        )

        const locale = screen.getByText("language")
        const theme = screen.getByRole("switch", { name: "Use dark theme" })
        const account = screen.getByText("account")
        const localeBeforeTheme = Boolean(locale.compareDocumentPosition(theme) & Node.DOCUMENT_POSITION_FOLLOWING)
        const themeBeforeAccount = Boolean(theme.compareDocumentPosition(account) & Node.DOCUMENT_POSITION_FOLLOWING)
        expect(localeBeforeTheme).toBe(true)
        expect(themeBeforeAccount).toBe(true)
    })
})
