import { Avatar } from "../../leaves/Avatar"
import { Badge } from "../../leaves/Badge"
import { Button } from "../../leaves/Button"
import { Text } from "../../leaves/Text"
import { TextLink } from "../../leaves/TextLink"

/** Resolved identity, qualification, and follow state for one suggested person. */
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
/** Journeys reported by a suggested-person row. */
export type SuggestedUserRowActions = { readonly open?: () => void; readonly follow?: () => void }
/** Props for a suggested-person row. */
export type SuggestedUserRowProps = { readonly props: SuggestedUserRowData; readonly on?: SuggestedUserRowActions; readonly isLoading?: boolean }

/** Render one suggested identity with its optional badge and follow action. */
export const SuggestedUserRow = (props: SuggestedUserRowProps) => (
    <div>
        <Avatar props={{ name: props.props.name, src: props.props.avatar, size: "sm" }} isLoading={props.isLoading} />
        <div>
            <TextLink props={{ label: props.props.name ?? "", size: "sm" }} on={{ press: props.on?.open }} />
            <Text props={{ content: props.props.username, size: "xs", tone: "muted" }} isLoading={props.isLoading} />
        </div>
        {props.props.openToWork === true ? <Badge props={{ content: props.props.openToWorkLabel, tone: "success" }} /> : null}
        <Button
            props={{ label: props.props.isFollowing === true ? props.props.followingLabel : props.props.followLabel, size: "sm", variant: "secondary", isPending: props.props.isPending }}
            on={{ press: props.props.isFollowing === true ? undefined : props.on?.follow }}
            isLoading={props.isLoading}
        />
    </div>
)