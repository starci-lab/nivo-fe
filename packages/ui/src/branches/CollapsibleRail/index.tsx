"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect, useId, useState, type ComponentType, type CSSProperties } from "react"
import { NIVO_GRAMMAR_CONTRACTS, NIVO_GRAMMAR_TREATMENTS } from "../../contracts/grammar"

/** Fixed slots and labels owned by the collapsible navigation rail. */
export type CollapsibleRailProps<RailProps extends object, CompactProps extends object, ToggleProps extends object> = {
    readonly ariaLabel: string
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
    readonly defaultCollapsed?: boolean
    readonly onCollapsedChange?: (collapsed: boolean) => void
}

const EXPANDED_WIDTH = 256
const COLLAPSED_WIDTH = 64
const DEFAULT_STORAGE_KEY = "nivo:console-rail-collapsed"
const SPRING_TRANSITION = { type: "spring" as const, stiffness: 420, damping: 38 }
const INSTANT_TRANSITION = { duration: 0 }
const FADE_TRANSITION = { duration: 0.15 }
const NEUTRAL_TREATMENT = NIVO_GRAMMAR_TREATMENTS.neutral

const RAIL_STYLE: CSSProperties = {
    position: "sticky",
    top: 64,
    height: "calc(100dvh - 4rem)",
    flexShrink: 0,
    flexDirection: "column",
    overflow: "hidden",
    borderInlineEnd: "1px solid var(--separator)",
}

const HEADER_STYLE: CSSProperties = {
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    gap: "0.75rem",
}

const TITLE_STYLE: CSSProperties = {
    minWidth: 0,
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: "1.25rem",
    fontWeight: 700,
    lineHeight: "1.75rem",
}

const CONTROL_STYLE: CSSProperties = {
    display: "flex",
    width: 44,
    height: 44,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: 0,
    border: 0,
    borderRadius: 9999,
    cursor: "pointer",
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
export const CollapsibleRail = <RailProps extends object, CompactProps extends object, ToggleProps extends object>({
    ariaLabel,
    title,
    rail: Rail,
    railProps,
    collapsedRail: CompactRail,
    collapsedRailProps,
    toggleControl: ToggleControl,
    toggleControlProps,
    collapseLabel,
    expandLabel,
    storageKey = DEFAULT_STORAGE_KEY,
    defaultCollapsed = false,
    onCollapsedChange,
}: CollapsibleRailProps<RailProps, CompactProps, ToggleProps>) => {
    const reduceMotion = useReducedMotion()
    const headingId = useId()
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
    let headerJustification: CSSProperties["justifyContent"] = "space-between"
    if (collapsed) headerJustification = "center"
    else if (title === undefined) headerJustification = "flex-end"

    return (
        <motion.aside
            aria-labelledby={headingId}
            className="starci-core-rail"
            data-component="CollapsibleRail"
            data-grammar-contract={NIVO_GRAMMAR_CONTRACTS.rail.key}
            data-grammar-collapse={collapsed ? "collapsed" : "expanded"}
            data-grammar-landmark="complementary"
            data-grammar-motion={reduceMotion === true ? "reduced" : "animated"}
            data-grammar-rail="true"
            data-grammar-rail-mode="sticky"
            data-grammar-rail-width={collapsed ? "compact" : "standard"}
            data-grammar-state="neutral"
            data-grammar-treatment={NEUTRAL_TREATMENT.tone}
            data-collapsed={collapsed ? "true" : "false"}
            initial={false}
            animate={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
            transition={reduceMotion === true ? INSTANT_TRANSITION : SPRING_TRANSITION}
            style={{
                ...RAIL_STYLE,
                gap: "1.5rem",
                padding: collapsed ? "1.5rem 0.625rem" : "1.5rem",
            }}
        >
            <motion.div
                className="starci-core-rail-frame"
                data-grammar-rail-frame="true"
                initial={false}
                style={{ maxHeight: "none", minHeight: 0, flex: 1 }}
            >
                <motion.h2
                    className="sr-only"
                    data-grammar-rail-heading="true"
                    id={headingId}
                    initial={false}
                >
                    {ariaLabel}
                </motion.h2>
                <motion.div
                    style={{
                        ...HEADER_STYLE,
                        justifyContent: headerJustification,
                    }}
                >
                    <AnimatePresence initial={false}>
                        {!collapsed && title !== undefined ? (
                            <motion.div
                                key="title"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={reduceMotion === true ? INSTANT_TRANSITION : FADE_TRANSITION}
                                style={TITLE_STYLE}
                            >
                                {title}
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                    <button
                        type="button"
                        aria-label={label}
                        aria-expanded={!collapsed}
                        aria-pressed={collapsed}
                        data-component="CollapsibleRailControl"
                        onClick={onToggle}
                        style={CONTROL_STYLE}
                    >
                        <ToggleControl {...toggleControlProps} />
                    </button>
                </motion.div>
                <motion.div
                    className="starci-core-rail-body"
                    data-grammar-rail-body="true"
                    initial={false}
                >
                    {collapsed ? <CompactRail {...collapsedRailProps} /> : <Rail {...railProps} />}
                </motion.div>
            </motion.div>
        </motion.aside>
    )
}

/** Source-level tier marker for the stable navigation-width mechanic. */
export const meta = { shape: "branch", world: "pure" } as const
