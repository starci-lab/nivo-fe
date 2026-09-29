"use client"

import { Heading } from "@starci/grammar/common"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { createElement, useId, useState, useSyncExternalStore, type ComponentType, type CSSProperties } from "react"

import { RAIL_CLASS_NAME, RAIL_CONTROL_CLASS_NAME } from "./classNames"

/** Props for a persisted, accessible navigation rail. */
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
    readonly storageKey?: string
    readonly isDefaultCollapsed?: boolean
    readonly onCollapsedChange?: (collapsed: boolean) => void
}

const DEFAULT_STORAGE_KEY = "nivo:console-rail-collapsed"

/*
 * The persisted preference is external state: it lives in browser storage, not in React. The
 * `storage` event keeps other tabs in step, while `railListeners` carries same-tab writes the
 * event never fires for. `railMemory` is the fallback for an environment whose storage throws, so
 * the toggle still answers the click instead of reading the failure as "never stored".
 */
const railListeners = new Set<() => void>()
const railMemory = new Map<string, boolean>()

const subscribeRail = (onChange: () => void): (() => void) => {
    if (typeof window === "undefined") {
        return () => undefined
    }
    railListeners.add(onChange)
    window.addEventListener("storage", onChange)
    return () => {
        railListeners.delete(onChange)
        window.removeEventListener("storage", onChange)
    }
}

const readPersistedCollapsed = (key: string, fallback: boolean): boolean => {
    try {
        const value = globalThis.localStorage?.getItem(key)
        if (value === "true") return true
        if (value === "false") return false
    } catch {
        /* storage is optional */
    }
    return railMemory.get(key) ?? fallback
}

const writePersistedCollapsed = (key: string, collapsed: boolean): void => {
    railMemory.set(key, collapsed)
    try {
        globalThis.localStorage?.setItem(key, String(collapsed))
    } catch {
        /* storage is optional */
    }
    for (const listener of railListeners) listener()
}

/** Render a responsive navigation rail with persisted collapse state. */
export const CollapsibleRail = <R extends object, C extends object, T extends object>(
    props: CollapsibleRailProps<R, C, T>,
) => {
    const reduceMotion = useReducedMotion()
    const headingId = useId()
    const storageKey = props.storageKey ?? DEFAULT_STORAGE_KEY
    // The default answers only until storage says otherwise; it is the server snapshot as well, so
    // hydration and a mounted restore draw the same rail.
    const [defaultCollapsed] = useState(() => props.isDefaultCollapsed ?? false)
    const collapsed = useSyncExternalStore(
        subscribeRail,
        () => readPersistedCollapsed(storageKey, defaultCollapsed),
        () => defaultCollapsed,
    )
    const toggle = () => {
        const next = !collapsed
        writePersistedCollapsed(storageKey, next)
        props.onCollapsedChange?.(next)
    }
    const label = collapsed ? props.expandLabel : props.collapseLabel
    const railStyle: CSSProperties = {
        flexDirection: "column",
        minHeight: "100%",
        overflow: "hidden",
        borderInlineEnd: "1px solid var(--separator)",
        gap: "1.5rem",
        padding: collapsed ? "1.5rem 0.625rem" : "1.5rem",
    }
    const rail = collapsed
        ? createElement(props.collapsedRail, props.collapsedRailProps)
        : createElement(props.rail, props.railProps)
    const toggleControl = createElement(props.toggleControl, props.toggleControlProps)
    const Root = props.landmark === "none" ? motion.div : motion.aside
    return (
        <Root
            className={RAIL_CLASS_NAME}
            aria-labelledby={props.landmark === "none" ? undefined : headingId}
            aria-label={props.landmark === "none" ? undefined : props.ariaLabel}
            animate={{ width: collapsed ? 64 : 256 }}
            initial={false}
            transition={{ duration: reduceMotion === true ? 0 : 0.18, ease: "easeOut" }}
            style={railStyle}
        >
            <div id={headingId}>
                <Heading level={2} isVisuallyHidden>
                    {props.ariaLabel}
                </Heading>
            </div>
            <div>
                <AnimatePresence initial={false}>
                    {!collapsed && props.title === undefined ? null : <span>{collapsed ? null : props.title}</span>}
                </AnimatePresence>
                <button
                    className={RAIL_CONTROL_CLASS_NAME}
                    type="button"
                    aria-label={label}
                    aria-expanded={!collapsed}
                    onClick={toggle}
                >
                    {toggleControl}
                </button>
            </div>
            <div>{rail}</div>
        </Root>
    )
}
