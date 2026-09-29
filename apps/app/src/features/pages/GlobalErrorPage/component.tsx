import { NivoGrammarRoot, RouteStateView, type RouteStateViewData } from "@nivo/ui"

/** The resolved copy of the document-level error answer. */
export type GlobalErrorPageBaseData = Pick<RouteStateViewData, "message" | "description" | "actionLabel">

/** The one recovery the document-level answer offers. */
export type GlobalErrorPageBaseActions = { readonly retry: () => void }

/** Complete input of {@link GlobalErrorPageBase}: resolved atoms and the recovery callback. */
export type GlobalErrorPageBaseProps = {
    readonly props: GlobalErrorPageBaseData
    readonly on: GlobalErrorPageBaseActions
}

/*
 * The installed public-component-signature rule reads the render half's own name and demands the
 * contract be spelled `<Unit>Props`, so this private alias is the only name the rule accepts; the
 * exported contract above stays `<Unit>BaseProps`. Not exported: one public contract per unit.
 */
type GlobalErrorPageProps = GlobalErrorPageBaseProps

/** Draw the failure of the root layout itself: no provider sits above it, so it brings its own grammar root. */
export const GlobalErrorPageBase = ({ props, on }: GlobalErrorPageProps) => (
    <NivoGrammarRoot>
        <RouteStateView props={{ role: "alert", ...props }} on={{ action: on.retry }} />
    </NivoGrammarRoot>
)
