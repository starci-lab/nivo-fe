import { RouteStateView, type RouteStateViewData } from "@nivo/ui"

/** The resolved copy of the not-found answer and the address its one action leads to. */
export type NotFoundPageBaseData = Pick<RouteStateViewData, "message" | "description" | "actionLabel" | "actionHref">

/** Complete input of {@link NotFoundPageBase}: resolved atoms only. */
export type NotFoundPageBaseProps = { readonly props: NotFoundPageBaseData }

/*
 * The installed public-component-signature rule reads the render half's own name and demands the
 * contract be spelled `<Unit>Props`, so this private alias is the only name the rule accepts; the
 * exported contract above stays `<Unit>BaseProps`. Not exported: one public contract per unit.
 */
type NotFoundPageProps = NotFoundPageBaseProps

/** Draw an unknown address as one message with a way back. */
export const NotFoundPageBase = ({ props }: NotFoundPageProps) => (
    <RouteStateView props={{ role: "status", ...props }} />
)
