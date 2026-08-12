import { Avatar } from "../../leaves/Avatar"
import { Tree } from "../../branches/Tree"
import { ReactionPicker, type ReactionChoiceData } from "../../leaves/ReactionPicker"
import { Text } from "../../leaves/Text"
import { TextLink } from "../../leaves/TextLink"
import { defineContractComponent, defineLeafComponent, type CompositeProps } from "../../contracts/props"
import type { ReactionType } from "../../leaves/ReactionPicker/reaction-type"

/** Resolved actor, event and reaction state drawn by one activity row. */
export type ActivityRowData = {
    readonly id: string
    readonly actor?: string
    readonly avatar?: string
    readonly action?: string
    readonly target?: string
    readonly time?: string
    readonly reactionLabel?: string
    readonly reactionCount?: number
    readonly selectedReaction?: ReactionType | null
    readonly reactionChoices?: ReadonlyArray<ReactionChoiceData>
    readonly isMine?: boolean
    readonly isReacting?: boolean
}
/** Product journeys reported by an activity row. */
export type ActivityRowActions = { readonly openActor?: () => void; readonly openTarget?: () => void; readonly react?: (type: ReactionType | null) => void }
/** Props for the closed activity-row composition. */
export type ActivityRowProps = CompositeProps<ActivityRowData, ActivityRowActions>

/** Draw one actor sentence, its optional reaction and quiet timestamp. */
export const ActivityRow = ({ props, on, isLoading = false }: ActivityRowProps) => {
    const sentence = defineContractComponent("activity-actor-action-target-sentence", {
        actor: defineLeafComponent("text-link", { size: "sm" }, () => (
            <TextLink props={{ label: props.actor ?? "", size: "sm" }} on={{ press: on?.openActor }} />
        )),
        action: defineLeafComponent("text", { size: "sm" }, () => (
            <Text props={{ content: props.action, size: "sm" }} isLoading={isLoading} />
        )),
        ...(props.target === undefined ? {} : {
            target: defineLeafComponent("text-link", { size: "sm" }, () => (
                <TextLink props={{ label: props.target ?? "", size: "sm" }} on={{ press: on?.openTarget }} />
            )),
        }),
    })
    const body = defineContractComponent("activity-sentence-over-reaction", {
        sentence,
        ...(props.reactionLabel === undefined || props.reactionChoices === undefined ? {} : {
            reaction: defineLeafComponent("reaction-picker", {}, () => (
                <ReactionPicker props={{
                    label: props.reactionLabel ?? "",
                    count: props.reactionCount ?? 0,
                    selected: props.selectedReaction,
                    choices: props.reactionChoices ?? [],
                    isPending: props.isReacting,
                }} on={props.isMine === true ? undefined : { select: on?.react }} />
            )),
        }),
    })

    return (
        <Tree contract="activity-actor-body-time-row" render={defineContractComponent("activity-actor-body-time-row", {
            avatar: defineLeafComponent("avatar", {}, () => (
                <Avatar props={{ name: props.actor, src: props.avatar, size: "sm" }} isLoading={isLoading} />
            )),
            body,
            time: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: props.time, size: "xs", tone: "muted" }} isLoading={isLoading} />
            )),
        })} />
    )
}

/** Source-level tier marker for the pure activity-row composition. */
export const meta = { shape: "composite", world: "pure" } as const
