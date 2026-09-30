import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react"
import { CLASS_NAMES, homeSpotlightClassName } from "./classNames"

/** The hero artwork the parallax carries. */
export type HomeMotionHeroParallaxBaseState = {
    readonly artwork: ReactNode
}

/** How far the scroll moves the artwork. */
export type HomeMotionHeroParallaxBaseData = {
    readonly distance: number
}

/** The locale's percent formatting, resolved by the connected half. */
export type HomeMotionHeroParallaxBaseActions = {
    readonly formatPercent: (value: number) => string
}

/** Props for {@link HomeMotionHeroParallaxBase}: the carried artwork and the locale formatter. */
export type HomeMotionHeroParallaxBaseProps = {
    readonly state: HomeMotionHeroParallaxBaseState
    readonly props: HomeMotionHeroParallaxBaseData
    readonly on: HomeMotionHeroParallaxBaseActions
}

/** Ties the hero artwork to scroll without taking over native scrolling. */
export const HomeMotionHeroParallaxBase = (props: HomeMotionHeroParallaxBaseProps) => {
    const { artwork } = props.state
    const { distance } = props.props
    const { formatPercent } = props.on
    const target = useRef<HTMLDivElement>(null)
    const reduceMotion = useReducedMotion() === true
    const { scrollYProgress } = useScroll({ target, offset: ["start end", "end start"] })
    const y = useTransform(scrollYProgress, [0, 1], [distance, -distance])
    const glowX = useMotionValue("54%")
    const glowY = useMotionValue("44%")
    const spotlightBackground = useMotionTemplate`radial-gradient(circle 10rem at ${glowX} ${glowY}, var(--landing-home-spotlight-start) 0, var(--landing-home-spotlight-middle) 24%, var(--landing-home-spotlight-accent) 44%, transparent 72%)`
    const [spotlightActive, setSpotlightActive] = useState(false)

    const moveSpotlight = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (reduceMotion || event.pointerType === "touch") return

        const bounds = event.currentTarget.getBoundingClientRect()
        const xPosition = ((event.clientX - bounds.left) / bounds.width) * 100
        const yPosition = ((event.clientY - bounds.top) / bounds.height) * 100
        glowX.set(formatPercent(xPosition))
        glowY.set(formatPercent(yPosition))
        setSpotlightActive(true)
    }

    const settleSpotlight = () => {
        glowX.set("54%")
        glowY.set("44%")
        setSpotlightActive(false)
    }

    return (
        <motion.div
            ref={target}
            className={CLASS_NAMES.heroStage}
            style={{ y: reduceMotion ? 0 : y }}
            onPointerMove={moveSpotlight}
            onPointerLeave={settleSpotlight}
            onPointerCancel={settleSpotlight}
        >
            <motion.span
                className={homeSpotlightClassName(spotlightActive)}
                style={{ backgroundImage: spotlightBackground }}
                aria-hidden="true"
            />
            {artwork}
        </motion.div>
    )
}
