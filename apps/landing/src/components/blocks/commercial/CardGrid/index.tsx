import type { HTMLAttributes } from "react"
import { CLASS_NAMES } from "./classNames"

type CardGridProps = HTMLAttributes<HTMLDivElement> & {
    readonly variant: "today" | "philosophy" | "values" | "intent"
}

/** Shared grid geometry for the commercial route's responsive card groups. */
export const CardGrid = (props: CardGridProps) => {
    const { variant, className, ...divProps } = props
    return <div {...divProps} className={CLASS_NAMES.root(variant, className)} />
}
