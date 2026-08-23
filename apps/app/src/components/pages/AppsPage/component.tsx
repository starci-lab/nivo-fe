import { AppsDashboard } from "@/components/blocks/apps/AppsDashboard"

/** Compose the connected dashboard block without proxying its request states. */
export const AppsPageBase = () => <AppsDashboard />

/** Source-level tier marker for the pure Apps page compositor. */
export const meta = { shape: "page", world: "pure" } as const
