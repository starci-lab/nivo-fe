import { RouteStateView, type RouteStateViewData } from "../RouteStateView"

/** Resolved copy and home address of the not-found answer. */
type NotFoundPageBaseData = Pick<RouteStateViewData, "message" | "description" | "actionLabel" | "actionHref">

/** Complete input for the not-found answer's drawing. */
type NotFoundPageBaseProps = { readonly props: NotFoundPageBaseData }

type NotFoundPageProps = NotFoundPageBaseProps

/** Draw an unknown address as one status message with a way back home. */
export const NotFoundPageBase = ({ props }: NotFoundPageProps) => (
    <RouteStateView props={{ role: "status", ...props }} />
)
