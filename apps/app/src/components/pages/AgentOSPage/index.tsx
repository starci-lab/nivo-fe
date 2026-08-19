"use client"

import { AgentOSPageBase, type AgentOSPageProps } from "./component"

/** Settle the AgentOS route identity and hand drawing to the pure page twin. */
export const AgentOSPage = (props: AgentOSPageProps) => <AgentOSPageBase {...props} />

/** Source-level tier marker for the connected page half. */
export const meta = { shape: "page", world: "connected" } as const
