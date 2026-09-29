import type { ReactNode } from "react"
import { CLASS_NAMES as C } from "./classNames"

type ExploreGridProps = {
    readonly columns?: "three" | "two"
    readonly as?: "div" | "nav"
    readonly role?: string
    readonly label?: string
    readonly children: ReactNode
}

/** Responsive grid frame for cards with the same three-to-two-to-one breakpoints. */
const ExploreGrid = ({ columns = "three", as = "div", role, label, children }: ExploreGridProps) => {
    if (as === "nav") {
        return (
            <nav className={columns === "three" ? C.three : C.two} aria-label={label}>
                {children}
            </nav>
        )
    }
    return (
        <div className={columns === "three" ? C.three : C.two} role={role} aria-label={label}>
            {children}
        </div>
    )
}

export default ExploreGrid
