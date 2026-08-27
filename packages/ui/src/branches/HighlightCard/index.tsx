"use client"

import { motion, useReducedMotion, type MotionStyle } from "framer-motion"
import { Tree } from "../Tree"
import type { SectionBodyKey, SurfaceCardData } from "../SurfaceCard"
import { NivoCoreSurfaceCard as CoreSurfaceCard, type NivoCorePresentationState as PresentationState } from "../../contracts/grammar"
import { defineContractComponent, defineLeafComponent, type ContractBranchProps } from "../../contracts/props"

/** One contract-bound surface admitted by the named-section body vocabulary. */
export type HighlightCardProps<K extends SectionBodyKey> = ContractBranchProps<K> & {
    readonly props?: Pick<SurfaceCardData, "label" | "ariaLabel">
}

const SWEEP_STYLE = {
    position: "absolute",
    inset: -2,
    borderRadius: "min(32px, var(--starci-radius-3xl))",
    "--highlight-card-angle": "0deg",
    background: "conic-gradient(from var(--highlight-card-angle), transparent 0%, transparent 82%, var(--nivo-accent) 92%, transparent 100%)",
    pointerEvents: "none",
} as MotionStyle

/**
 * Place one legacy StarCi accent arc two pixels behind an already-owned card surface.
 * The wrapper adds no card chrome and mutes motion while loading or when motion is reduced.
 */
export const HighlightCard = <const K extends SectionBodyKey>({ props = {}, contract, render, isLoading = false }: HighlightCardProps<K>) => {
    const reduceMotion = useReducedMotion()
    const showsSweep = !isLoading
    const presentationState: PresentationState = isLoading ? "pending" : "neutral"
    const decoratedSurface = <Tree contract="highlight-card-shell" render={defineContractComponent("highlight-card-shell", {
        sweep: showsSweep
            ? defineLeafComponent("accent-sweep", {}, () => (
                <motion.span
                    aria-hidden
                    data-component="HighlightCardSweep"
                    style={SWEEP_STYLE}
                    animate={reduceMotion === true ? undefined : { "--highlight-card-angle": "360deg" }}
                    transition={reduceMotion === true ? undefined : { duration: 3, ease: "linear", repeat: Infinity }}
                />
            ))
            : undefined,
        surface: defineLeafComponent("highlight-card-surface", {}, () => {
            const identity = props.label === undefined
                ? { ariaLabel: props.ariaLabel ?? contract.replaceAll("-", " ") }
                : { label: props.label }
            return (
                <CoreSurfaceCard {...identity} frame="bounded" scroll="page" state={presentationState}>
                    <Tree contract={contract} render={render} />
                </CoreSurfaceCard>
            )
        }),
    })} />
    return decoratedSurface
}

/** Source-level tier marker for the single highlighted surface branch. */
export const meta = { shape: "branch", world: "pure" } as const
