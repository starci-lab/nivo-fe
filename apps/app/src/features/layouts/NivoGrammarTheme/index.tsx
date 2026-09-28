"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, type ReactNode } from "react";
import { NivoGrammarThemeBase } from "./component";

/** Props for {@link NivoGrammarTheme}: the routed stream the palette scopes. */
export type NivoGrammarThemeProps = {
    readonly children: ReactNode;
};

/**
 * Keep the nivo family palette on the same resolved theme as the console shell.
 *
 * The server cannot know which register next-themes will resolve, so the first client render
 * keeps "system" - the same value the server drew - and only the post-hydration effect may
 * promote a resolved "dark" or "light". Resolving earlier would draw different markup than the
 * server sent and break hydration.
 */
export const NivoGrammarTheme = ({ children }: NivoGrammarThemeProps) => {
    const { resolvedTheme } = useTheme();
    const [isHydrated, setHydrated] = useState(false);
    useEffect(() => {
        setHydrated(true);
    }, []);
    const theme = isHydrated && (resolvedTheme === "dark" || resolvedTheme === "light")
        ? resolvedTheme
        : "system";

    return <NivoGrammarThemeBase props={{ theme }}>{children}</NivoGrammarThemeBase>;
};

export default NivoGrammarTheme;
