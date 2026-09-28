import { DrawerBranch, nivoIconSource } from "@nivo/ui"
import { Sidebar as GrammarSidebar, type SidebarGroup } from "@starci/grammar/common"
import type { SidebarMode } from "./index"

/**
 * The priced console registry the connected half resolved from route, copy and persistence.
 *
 * Every world fact arrives already answered: group labels carry the reader's locale, `selectedKey`
 * names the live destination, `isCollapsed` the persisted preference, and `onAction` /
 * `onCollapsedChange` the two commands back into that world. This twin owns only the
 * rail-or-drawer projection.
 */
export type SidebarBaseProps = {
    readonly mode: SidebarMode
    readonly groups: ReadonlyArray<SidebarGroup>
    readonly selectedKey: string
    readonly isCollapsed: boolean
    readonly navigationLabel: string
    readonly openMenuLabel: string
    readonly closeMenuLabel: string
    readonly titleLabel: string
    readonly onAction: (id: string) => boolean
    readonly onCollapsedChange: (collapsed: boolean) => void
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
    const content = (presentation: "rail" | "drawer", close?: () => void) => <GrammarSidebar
        label={props.navigationLabel}
        groups={props.groups}
        selectedKey={props.selectedKey}
        presentation={presentation}
        isCollapsed={presentation === "rail" && props.isCollapsed}
        collapseLabel={props.closeMenuLabel}
        expandLabel={props.openMenuLabel}
        toggleSource={nivoIconSource("sidebar", "leading")}
        onAction={(id) => { if (props.onAction(id)) close?.() }}
        onCollapsedChange={props.onCollapsedChange}
    />

    if (props.mode === "mobile") return <DrawerBranch triggerLabel={props.openMenuLabel} title={props.titleLabel} closeLabel={props.closeMenuLabel} renderContent={(close) => content("drawer", close)} />
    return content("rail")
}
