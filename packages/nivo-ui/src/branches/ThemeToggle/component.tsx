import type { ThemeMenuActions, ThemeMenuData } from "../ThemeMenu"
import { ThemeMenu } from "../ThemeMenu"

type ThemeToggleViewProps = {
    readonly props: ThemeMenuData
    readonly on: ThemeMenuActions
}

const ThemeToggleView = ({ props, on }: ThemeToggleViewProps) => <ThemeMenu props={props} on={on} />

export default ThemeToggleView
