import { NivoGrammarRoot } from "@nivo/ui"
import type { ReactNode } from "react"

/** The palette register the connected half resolved for this render. */
export type NivoGrammarThemeBaseData = {
    readonly theme: "system" | "light" | "dark"
}

/** Props for {@link NivoGrammarThemeBase}: the resolved theme and the routed stream. */
export type NivoGrammarThemeBaseProps = {
    readonly props: NivoGrammarThemeBaseData
    readonly children: ReactNode
}

/** Mount the nivo family palette on the theme the connected half resolved. */
export const NivoGrammarThemeBase = ({ props, children }: NivoGrammarThemeBaseProps) => (
    <NivoGrammarRoot theme={props.theme}>{children}</NivoGrammarRoot>
)
