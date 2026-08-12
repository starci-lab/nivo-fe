import { Avatar } from "../../leaves/Avatar"
import { Tree } from "../../branches/Tree"
import { Badge } from "../../leaves/Badge"
import { Button } from "../../leaves/Button"
import { Text } from "../../leaves/Text"
import { TextLink } from "../../leaves/TextLink"
import { defineContractComponent, defineLeafComponent, type CompositeProps } from "../../contracts/props"

/** Resolved identity, qualification and follow state for one suggested person. */
export type SuggestedUserRowData = {
    readonly id: string
    readonly name?: string
    readonly username?: string
    readonly avatar?: string
    readonly openToWork?: boolean
    readonly openToWorkLabel?: string
    readonly followLabel: string
    readonly followingLabel: string
    readonly isFollowing?: boolean
    readonly isPending?: boolean
}
/** Product journeys reported by a suggested-person row. */
export type SuggestedUserRowActions = { readonly open?: () => void; readonly follow?: () => void }
/** Props for the closed suggested-person composition. */
export type SuggestedUserRowProps = CompositeProps<SuggestedUserRowData, SuggestedUserRowActions>

/** Draw one suggested identity with its optional badge and follow action. */
export const SuggestedUserRow = ({ props, on, isLoading = false }: SuggestedUserRowProps) => {
    const identity = defineContractComponent("name-over-handle", {
        name: defineLeafComponent("text-link", { size: "sm" }, () => (
            <TextLink props={{ label: props.name ?? "", size: "sm" }} on={{ press: on?.open }} />
        )),
        handle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
            <Text props={{ content: props.username, size: "xs", tone: "muted" }} isLoading={isLoading} />
        )),
    })

    return (
        <Tree contract="avatar-identity-badge-action-row" render={defineContractComponent("avatar-identity-badge-action-row", {
            avatar: defineLeafComponent("avatar", {}, () => (
                <Avatar props={{ name: props.name, src: props.avatar, size: "sm" }} isLoading={isLoading} />
            )),
            identity,
            ...(props.openToWork === true ? {
                badge: defineLeafComponent("badge", {}, () => (
                    <Badge props={{ content: props.openToWorkLabel, tone: "success" }} />
                )),
            } : {}),
            action: defineLeafComponent("button", {}, () => (
                <Button
                    props={{
                        label: props.isFollowing === true ? props.followingLabel : props.followLabel,
                        size: "sm",
                        variant: "secondary",
                        isPending: props.isPending,
                    }}
                    on={{ press: props.isFollowing === true ? undefined : on?.follow }}
                    isLoading={isLoading}
                />
            )),
        })} />
    )
}

/** Source-level tier marker for the pure suggested-person composition. */
export const meta = { shape: "composite", world: "pure" } as const
