import { CLASS_NAMES as C } from "./classNames"

type ExploreQuoteProps = { readonly children: string }

/** Large pull quote with a decorative mark. */
const ExploreQuote = ({ children }: ExploreQuoteProps) => (
    <blockquote className={C.quote}>
        <span className={C.mark} aria-hidden="true">
            “
        </span>
        {children}
    </blockquote>
)

export default ExploreQuote
