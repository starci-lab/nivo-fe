import { NivoGrammarRoot, RouteStateView, type RouteStateViewData } from "@nivo/ui"
import { Skeleton } from "@starci/grammar/common"

/** The resolved copy of the document-level error answer. */
export type GlobalErrorPageBaseData = Pick<RouteStateViewData, "message" | "description" | "actionLabel">

/** The one recovery the document-level answer offers. */
export type GlobalErrorPageBaseActions = { readonly retry: () => void }

/** Complete input of {@link GlobalErrorPageBase}: the copy once it has loaded, and the recovery callback. */
export type GlobalErrorPageBaseProps = {
    readonly props: GlobalErrorPageBaseData | undefined
    readonly on: GlobalErrorPageBaseActions
}

/*
 * The installed public-component-signature rule reads the render half's own name and demands the
 * contract be spelled `<Unit>Props`, so this private alias is the only name the rule accepts; the
 * exported contract above stays `<Unit>BaseProps`. Not exported: one public contract per unit.
 */
type GlobalErrorPageProps = GlobalErrorPageBaseProps

/**
 * Draw the failure of the root layout itself: no provider sits above it, so it brings its own
 * grammar root, and it holds skeleton geometry until its copy has arrived.
 */
export const GlobalErrorPageBase = ({ props, on }: GlobalErrorPageProps) => (
    <NivoGrammarRoot>
        {props === undefined ? (
            <Skeleton shape="text" lines={3} />
        ) : (
            <RouteStateView props={{ role: "alert", ...props }} on={{ action: on.retry }} />
        )}
    </NivoGrammarRoot>
)
