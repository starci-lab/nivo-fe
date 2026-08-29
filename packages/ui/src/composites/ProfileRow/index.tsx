import { Avatar } from "../../leaves/Avatar"
import { Icon } from "../../leaves/Icon"
import { Text } from "../../leaves/Text"

/** Resolved identity shown at the head of the dashboard rail. */
export type ProfileRowData = { readonly displayName?: string; readonly username?: string; readonly avatar?: string }
/** Profile navigation reported to the connected owner. */
export type ProfileRowActions = { readonly press?: () => void }
/** Props for the fixed dashboard profile cluster. */
export type ProfileRowProps = { readonly props: ProfileRowData; readonly on?: ProfileRowActions; readonly isLoading?: boolean }

/** Render a profile identity and disclosure control. */
export const ProfileRow = (props: ProfileRowProps) => (
    <button type="button" aria-label={props.props.displayName ?? "Profile"} onClick={props.on?.press} disabled={props.isLoading}>
        <Avatar props={{ name: props.props.displayName, src: props.props.avatar, size: "md" }} isLoading={props.isLoading} />
        <span>
            <Text props={{ content: props.props.displayName, size: "sm", weight: "semibold" }} isLoading={props.isLoading} />
            <Text props={{ content: props.props.username === undefined ? undefined : `@${props.props.username}`, size: "xs" }} isLoading={props.isLoading} />
        </span>
        <Icon props={{ name: "disclosure", role: "chip" }} />
    </button>
)