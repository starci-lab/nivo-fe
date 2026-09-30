"use client"

import type { ReactNode } from "react"
import { useTranslations } from "next-intl"
import { LoadingRegionBase } from "./component"

/** Connected loading region input: the skeleton tree to hold, or nothing for the default text skeleton. */
export type LoadingRegionProps = {
    readonly children?: ReactNode
    /** Whether the held tree is unresolved; a region that is not busy only wraps it. Busy when absent. */
    readonly isBusy?: boolean
    /** A surface-specific sentence; the console's own loading sentence when absent. */
    readonly label?: string
}

/** Resolve the catalog's loading sentence and hand drawing to the pure twin. */
export const LoadingRegion = (props: LoadingRegionProps) => {
    const { children, isBusy, label }: LoadingRegionProps = props
    const t = useTranslations("console")
    return <LoadingRegionBase state={{ children, isBusy }} props={{ statusLabel: label ?? t("loadingStatus") }} />
}

/** Registry identity for the connected loading region twin. */
