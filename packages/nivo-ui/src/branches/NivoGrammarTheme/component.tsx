import type { ReactNode } from "react"
import { NivoGrammarRoot } from "../../leaves/NivoGrammar"
import type { ThemeMode } from "../ThemeMenu"

type NivoGrammarThemeViewProps = {
    readonly props: { readonly theme: ThemeMode }
    readonly children: ReactNode
}

const NivoGrammarThemeView = ({ props, children }: NivoGrammarThemeViewProps) => (
    <NivoGrammarRoot theme={props.theme}>{children}</NivoGrammarRoot>
)

export default NivoGrammarThemeView
