import type { HTMLAttributes } from "react"
import { CLASS_NAMES } from "./classNames"

type HeroBandProps = HTMLAttributes<HTMLElement> & {
    readonly variant: "company" | "contact"
}

/** Shared visual frame for the public commercial route heroes. */
export const HeroBand = (props: HeroBandProps) => {
    const { variant, className, ...sectionProps } = props
    return <section {...sectionProps} className={CLASS_NAMES.root(variant, className)} />
}
