"use client"

import { AppsPageBase } from "./component"

/** Mount the Apps dashboard compositor; the child block owns all external state. */
export const AppsPage = () => <AppsPageBase />

/** Source-level tier marker for the connected Apps page entry. */
export const meta = { shape: "page", world: "connected" } as const
