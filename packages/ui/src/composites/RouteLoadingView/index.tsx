import { Skeleton, Spinner } from "@starci/grammar/common"
import { ROOT_CLASS_NAME } from "./classNames"

/** Resolved copy of the loading answer. */
export type RouteLoadingViewData = { readonly label: string }

/** Props for {@link RouteLoadingView}. */
export type RouteLoadingViewProps = { readonly props: RouteLoadingViewData }

/**
 * Composite: the ONE drawing of a route that is still resolving - a spinner announced through its
 * label over skeleton geometry, never an empty region.
 */
export const RouteLoadingView = ({ props }: RouteLoadingViewProps) => (
    <div className={ROOT_CLASS_NAME} aria-busy="true">
        <Spinner label={props.label} />
        <Skeleton shape="text" lines={3} />
    </div>
)
