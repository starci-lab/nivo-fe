import type { ReactNode } from "react"
import { CLASS_NAMES } from "./classNames"

type ExploreSurfaceProps = {
    readonly page: "trust" | "ecosystem" | "ideas" | "idea-detail"
    readonly as?: "div" | "article"
    readonly children: ReactNode
}

/** Shared visual surface for the public exploration pages. */
const ExploreSurface = ({ page, as = "div", children }: ExploreSurfaceProps) => {
    if (as === "article") {
        return (
            <article className={CLASS_NAMES} data-page={page}>
                {children}
            </article>
        )
    }
    return (
        <div className={CLASS_NAMES} data-page={page}>
            {children}
        </div>
    )
}

export default ExploreSurface
