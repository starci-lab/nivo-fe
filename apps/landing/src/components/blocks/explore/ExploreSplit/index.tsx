import type { ReactNode } from "react"
import { CLASS_NAMES } from "./classNames"

type ExploreSplitProps = { readonly children: ReactNode }

/** Two-column content group that collapses into a single reading column. */
const ExploreSplit = ({ children }: ExploreSplitProps) => <div className={CLASS_NAMES}>{children}</div>

export default ExploreSplit
