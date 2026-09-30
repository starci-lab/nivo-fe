"use client"

import { useTheme } from "next-themes"
import type { ReactNode } from "react"
import { useIsHydrated } from "../../hooks/hydration/useIsHydrated"
import type { ThemeMode } from "../../composites/ThemeMenu"
import NivoGrammarThemeView from "./component"

/** Props for {@link NivoGrammarTheme}: the routed stream the palette scopes. */
export type NivoGrammarThemeProps = {
    /** The routed content inside the NIVO family root. */
    readonly children: ReactNode
}

/**
 * Keep the NIVO family palette on the same resolved theme as the app shell.
 *
 * The server cannot know which register next-themes will resolve, so the root stays on "system"
 * until the hydrated client snapshot may promote a resolved "dark" or "light" theme.
 *
 * @param props - The routed content to scope.
 * @returns The content under the NIVO family root.
 */
export const NivoGrammarTheme = (props: NivoGrammarThemeProps) => {
    const { resolvedTheme } = useTheme()
    const isHydrated = useIsHydrated()
    const theme: ThemeMode =
        isHydrated && (resolvedTheme === "dark" || resolvedTheme === "light") ? resolvedTheme : "system"

    return <NivoGrammarThemeView props={{ theme }}>{props.children}</NivoGrammarThemeView>
}
