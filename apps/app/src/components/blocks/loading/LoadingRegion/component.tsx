import type { ReactNode } from "react"
import { Skeleton } from "@starci/grammar/common"
import { LOADING_REGION_CLASS_NAME, LOADING_STATUS_CLASS_NAME } from "./classNames"

/**
 * What the region holds: the tree that is unresolved while `isBusy`, or none for the default text
 * skeleton. A region that is not busy is a plain wrapper around what it holds.
 */
type LoadingRegionBaseState = {
    readonly children?: ReactNode
    readonly isBusy?: boolean
}

/** The words a screen reader hears while the region is unresolved. */
type LoadingRegionBaseData = {
    readonly statusLabel: string
}

/** Public API role for LoadingRegionBaseProps. */
type LoadingRegionBaseProps = {
    readonly state: LoadingRegionBaseState
    readonly props: LoadingRegionBaseData
}
type LoadingRegionProps = LoadingRegionBaseProps

/**
 * Draw the one loading pattern: an `aria-busy` region, a visually hidden status sentence from the
 * catalog while busy, and the grammar skeleton geometry (which is itself `aria-hidden`).
 */
export const LoadingRegionBase = (props: LoadingRegionProps) => {
    const { state, props: data } = props
    const { children, isBusy = true } = state
    return (
        <div aria-busy={isBusy || undefined} className={LOADING_REGION_CLASS_NAME} data-loading-region="true">
            {isBusy ? (
                <span role="status" className={LOADING_STATUS_CLASS_NAME}>
                    {data.statusLabel}
                </span>
            ) : null}
            {children ?? <Skeleton shape="text" lines={2} />}
        </div>
    )
}

/** Registry identity for the pure loading region twin. */
