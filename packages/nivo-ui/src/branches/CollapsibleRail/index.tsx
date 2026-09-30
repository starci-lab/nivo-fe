"use client"

import { Button, Heading } from "@starci/grammar/common"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { createElement, useId, type ComponentType, type CSSProperties } from "react"

import { RAIL_CLASS_NAME, SCREEN_READER_ONLY_CLASS_NAME } from "./classNames"

/** Props for an accessible navigation rail whose collapsed state the caller owns. */
export type CollapsibleRailProps<RailProps extends object, CompactProps extends object, ToggleProps extends object> = {
    readonly ariaLabel: string
    /** Whether this standalone rail owns a complementary landmark. */
    readonly landmark?: "complementary" | "none"
    readonly title?: string
    readonly rail: ComponentType<RailProps>
    readonly railProps: RailProps
    readonly collapsedRail: ComponentType<CompactProps>
    readonly collapsedRailProps: CompactProps
    readonly toggleControl: ComponentType<ToggleProps>
    readonly toggleControlProps: ToggleProps
    readonly collapseLabel: string
    readonly expandLabel: string
    /** Whether the rail is drawn in its compact form. Controlled: the caller decides where it is kept. */
    readonly collapsed: boolean
    /** Called with the state the reader asked for; the caller stores it and passes it back as `collapsed`. */
    readonly onCollapsedChange: (collapsed: boolean) => void
}

/** Render a responsive navigation rail; the collapse state is controlled by the caller. */
export const CollapsibleRail = <R extends object, C extends object, T extends object>(
    props: CollapsibleRailProps<R, C, T>,
) => {
    const reduceMotion = useReducedMotion()
    const headingId = useId()
    const collapsed = props.collapsed
    const toggle = () => {
        props.onCollapsedChange(!collapsed)
    }
    const label = collapsed ? props.expandLabel : props.collapseLabel
    const railStyle: CSSProperties = {
        flexDirection: "column",
        minHeight: "100%",
        overflow: "hidden",
        gap: "1.5rem",
        padding: collapsed ? "1.5rem 0.625rem" : "1.5rem",
    }
    const rail = collapsed
        ? createElement(props.collapsedRail, props.collapsedRailProps)
        : createElement(props.rail, props.railProps)
    const toggleControl = createElement(props.toggleControl, props.toggleControlProps)
    const labelledBy = props.landmark === "none" ? undefined : headingId
    const accessibleName = props.landmark === "none" ? undefined : props.ariaLabel
    const motionTransition = { duration: reduceMotion === true ? 0 : 0.18, ease: "easeOut" as const }
    const content = (
        <>
            <div id={headingId}>
                <Heading level={2} isVisuallyHidden>
                    {props.ariaLabel}
                </Heading>
            </div>
            <div>
                <AnimatePresence initial={false}>
                    {!collapsed && props.title === undefined ? null : <span>{collapsed ? null : props.title}</span>}
                </AnimatePresence>
                <Button type="button" variant="ghost" size="md" onPress={toggle}>
                    <span className={SCREEN_READER_ONLY_CLASS_NAME}>{label}</span>
                    <span aria-hidden="true">{toggleControl}</span>
                </Button>
            </div>
            <div>{rail}</div>
        </>
    )
    if (props.landmark === "none") {
        return (
            <motion.div
                className={RAIL_CLASS_NAME}
                aria-labelledby={labelledBy}
                aria-label={accessibleName}
                animate={{ width: collapsed ? 64 : 256 }}
                initial={false}
                transition={motionTransition}
                style={railStyle}
            >
                {content}
            </motion.div>
        )
    }
    return (
        <motion.aside
            className={RAIL_CLASS_NAME}
            aria-labelledby={labelledBy}
            aria-label={accessibleName}
            animate={{ width: collapsed ? 64 : 256 }}
            initial={false}
            transition={motionTransition}
            style={railStyle}
        >
            {content}
        </motion.aside>
    )
}
