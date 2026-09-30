"use client"

import { useTheme } from "next-themes"
import { useIsHydrated } from "../../hooks/hydration/useIsHydrated"
import { THEME_MODES, type ThemeMode } from "../../composites/ThemeMenu"
import ThemeToggleView from "./component"

/** Props for {@link ThemeToggle}. */
export type ThemeToggleProps = {
    /** The accessible name of the trigger and of the menu, already resolved. */
    readonly label: string
    /** The sentence for each appearance, already resolved by the connected block. */
    readonly options: Readonly<Record<ThemeMode, string>>
}

/** Narrow the provider's free-form theme name to the three appearances this product offers. */
const asThemeMode = (theme: string | undefined): ThemeMode => THEME_MODES.find((mode) => mode === theme) ?? "system"

/**
 * The person's appearance choice: system (the default), light or dark.
 *
 * Copy arrives already resolved. Each app knows its own catalogue, so the connected block reads
 * the sentences and this shared branch only reads the theme provider.
 *
 * @param props - The resolved menu copy.
 * @returns The connected appearance menu.
 */
export const ThemeToggle = (props: ThemeToggleProps) => {
    const { theme, resolvedTheme, setTheme } = useTheme()
    const isHydrated = useIsHydrated()

    return (
        <ThemeToggleView
            props={{
                label: props.label,
                mode: isHydrated ? asThemeMode(theme) : "system",
                isDark: isHydrated && resolvedTheme === "dark",
                options: THEME_MODES.map((id) => ({ id, label: props.options[id] })),
            }}
            on={{ select: (mode) => setTheme(mode) }}
        />
    )
}
