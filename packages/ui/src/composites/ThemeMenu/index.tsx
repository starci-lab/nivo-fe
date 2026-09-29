import { Icon } from "@starci/grammar/common"
import { DropdownBranch } from "../../branches/DropdownBranch"
import { IconSource } from "../../leaves/Icon"

/** Every appearance a person can ask for; `system` follows the device and is the default. */
export const THEME_MODES = ["system", "light", "dark"] as const

/** One appearance a person can ask for. */
export type ThemeMode = (typeof THEME_MODES)[number]

/** One appearance in the menu, with its resolved copy. */
export type ThemeMenuOption = { readonly id: ThemeMode; readonly label: string }

/** Resolved copy and state for the appearance menu. */
export type ThemeMenuData = {
    /** The accessible name of the trigger and of the menu. */
    readonly label: string
    /** The appearance the person chose, which is `system` until they choose. */
    readonly mode: ThemeMode
    /** Whether the appearance actually showing is dark, which decides the trigger glyph. */
    readonly isDark: boolean
    readonly options: ReadonlyArray<ThemeMenuOption>
}

/** The choice the menu reports. */
export type ThemeMenuActions = { readonly select?: (mode: ThemeMode) => void }

/** Props for the appearance menu. */
export type ThemeMenuProps = {
    readonly props: ThemeMenuData
    readonly on?: ThemeMenuActions
}

const lightTrigger = <Icon source={IconSource("light", "leading")} usage="leading" />
const darkTrigger = <Icon source={IconSource("dark", "leading")} usage="leading" />

/**
 * The appearance menu: system, light or dark, as one single-choice menu.
 *
 * The trigger draws the appearance that is showing (sun or moon) while the checked item says what
 * was asked for, because "system" and "the theme the device resolved to" are different answers and a
 * person on a dark device who chose system must still see that system, not dark, is selected.
 */
export const ThemeMenu = ({ props, on }: ThemeMenuProps) => (
    <DropdownBranch
        props={{
            label: props.label,
            selectionMode: "single",
            selectedId: props.mode,
            sections: [{ items: props.options.map((option) => ({ ...option, showsIndicator: true })) }],
        }}
        on={{ action: (mode) => on?.select?.(mode) }}
        trigger={props.isDark ? darkTrigger : lightTrigger}
    />
)
