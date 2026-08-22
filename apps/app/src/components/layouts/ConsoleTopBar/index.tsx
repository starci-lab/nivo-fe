"use client"

import { useEffect, useState } from "react"
import { Heading, Text, ThemeSwitch, Tree, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { AccountMenu } from "@/components/blocks/auth/AccountMenu"
import { LanguageMenu } from "@/components/blocks/locale/LanguageMenu"
import { ConsoleNav } from "@/components/layouts/ConsoleNav"

/**
 * The authenticated console's persistent product bar.
 *
 * Its tools are capability-backed: locale routing, theme state, account sign-out and the narrow
 * destination drawer already have owners. Search, commerce and notifications remain absent because
 * Nivo does not yet own those behaviors; visual precedent cannot manufacture actions.
 */
export const ConsoleTopBar = () => {
    const t = useTranslations("console")
    const { resolvedTheme, setTheme } = useTheme()
    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => setIsMounted(true), [])
    const isDark = isMounted && resolvedTheme === "dark"

    return (
        <Tree
            contract="console-global-navbar"
            render={defineContractComponent("console-global-navbar", {
                identity: defineContractComponent("console-navbar-identity", {
                    brand: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: t("brand"), level: 2 }} />
                    )),
                    context: defineLeafComponent("text", {}, () => (
                        <Text props={{ content: t("title"), weight: "semibold" }} />
                    )),
                }),
                tools: defineContractComponent("console-navbar-tools", {
                    locale: defineLeafComponent("language-menu", {}, () => <LanguageMenu />),
                    theme: defineLeafComponent("theme-switch", {}, () => (
                        <ThemeSwitch
                            props={{ isDark, label: isDark ? t("theme.light") : t("theme.dark") }}
                            on={{ change: () => setTheme(isDark ? "light" : "dark") }}
                        />
                    )),
                    account: defineLeafComponent("account-menu", {}, () => <AccountMenu />),
                    drawer: defineLeafComponent("drawer-branch", {}, () => <ConsoleNav mode="mobile" />),
                }),
            })}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "layout", world: "connected" } as const
