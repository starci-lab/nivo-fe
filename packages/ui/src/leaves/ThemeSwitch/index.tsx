import { Switch } from "@heroui/react"
import { Icon } from "../Icon"
import type { LeafProps } from "../../contracts/props"

/** Current appearance and accessible copy for the navbar switch. */
export type ThemeSwitchData = {
    readonly isDark: boolean
    readonly label: string
}

/** What changing the appearance switch reports. */
export type ThemeSwitchActions = {
    readonly change?: (isDark: boolean) => void
}

/** Fixed props for the light/dark switch. */
export type ThemeSwitchProps = LeafProps<ThemeSwitchData, ThemeSwitchActions>

/** Draw the same native HeroUI switch used by the legacy navbar. */
export const ThemeSwitch = ({ props, on }: ThemeSwitchProps) => (
    <Switch
        data-tier="leaf"
        data-component="ThemeSwitch"
        isSelected={props.isDark}
        onChange={on?.change}
        aria-label={props.label}
    >
        {({ isSelected }) => (
            <Switch.Content>
                <Switch.Control>
                    <Switch.Thumb>
                        <Switch.Icon>
                            <Icon props={{ name: isSelected ? "dark" : "light", role: "leading" }} />
                        </Switch.Icon>
                    </Switch.Thumb>
                </Switch.Control>
            </Switch.Content>
        )}
    </Switch>
)

/** Source-level tier marker for the theme switch. */
export const meta = { shape: "leaf", world: "pure" } as const
