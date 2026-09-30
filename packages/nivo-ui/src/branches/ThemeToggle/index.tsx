"use client"

import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useIsHydrated } from "../../hooks/hydration/useIsHydrated"
import { THEME_MODES, type ThemeMode } from "../../composites/ThemeMenu"
import ThemeToggleView from "./component"

/** Props for {@link ThemeToggle}. */
export type ThemeToggleProps = {
    /** The catalogue namespace that provides the theme label and option labels. */
    readonly namespace: string
}

/** Narrow the provider's free-form theme name to the three appearances this product offers. */
const asThemeMode = (theme: string | undefined): ThemeMode => THEME_MODES.find((mode) => mode === theme) ?? "system"

/**
 * The person's appearance choice: system (the default), light or dark.
 *
 * The selected namespace lets each app keep its own catalogue shape while the connected control
 * stays shared.
 *
 * @param props - The catalogue namespace for this app.
 * @returns The connected appearance menu.
 */
export const ThemeToggle = ({ namespace }: ThemeToggleProps) => {
    const t = useTranslations(namespace)
    const { theme, resolvedTheme, setTheme } = useTheme()
    const isHydrated = useIsHydrated()

    return (
        <ThemeToggleView
            props={{
                label: t("label"),
                mode: isHydrated ? asThemeMode(theme) : "system",
                isDark: isHydrated && resolvedTheme === "dark",
                options: THEME_MODES.map((id) => ({ id, label: t(`options.${id}`) })),
            }}
            on={{ select: (mode) => setTheme(mode) }}
        />
    )
}
