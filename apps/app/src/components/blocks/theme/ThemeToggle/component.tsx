import { ThemeMenu, type ThemeMenuActions, type ThemeMenuData } from "@nivo/ui"

/** The settled appearance choice the toggle draws: its label, the current mode and the options offered. */
export type ThemeToggleBaseData = ThemeMenuData

/** The one action the toggle emits: the appearance the person picked. */
export type ThemeToggleBaseActions = ThemeMenuActions

/** Props for {@link ThemeToggleBase}. */
export type ThemeToggleBaseProps = {
    readonly props: ThemeToggleBaseData
    readonly on: ThemeToggleBaseActions
}

/** Pure appearance menu: system, light or dark, drawn from resolved copy and reporting the pick. */
export const ThemeToggleBase = (props: ThemeToggleBaseProps) => <ThemeMenu props={props.props} on={props.on} />
