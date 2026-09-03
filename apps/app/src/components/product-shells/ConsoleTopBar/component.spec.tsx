import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ConsoleTopBarBase } from "./component"

const LocaleControl = () => <button type="button">language</button>
const AccountControl = () => <button type="button">account</button>
const DrawerControl = () => <button type="button">drawer</button>

describe("ConsoleTopBarBase", () => {
    afterEach(cleanup)

    it("draws one global navbar landmark carrying only capability-backed tools", () => {
        const onToggleTheme = vi.fn()
        render(<ConsoleTopBarBase
            brandLabel="nivo"
            contextLabel="Console"
            navigationLabel="Console primary navigation"
            actionsLabel="Account actions"
            compactNavigationTriggerLabel="Menu"
            isDark={false}
            lightThemeLabel="Use light theme"
            darkThemeLabel="Use dark theme"
            localeControl={LocaleControl}
            localeControlProps={{}}
            accountControl={AccountControl}
            accountControlProps={{}}
            drawerControl={DrawerControl}
            drawerControlProps={{}}
            onToggleTheme={onToggleTheme}
        />)

        expect(screen.getByRole("banner")).toBeInTheDocument()
        expect(screen.getByRole("navigation", { name: "Console primary navigation" })).toBeInTheDocument()
        expect(screen.getByRole("group", { name: "Menu" })).toContainElement(screen.getByText("drawer"))
        expect(screen.getByRole("group", { name: "Account actions" })).toBeInTheDocument()
        expect(screen.getByRole("img", { name: "nivo" })).toBeInTheDocument()
        expect(screen.getByText("Console")).toBeInTheDocument()
        expect(screen.getByText("language")).toBeInTheDocument()
        expect(screen.getByText("account")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("switch", { name: "Use dark theme" }))
        expect(onToggleTheme).toHaveBeenCalledTimes(1)
    })

    it("orders actions locale, then theme, then account", () => {
        render(<ConsoleTopBarBase
            brandLabel="nivo"
            contextLabel="Console"
            navigationLabel="Console primary navigation"
            actionsLabel="Account actions"
            compactNavigationTriggerLabel="Menu"
            isDark={false}
            lightThemeLabel="Use light theme"
            darkThemeLabel="Use dark theme"
            localeControl={LocaleControl}
            localeControlProps={{}}
            accountControl={AccountControl}
            accountControlProps={{}}
            drawerControl={DrawerControl}
            drawerControlProps={{}}
            onToggleTheme={vi.fn()}
        />)

        const locale = screen.getByText("language")
        const theme = screen.getByRole("switch", { name: "Use dark theme" })
        const account = screen.getByText("account")
        const localeBeforeTheme = Boolean(locale.compareDocumentPosition(theme) & Node.DOCUMENT_POSITION_FOLLOWING)
        const themeBeforeAccount = Boolean(theme.compareDocumentPosition(account) & Node.DOCUMENT_POSITION_FOLLOWING)
        expect(localeBeforeTheme).toBe(true)
        expect(themeBeforeAccount).toBe(true)
    })
})
