import { Avatar } from "../../leaves/Avatar"
import { Icon } from "../../leaves/Icon"
import { Text } from "../../leaves/Text"
import type { CompositeProps } from "../../contracts/props"
import { PressableSurface } from "../../branches/PressableSurface"
import { defineContractComponent, defineLeafComponent } from "../../contracts/props"

/** Resolved identity shown at the head of the dashboard rail. */
export type ProfileRowData = {
    readonly displayName?: string
    readonly username?: string
    readonly avatar?: string
}

/** Internal profile navigation reported to the connected owner. */
export type ProfileRowActions = {
    readonly press?: () => void
}

/** Props for the fixed dashboard profile cluster. */
export type ProfileRowProps = CompositeProps<ProfileRowData, ProfileRowActions>

/** Fixed profile cluster copied from the legacy rail: avatar, name/handle, disclosure. */
export const ProfileRow = ({ props, on, isLoading = false }: ProfileRowProps) => {
    const identity = defineContractComponent("profile-name-over-handle", {
        name: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: props.displayName, size: "sm", weight: "semibold" }} isLoading={isLoading} />),
        handle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: props.username === undefined ? undefined : `@${props.username}`, size: "xs" }} isLoading={isLoading} />),
    })
    const content = defineContractComponent("profile-avatar-name-handle-disclosure-row", {
        avatar: defineLeafComponent("avatar", {}, () => <Avatar props={{ name: props.displayName, src: props.avatar, size: "md" }} isLoading={isLoading} />),
        identity,
        disclosure: defineLeafComponent("icon", {}, () => <Icon props={{ name: "disclosure", role: "chip" }} />),
    })
    return <PressableSurface contract="profile-avatar-name-handle-disclosure-row" render={content} label={props.displayName ?? "Profile"} press={on?.press} />
}

/** Source-level tier marker for the fixed profile-row composition. */
export const meta = { shape: "composite", world: "pure" } as const
