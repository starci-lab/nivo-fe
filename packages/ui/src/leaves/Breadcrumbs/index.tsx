"use client"

import { Breadcrumbs as HeroBreadcrumbs, Link as HeroLink } from "@heroui/react"
import type { LeafProps } from "../../contracts/props"

/** One ordered step in a shallow path trail. */
export type BreadcrumbStep = {
    readonly id: string
    readonly label: string
    readonly isCurrent?: boolean
}

/** The two grammar-selected path forms owned by this leaf. */
export type BreadcrumbsData =
    | { readonly mode: "trail", readonly label: string, readonly steps: ReadonlyArray<BreadcrumbStep> }
    | { readonly mode: "back", readonly label: string, readonly backLabel: string }

/** Navigation reported without leaking an internal href through the vendor boundary. */
export type BreadcrumbsActions = {
    readonly activate?: (id: string) => void
    readonly back?: () => void
}

/** Props for the adaptive StarCi path-navigation owner. */
export type BreadcrumbsProps = LeafProps<BreadcrumbsData, BreadcrumbsActions>

/** Draw a shallow vendor breadcrumb trail or one deep-path back link. */
export const Breadcrumbs = ({ props, on }: BreadcrumbsProps) => props.mode === "back" ? (
    <HeroLink
        data-tier="leaf"
        data-component="Breadcrumbs"
        data-mode="back"
        aria-label={props.label}
        onPress={on?.back}
        className="text-sm text-muted"
    >
        {props.backLabel}
    </HeroLink>
) : (
    <HeroBreadcrumbs
        data-tier="leaf"
        data-component="Breadcrumbs"
        data-mode="trail"
        aria-label={props.label}
    >
        {props.steps.map((step) => (
            <HeroBreadcrumbs.Item
                key={step.id}
                id={step.id}
                onPress={step.isCurrent === true ? undefined : () => on?.activate?.(step.id)}
            >
                {step.label}
            </HeroBreadcrumbs.Item>
        ))}
    </HeroBreadcrumbs>
)

/** Source-level tier marker for the grammar-owned path-navigation leaf. */
export const meta = { shape: "leaf", world: "pure" } as const
