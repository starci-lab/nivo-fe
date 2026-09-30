"use client"

import { motion, useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"
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
            initial={false}
            whileInView={reduceMotion ? undefined : { opacity: [0.56, 1], x: [x, 0], y: [y, 0] }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.7, delay: props.delay ?? 0, ease: [0.22, 1, 0.36, 1] }}
        >
            {props.children}
        </motion.div>
    )
}

/** Gives one operating-role card a restrained entrance without implying interactivity. */
export const HomeMotionRoleCard = (props: HomeMotionRoleCardProps) => {
    const reduceMotion = useReducedMotion() === true

    return (
        <motion.figure
            className={CLASS_NAMES.roleCard}
            initial={false}
            whileInView={reduceMotion ? undefined : { opacity: [0.5, 1], y: [34, 0] }}
            viewport={{ once: true, amount: 0.28 }}
            transition={{ duration: 0.62, delay: props.index * 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
            {props.children}
        </motion.figure>
    )
}
