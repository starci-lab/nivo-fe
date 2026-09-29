"use client"

import { THEME_MODES, type ThemeMode } from "@nivo/ui"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { ThemeToggleBase } from "./component"

/** The toggle reads the theme provider and the catalogue, so it takes no props. */
export type ThemeToggleProps = Record<string, never>

/** Narrow the provider's free-form theme name to the three appearances this product offers. */
const asThemeMode = (theme: string | undefined): ThemeMode => THEME_MODES.find((mode) => mode === theme) ?? "system"

/**
 * The person's appearance choice: system (the default), light or dark.
 *
 * The provider persists the choice and applies it to `<html>` before first paint, so this only asks
 * for it. Until the client has mounted the server and the first client render agree on "system" and
 * the sun, because the stored choice cannot be known on the server.
 */
export const ThemeToggle = (props: ThemeToggleProps) => {
    void props
    const t = useTranslations("theme")
    const { theme, resolvedTheme, setTheme } = useTheme()
    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => setIsMounted(true), [])
    return (
        <ThemeToggleBase
            props={{
                label: t("label"),
                mode: isMounted ? asThemeMode(theme) : "system",
                isDark: isMounted && resolvedTheme === "dark",
                options: THEME_MODES.map((id) => ({ id, label: t(`options.${id}`) })),
            }}
            on={{ select: (mode) => setTheme(mode) }}
        />
    )
}
