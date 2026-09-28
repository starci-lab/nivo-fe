import { DrawerBranch, nivoIconSource } from "@nivo/ui"
import { Sidebar as GrammarSidebar, type SidebarGroup } from "@starci/grammar/common"
import type { SidebarMode } from "./index"

/**
 * The priced console registry the connected half resolved from route, copy and persistence.
 *
 * Every world fact arrives already answered: group labels carry the reader's locale, `selectedKey`
 * names the live destination, `isCollapsed` the persisted preference, and `on.action` /
 * `on.collapsedChange` the two commands back into that world. This twin owns only the
 * rail-or-drawer projection.
 */
export type SidebarBaseData = {
    readonly groups: ReadonlyArray<SidebarGroup>
    readonly selectedKey: string
    readonly isCollapsed: boolean
    readonly navigationLabel: string
    readonly openMenuLabel: string
    readonly closeMenuLabel: string
    readonly titleLabel: string
}

/** The registry's two commands: activate a destination, or persist the rail's collapse. */
export type SidebarBaseActions = {
    readonly action: (id: string) => boolean
    readonly collapsedChange: (collapsed: boolean) => void
}

/** Public API role for SidebarBaseProps. */
export type SidebarBaseProps = {
    readonly state: SidebarMode
    readonly props: SidebarBaseData
    readonly on: SidebarBaseActions
}

/*
 * The installed `starci-fe/public-component-signature` rule reads the render half's own name and
 * demands the contract be spelled `<Unit>Props`, so this private alias is the only name the rule
 * accepts; the exported contract above stays `<Unit>BaseProps`, which the code-pattern check
 * requires the render half to own. Not exported: one public contract per unit.
 */
type SidebarProps = SidebarBaseProps

/**
 * Draw the priced registry through the shared Grammar sidebar renderer.
 *
 * The drawer is the same content under a trigger the rail never shows: `DrawerBranch` owns open,
 * focus and dismissal, and a destination that activates closes it after the route push begins.
 */
export const SidebarBase = (props: SidebarProps) => {
    const {
        state,
        props: data,
        on
    }: SidebarBaseProps = props
    const content = (presentation: "rail" | "drawer", close?: () => void) => <GrammarSidebar
        label={data.navigationLabel}
        groups={data.groups}
        selectedKey={data.selectedKey}
        presentation={presentation}
        isCollapsed={presentation === "rail" && data.isCollapsed}
        collapseLabel={data.closeMenuLabel}
        expandLabel={data.openMenuLabel}
        toggleSource={nivoIconSource("sidebar", "leading")}
        onAction={(id) => { if (on.action(id)) close?.() }}
        onCollapsedChange={on.collapsedChange}
    />

    if (state === "mobile") return <DrawerBranch triggerLabel={data.openMenuLabel} title={data.titleLabel} closeLabel={data.closeMenuLabel} renderContent={(close) => content("drawer", close)} />
    return content("rail")
}
