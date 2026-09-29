"use client"

import { useTheme } from "next-themes"
import { useSyncExternalStore, type ReactNode } from "react"
import { NivoGrammarThemeBase } from "./component"

/** Props for {@link NivoGrammarTheme}: the routed stream the palette scopes. */
export type NivoGrammarThemeProps = {
    readonly children: ReactNode
}

/*
 * The hydration question has nothing to subscribe to: the answer flips once, from server to client,
 * and React performs that flip itself between the server snapshot and the first subscribed read.
 */
const subscribeHydration = (): (() => void) => () => undefined
const getClientHydration = (): boolean => true
const getServerHydration = (): boolean => false

/**
 * Keep the nivo family palette on the same resolved theme as the console shell.
 *
 * The server cannot know which register next-themes will resolve, so the first client render
 * keeps "system" - the same value the server drew - and only the post-hydration effect may
 * promote a resolved "dark" or "light". Resolving earlier would draw different markup than the
 * server sent and break hydration.
 */
export const NivoGrammarTheme = ({ children }: NivoGrammarThemeProps) => {
    const { resolvedTheme } = useTheme()
    /*
     * Hydration is external store state, not an effect: the server snapshot answers `false` so the
     * first client render keeps "system" - the same value the server drew - and the client snapshot
     * answers `true` the moment React takes over, which is exactly when a resolved "dark" or
     * "light" may be promoted.
     */
    const isHydrated = useSyncExternalStore(subscribeHydration, getClientHydration, getServerHydration)
    const theme = isHydrated && (resolvedTheme === "dark" || resolvedTheme === "light") ? resolvedTheme : "system"

    return <NivoGrammarThemeBase props={{ theme }}>{children}</NivoGrammarThemeBase>
}

export default NivoGrammarTheme
