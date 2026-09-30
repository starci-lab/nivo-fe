import { RouteStateView, type RouteStateViewData } from "../RouteStateView"

/** Resolved copy of the error answer. */
type ErrorPageBaseData = Pick<RouteStateViewData, "message" | "description" | "actionLabel">

/** The recovery action the error answer offers. */
type ErrorPageBaseActions = { readonly retry: () => void }

/** Complete input for the error answer's drawing. */
type ErrorPageBaseProps = { readonly props: ErrorPageBaseData; readonly on: ErrorPageBaseActions }

type ErrorPageProps = ErrorPageBaseProps

/** Draw a route failure as one announced message with one recovery action. */
export const ErrorPageBase = ({ props, on }: ErrorPageProps) => (
    <RouteStateView props={{ role: "alert", ...props }} on={{ action: on.retry }} />
)
