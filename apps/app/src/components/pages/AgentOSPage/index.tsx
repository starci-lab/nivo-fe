"use client"

import { _AgentOSPage, type AgentOSPageProps } from "./component"

/** Settle the AgentOS route identity and hand drawing to the pure page twin. */
export const AgentOSPage = (props: AgentOSPageProps) => <_AgentOSPage {...props} />

/** Source-level tier marker for the connected page half. */
export const meta = { shape: "page", world: "connected" } as const
