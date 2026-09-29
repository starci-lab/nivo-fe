import { RouteStateView, type RouteStateViewData } from "@nivo/ui"

/** The resolved copy of the error answer: what happened, what to do, and the label of the one action. */
export type ErrorPageBaseData = Pick<RouteStateViewData, "message" | "description" | "actionLabel">

/** The one recovery the error answer offers. */
export type ErrorPageBaseActions = { readonly retry: () => void }

/** Complete input of {@link ErrorPageBase}: resolved atoms and the recovery callback. */
export type ErrorPageBaseProps = {
    readonly props: ErrorPageBaseData
    readonly on: ErrorPageBaseActions
}

/*
 * The installed public-component-signature rule reads the render half's own name and demands the
 * contract be spelled `<Unit>Props`, so this private alias is the only name the rule accepts; the
 * exported contract above stays `<Unit>BaseProps`. Not exported: one public contract per unit.
 */
type ErrorPageProps = ErrorPageBaseProps

/** Draw a route failure as one announced message with a single recovery action. */
export const ErrorPageBase = ({ props, on }: ErrorPageProps) => (
    <RouteStateView props={{ role: "alert", ...props }} on={{ action: on.retry }} />
)
