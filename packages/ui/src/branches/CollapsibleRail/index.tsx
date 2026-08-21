"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState, type CSSProperties, type ReactNode } from "react"

/** Fixed slots and labels owned by the collapsible navigation rail. */
export type CollapsibleRailProps = {
    readonly ariaLabel: string
    readonly rail: ReactNode
    readonly collapsedRail: ReactNode
    readonly collapseControl: ReactNode
    readonly expandControl: ReactNode
    readonly collapseLabel: string
    readonly expandLabel: string
    readonly storageKey?: string
    readonly defaultCollapsed?: boolean
    readonly onCollapsedChange?: (collapsed: boolean) => void
}

const EXPANDED_WIDTH = 256
const COLLAPSED_WIDTH = 64
const DEFAULT_STORAGE_KEY = "nivo:console-rail-collapsed"

const RAIL_STYLE: CSSProperties = {
    position: "sticky",
    top: 64,
    height: "calc(100dvh - 4rem)",
    flexShrink: 0,
    flexDirection: "column",
    overflow: "hidden",
    padding: "1.5rem 0.75rem",
}

const CONTROL_STYLE: CSSProperties = {
    display: "flex",
    width: "100%",
    minHeight: 40,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
    borderRadius: "var(--radius-large)",
}

/** Read a persisted disclosure without allowing unavailable browser storage to break navigation. */
const readPersistedState = (storageKey: string): boolean | undefined => {
    try {
        const persisted = globalThis.localStorage?.getItem(storageKey)
        if (persisted === "true") return true
        if (persisted === "false") return false
    } catch {
        return undefined
    }

    return undefined
}

/** Persist disclosure when storage is available; privacy and security restrictions remain harmless. */
const persistState = (storageKey: string, collapsed: boolean): void => {
    try {
        globalThis.localStorage?.setItem(storageKey, String(collapsed))
    } catch {
        // A blocked storage surface must not block the navigation control.
    }
}

/** Draw one stable desktop rail whose visible destination form follows its persisted width state. */
export const CollapsibleRail = ({
    ariaLabel,
    rail,
    collapsedRail,
    collapseControl,
    expandControl,
    collapseLabel,
    expandLabel,
    storageKey = DEFAULT_STORAGE_KEY,
    defaultCollapsed = false,
    onCollapsedChange,
}: CollapsibleRailProps) => {
    const reduceMotion = useReducedMotion()
    const [collapsed, setCollapsed] = useState(defaultCollapsed)

    useEffect(() => {
        const persisted = readPersistedState(storageKey)
        if (persisted !== undefined) setCollapsed(persisted)
    }, [storageKey])

    const onToggle = () => {
        setCollapsed((current) => {
            const next = !current
            persistState(storageKey, next)
            onCollapsedChange?.(next)
            return next
        })
    }

    const label = collapsed ? expandLabel : collapseLabel

    return (
        <motion.aside
            aria-label={ariaLabel}
            data-component="CollapsibleRail"
            data-collapsed={collapsed ? "true" : "false"}
            initial={false}
            animate={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
            transition={reduceMotion === true
                ? { duration: 0 }
                : { type: "spring", stiffness: 360, damping: 36 }}
            style={RAIL_STYLE}
        >
            {collapsed ? collapsedRail : rail}
            <button
                type="button"
                aria-label={label}
                aria-expanded={!collapsed}
                aria-pressed={collapsed}
                data-component="CollapsibleRailControl"
                onClick={onToggle}
                style={CONTROL_STYLE}
            >
                {collapsed ? expandControl : collapseControl}
            </button>
        </motion.aside>
    )
}

/** Source-level tier marker for the stable navigation-width mechanic. */
export const meta = { shape: "branch", world: "pure" } as const
