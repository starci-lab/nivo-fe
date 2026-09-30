"use client"

import { useFormatter } from "next-intl"
import type { ReactNode } from "react"
import { HomeMotionHeroParallaxBase } from "./component"

/** Hero artwork connected to native scroll progress. */
export type HomeMotionHeroParallaxProps = { readonly children: ReactNode; readonly distance?: number }

/** Resolve the active locale's formatter, then hand the artwork to the pure parallax. */
export const HomeMotionHeroParallax = (props: HomeMotionHeroParallaxProps) => {
    const formatter = useFormatter()
    return (
        <HomeMotionHeroParallaxBase
            state={{ artwork: props.children }}
            props={{ distance: props.distance ?? 34 }}
            on={{ formatPercent: (value) => `${formatter.number(value, { maximumFractionDigits: 2 })}%` }}
        />
    )
}
