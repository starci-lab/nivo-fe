"use client"

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react"
import { CLASS_NAMES } from "./classNames"

type RevealDirection = "up" | "left" | "right"

/** Content revealed as the homepage hero enters the viewport. */
export type HomeMotionHeroRevealProps = { readonly children: ReactNode }
/** Content revealed as one narrative section enters the viewport. */
export type HomeMotionSectionRevealProps = {
    readonly children: ReactNode
    readonly delay?: number
    readonly direction?: RevealDirection
}
/** Hero artwork connected to native scroll progress. */
export type HomeMotionHeroParallaxProps = { readonly children: ReactNode; readonly distance?: number }
/** One operating-role card and its stagger position. */
export type HomeMotionRoleCardProps = { readonly children: ReactNode; readonly index: number }

/** Motion-safe reveal for the public homepage hero. */
export const HomeMotionHeroReveal = (props: HomeMotionHeroRevealProps) => {
    const reduceMotion = useReducedMotion() === true

    return (
        <motion.div
            className={CLASS_NAMES.heroCopy}
            initial={false}
            whileInView={reduceMotion ? undefined : { opacity: [0.56, 1], x: [-36, 0] }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
            {props.children}
        </motion.div>
    )
}

/** Motion-safe reveal for one homepage narrative group. */
export const HomeMotionSectionReveal = (props: HomeMotionSectionRevealProps) => {
    const reduceMotion = useReducedMotion() === true
    const direction = props.direction ?? "up"
    const x = direction === "left" ? -36 : direction === "right" ? 36 : 0
    const y = direction === "up" ? 28 : 0

    return (
        <motion.div
            className={CLASS_NAMES.reveal}
            initial={false}
            whileInView={reduceMotion ? undefined : { opacity: [0.56, 1], x: [x, 0], y: [y, 0] }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.7, delay: props.delay ?? 0, ease: [0.22, 1, 0.36, 1] }}
        >
            {props.children}
        </motion.div>
    )
}

/** Ties the hero artwork to scroll without taking over native scrolling. */
export const HomeMotionHeroParallax = (props: HomeMotionHeroParallaxProps) => {
    const target = useRef<HTMLDivElement>(null)
    const reduceMotion = useReducedMotion() === true
    const { scrollYProgress } = useScroll({ target, offset: ["start end", "end start"] })
    const distance = props.distance ?? 34
    const y = useTransform(scrollYProgress, [0, 1], [distance, -distance])

    const moveSpotlight = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (reduceMotion || event.pointerType === "touch") return

        const bounds = event.currentTarget.getBoundingClientRect()
        const x = ((event.clientX - bounds.left) / bounds.width) * 100
        const yPosition = ((event.clientY - bounds.top) / bounds.height) * 100
        event.currentTarget.style.setProperty("--hero-glow-x", `${x.toFixed(2)}%`)
        event.currentTarget.style.setProperty("--hero-glow-y", `${yPosition.toFixed(2)}%`)
        event.currentTarget.style.setProperty("--hero-glow-opacity", "0.92")
    }

    const settleSpotlight = (event: ReactPointerEvent<HTMLDivElement>) => {
        event.currentTarget.style.setProperty("--hero-glow-x", "54%")
        event.currentTarget.style.setProperty("--hero-glow-y", "44%")
        event.currentTarget.style.setProperty("--hero-glow-opacity", "0.34")
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
            <span className={CLASS_NAMES.heroSpotlight} aria-hidden="true" />
            {props.children}
        </motion.div>
    )
}

/** Gives one operating-role card a restrained entrance without implying interactivity. */
export const HomeMotionRoleCard = (props: HomeMotionRoleCardProps) => {
    const reduceMotion = useReducedMotion() === true

    return (
        <motion.figure
            initial={false}
            whileInView={reduceMotion ? undefined : { opacity: [0.5, 1], y: [34, 0] }}
            viewport={{ once: true, amount: 0.28 }}
            transition={{ duration: 0.62, delay: props.index * 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
            {props.children}
        </motion.figure>
    )
}
