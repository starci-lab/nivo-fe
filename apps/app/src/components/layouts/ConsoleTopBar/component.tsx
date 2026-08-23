import type { ReactNode } from "react"
import { NivoBrand, Text, ThemeSwitch, Tree, defineContractComponent, defineLeafComponent } from "@nivo/ui"

/** Pure top-bar labels, controls, and theme command. */
export type ConsoleTopBarProps = {
    readonly brandLabel: string
    readonly contextLabel: string
    readonly isDark: boolean
    readonly lightThemeLabel: string
    readonly darkThemeLabel: string
    readonly localeControl: ReactNode
    readonly accountControl: ReactNode
    readonly drawerControl: ReactNode
    readonly onToggleTheme: () => void
}

/** Draw the protected Nivo lockup and only capability-backed global tools. */
export const ConsoleTopBarBase = ({ brandLabel, contextLabel, isDark, lightThemeLabel, darkThemeLabel, localeControl, accountControl, drawerControl, onToggleTheme }: ConsoleTopBarProps) => (
    <Tree contract="console-global-navbar" render={defineContractComponent("console-global-navbar", {
        identity: defineContractComponent("console-navbar-identity", {
            brand: defineLeafComponent("brand-mark", {}, () => <NivoBrand props={{ label: brandLabel, variant: "lockup", scale: "navbar" }} />),
            context: defineLeafComponent("text", {}, () => <Text props={{ content: contextLabel, weight: "semibold" }} />),
        }),
        tools: defineContractComponent("console-navbar-tools", {
            locale: defineLeafComponent("language-menu", {}, () => localeControl),
            theme: defineLeafComponent("theme-switch", {}, () => <ThemeSwitch props={{ isDark, label: isDark ? lightThemeLabel : darkThemeLabel }} on={{ change: onToggleTheme }} />),
            account: defineLeafComponent("account-menu", {}, () => accountControl),
            drawer: defineLeafComponent("drawer-branch", {}, () => drawerControl),
        }),
    })} />
)

/** Registry identity for the pure console top-bar twin. */
export const meta = { shape: "layout", world: "pure" } as const
