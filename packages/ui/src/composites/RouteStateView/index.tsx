import { Button, EmptyNotice } from "@starci/grammar/common"
import { ROOT_CLASS_NAME } from "./classNames"

/** Why a route failed, as far as the reader can act on it: a stale bundle is fixed by reloading, anything else is retried. */
export type RouteFailureKind = "stale-bundle" | "unexpected"

/** The part of a boundary `error` the classifier reads. */
export type RouteFailureSource = { readonly name?: string; readonly message?: string }

const STALE_BUNDLE_NAME = "ChunkLoadError"
const STALE_BUNDLE_MESSAGE = /loading (?:css )?chunk [^\s]+ failed/iu

/**
 * Fold a thrown value into the closed vocabulary the boundary copy is keyed by, so the screen never
 * prints the raw exception text and every kind has exactly one translated message.
 *
 * @param error - The value a Next error boundary received.
 * @returns The kind that selects the copy.
 */
export const readRouteFailureKind = (error: RouteFailureSource): RouteFailureKind =>
    error.name === STALE_BUNDLE_NAME || STALE_BUNDLE_MESSAGE.test(error.message ?? "") ? "stale-bundle" : "unexpected"

/** Resolved copy and the one action of a settled route state. */
export type RouteStateViewData = {
    readonly role: "alert" | "status"
    readonly message: string
    readonly description?: string
    readonly actionLabel: string
    /** Recovery by navigation: the address the action leads to. */
    readonly actionHref?: string
}

/** The recovery callback a boundary owns: retry in place. Absent when the action is a link. */
export type RouteStateViewActions = { readonly action?: () => void }

/** Props for {@link RouteStateView}. */
export type RouteStateViewProps = { readonly props: RouteStateViewData; readonly on?: RouteStateViewActions }

/**
 * Composite: the ONE drawing of a settled route answer - an error or a missing address - with a
 * single recovery action, either a callback (retry) or a link (home).
 */
export const RouteStateView = ({ props, on }: RouteStateViewProps) => (
    <div className={ROOT_CLASS_NAME} role={props.role}>
        <EmptyNotice
            message={props.message}
            description={props.description}
            actionLabel={props.actionHref === undefined ? props.actionLabel : undefined}
            actionVariant="secondary"
            onAction={on?.action}
        />
        {props.actionHref === undefined ? null : <Button href={props.actionHref} variant="secondary">{props.actionLabel}</Button>}
    </div>
)
