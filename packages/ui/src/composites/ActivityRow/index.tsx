import { Avatar } from "../../leaves/Avatar";
import { ReactionPicker, type ReactionChoiceData } from "../../leaves/ReactionPicker";
import { Text } from "../../leaves/Text";
import { TextLink } from "../../leaves/TextLink";
import type { ComponentProps } from "../component-props";
import { BODY_CLASS_NAME, ROOT_CLASS_NAME, SENTENCE_CLASS_NAME } from "./classNames";
import type { ReactionType } from "../../leaves/ReactionPicker/reaction-type";

/** Public ActivityRowData declaration. */
export type ActivityRowData = {readonly id: string;readonly actor?: string;readonly avatar?: string;readonly action?: string;readonly target?: string;readonly time?: string;readonly reactionLabel?: string;readonly reactionCount?: number;readonly selectedReaction?: ReactionType | null;readonly reactionChoices?: ReadonlyArray<ReactionChoiceData>;readonly isMine?: boolean;readonly isReacting?: boolean;};
/** Public ActivityRowActions declaration. */
export type ActivityRowActions = {readonly openActor?: () => void;readonly openTarget?: () => void;readonly react?: (type: ReactionType | null) => void;};
/** Public ActivityRowProps declaration. */
export type ActivityRowProps = ComponentProps<ActivityRowData, ActivityRowActions>;

/** Public ActivityRow declaration. */
export const ActivityRow = (props: ActivityRowProps) => ActivityRowView(props);
const ActivityRowView = ({ props, on, isLoading = false }: ActivityRowProps) =>
<div className={ROOT_CLASS_NAME}>
        <Avatar props={{ name: props.actor, src: props.avatar, size: "sm" }} isLoading={isLoading} />
        <div className={BODY_CLASS_NAME}>
            <div className={SENTENCE_CLASS_NAME}>
                <TextLink props={{ label: props.actor ?? "", size: "sm" }} on={{ press: on?.openActor }} />
                <Text props={{ content: props.action, size: "sm" }} isLoading={isLoading} />
                {props.target === undefined ? null : <TextLink props={{ label: props.target, size: "sm" }} on={{ press: on?.openTarget }} />}
            </div>
            {props.reactionLabel === undefined || props.reactionChoices === undefined ? null :
    <ReactionPicker props={{ label: props.reactionLabel, count: props.reactionCount ?? 0, selected: props.selectedReaction, choices: props.reactionChoices, isPending: props.isReacting }} on={props.isMine === true ? undefined : { select: on?.react }} />
    }
        </div>
        <Text props={{ content: props.time, size: "xs", tone: "muted" }} isLoading={isLoading} />
    </div>;
