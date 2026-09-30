"use client"

import { useTheme } from "next-themes"
import { useSyncExternalStore, type ReactNode } from "react"
import { NivoGrammarThemeBase } from "./component"

/** No store to watch: the mounted flag only differs between the server render and the client. */
const subscribeNever = () => () => undefined
const readMountedOnClient = () => true
const readMountedOnServer = () => false

/** Props for {@link NivoGrammarTheme}: the routed stream the palette scopes. */
export type NivoGrammarThemeProps = {
    readonly children: ReactNode
}

/**
 * Keep the nivo family palette on the same resolved theme as the console shell.
 *
 * The server cannot know which register next-themes will resolve, so the first client render
 * keeps "system" - the same value the server drew - and only the hydrated client snapshot may
 * promote a resolved "dark" or "light". Resolving earlier would draw different markup than the
 * server sent and break hydration.
 */
export const NivoGrammarTheme = ({ children }: NivoGrammarThemeProps) => {
    const { resolvedTheme } = useTheme()
    const isHydrated = useSyncExternalStore(subscribeNever, readMountedOnClient, readMountedOnServer)
    const theme = isHydrated && (resolvedTheme === "dark" || resolvedTheme === "light") ? resolvedTheme : "system"

    return <NivoGrammarThemeBase props={{ theme }}>{children}</NivoGrammarThemeBase>
}

export default NivoGrammarTheme
