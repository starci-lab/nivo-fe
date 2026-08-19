"use client"

import { TemplateAppProvisioningPageBase, type TemplateAppProvisioningPageProps } from "./component"

/** Settle the route identity and hand drawing to the pure page twin. */
export const TemplateAppProvisioningPage = (props: TemplateAppProvisioningPageProps) => (
    <TemplateAppProvisioningPageBase {...props} />
)

/** Source-level tier marker for the connected page half. */
export const meta = { shape: "page", world: "connected" } as const
