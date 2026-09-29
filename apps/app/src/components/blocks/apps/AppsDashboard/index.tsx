"use client"

import { useAppsDashboard } from "../../../../hooks/apps/useAppsDashboard"
import { AppsDashboardBase } from "./component"

/** This page has no route data; the viewer's own account is the address. */
export type AppsDashboardProps = Record<string, never>

/** Connect the account's app reads to the pure dashboard. */
export const AppsDashboard = (props: AppsDashboardProps) => {
    void props
    return <AppsDashboardBase {...useAppsDashboard()} />
}
