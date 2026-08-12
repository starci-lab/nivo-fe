"use client"

import { Tabs } from "@heroui/react"
import type { LeafProps } from "../../contracts/props"

/** One text-only peer choice. */
export type ChoiceTabData = { readonly id: string; readonly label: string }
/** Resolved copy and selection for one fixed peer-choice control. */
export type ChoiceTabsData = {
    readonly label: string
    readonly selectedKey: string
    readonly tabs: ReadonlyArray<ChoiceTabData>
}
/** Selection reported by the peer-choice control. */
export type ChoiceTabsActions = { readonly select?: (key: string) => void }
/** Props for the peer-choice control. */
export type ChoiceTabsProps = LeafProps<ChoiceTabsData, ChoiceTabsActions>

/** Text-only peer choices. Business categories do not gain decorative glyphs. */
export const ChoiceTabs = ({ props, on }: ChoiceTabsProps) => (
    <Tabs selectedKey={props.selectedKey} onSelectionChange={(key) => on?.select?.(String(key))}>
        <Tabs.ListContainer>
            <Tabs.List aria-label={props.label}>
                {props.tabs.map((tab) => (
                    <Tabs.Tab key={tab.id} id={tab.id}>
                        {tab.label}
                        <Tabs.Indicator />
                    </Tabs.Tab>
                ))}
            </Tabs.List>
        </Tabs.ListContainer>
    </Tabs>
)

/** Source-level tier marker for the intrinsic peer-choice control. */
export const meta = { shape: "leaf", world: "pure" } as const
