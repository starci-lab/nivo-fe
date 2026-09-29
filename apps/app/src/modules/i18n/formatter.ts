import type { useFormatter } from "next-intl"

/** The formatters shared by pure module projections and client controller hooks. */
export type Formatter = Pick<ReturnType<typeof useFormatter>, "number" | "dateTime" | "relativeTime">
