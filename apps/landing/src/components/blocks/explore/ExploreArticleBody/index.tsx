import type { ReactNode } from "react"
import { CLASS_NAMES } from "./classNames"

type ExploreArticleBodyProps = { readonly children: ReactNode }

/** Reading column that contains an Idea's numbered reasoning sections. */
const ExploreArticleBody = ({ children }: ExploreArticleBodyProps) => <div className={CLASS_NAMES}>{children}</div>

export default ExploreArticleBody
