import type { ReactNode } from "react"
import { SITE_COPY } from "@/resources/site"
import { SITE_CLASS_NAMES } from "./classNames"
import { SiteFooter } from "./SiteFooter"
import { SiteHeader } from "./SiteHeader"

/** Props for the public-site shell shared by all route adapters. */
export type SiteShellProps = {
    readonly children: ReactNode
}

/** Global skip link, header, routed content, and compact footer. */
export const SiteShell = (props: SiteShellProps) => {
    const { children } = props

    return (
        <div className={SITE_CLASS_NAMES.shell}>
            <a className={SITE_CLASS_NAMES.skipLink} href="#main-content">{SITE_COPY.skipToContent}</a>
            <SiteHeader />
            {children}
            <SiteFooter />
        </div>
    )
}
