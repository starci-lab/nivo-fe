import type { ComponentType } from "react"
import { NivoBrand, Text, ThemeSwitch, Tree, defineContractComponent, defineLeafComponent } from "@nivo/ui"

/** Pure top-bar labels, controls, and theme command. */
export type ConsoleTopBarProps<L extends object, A extends object, D extends object> = {
    readonly brandLabel: string
    readonly contextLabel: string
    readonly isDark: boolean
    readonly lightThemeLabel: string
    readonly darkThemeLabel: string
    readonly localeControl: ComponentType<L>
    readonly localeControlProps: L
    readonly accountControl: ComponentType<A>
    readonly accountControlProps: A
    readonly drawerControl: ComponentType<D>
    readonly drawerControlProps: D
    readonly onToggleTheme: () => void
}

/** Draw the protected Nivo lockup and only capability-backed global tools. */
export const ConsoleTopBarBase = <L extends object, A extends object, D extends object>({
    brandLabel, contextLabel, isDark, lightThemeLabel, darkThemeLabel,
    localeControl: LocaleControl, localeControlProps,
    accountControl: AccountControl, accountControlProps,
    drawerControl: DrawerControl, drawerControlProps, onToggleTheme,
}: ConsoleTopBarProps<L, A, D>) => (
    <Tree contract="console-global-navbar" render={defineContractComponent("console-global-navbar", {
        identity: defineContractComponent("console-navbar-identity", {
            brand: defineLeafComponent("brand-mark", {}, () => <NivoBrand props={{ label: brandLabel, variant: "lockup", scale: "navbar" }} />),
            context: defineLeafComponent("text", {}, () => <Text props={{ content: contextLabel, weight: "semibold" }} />),
        }),
        tools: defineContractComponent("console-navbar-tools", {
            locale: defineLeafComponent("language-menu", {}, () => <LocaleControl {...localeControlProps} />),
            theme: defineLeafComponent("theme-switch", {}, () => <ThemeSwitch props={{ isDark, label: isDark ? lightThemeLabel : darkThemeLabel }} on={{ change: onToggleTheme }} />),
            account: defineLeafComponent("account-menu", {}, () => <AccountControl {...accountControlProps} />),
            drawer: defineLeafComponent("drawer-branch", {}, () => <DrawerControl {...drawerControlProps} />),
        }),
    })} />
)

/** Registry identity for the pure console top-bar twin. */
export const meta = { shape: "layout", world: "pure" } as const
