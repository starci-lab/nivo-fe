import type { ReactNode } from "react"
import { SITE_CLASS_NAMES } from "./classNames"

/** Props for the one main landmark mounted by each public route owner. */
export type SiteMainProps = {
    readonly children: ReactNode
}

/** The focusable main landmark targeted by the shared skip link. */
export const SiteMain = (props: SiteMainProps) => (
    <main {...props} id="main-content" className={SITE_CLASS_NAMES.main} tabIndex={-1} />
)
