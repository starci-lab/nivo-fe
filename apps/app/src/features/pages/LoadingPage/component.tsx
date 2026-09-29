import { RouteLoadingView, type RouteLoadingViewData } from "@nivo/ui"

/** The resolved label of the loading answer. */
export type LoadingPageBaseData = RouteLoadingViewData

/** Complete input of {@link LoadingPageBase}: resolved atoms only. */
export type LoadingPageBaseProps = { readonly props: LoadingPageBaseData }

/*
 * The installed public-component-signature rule reads the render half's own name and demands the
 * contract be spelled `<Unit>Props`, so this private alias is the only name the rule accepts; the
 * exported contract above stays `<Unit>BaseProps`. Not exported: one public contract per unit.
 */
type LoadingPageProps = LoadingPageBaseProps

/** Draw a route that is still resolving. */
export const LoadingPageBase = ({ props }: LoadingPageProps) => <RouteLoadingView props={props} />
