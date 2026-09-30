import { SettingsFormContentBase } from "./component"
import type { SettingsFormContentProps } from "./settings-form.types"

/** Hand resolved module settings and edit actions to the drawing half. */
export const SettingsFormContent = (props: SettingsFormContentProps) => {
    const { on, ...view } = props
    return <SettingsFormContentBase props={view} on={on} />
}
