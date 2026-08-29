import { Button } from "../../leaves/Button";
import { IconTile } from "../../leaves/IconTile";
import { Text } from "../../leaves/Text";
import type { IconName } from "../../leaves/Icon";
import type { ComponentProps } from "../component-props";
import { ROOT_CLASS_NAME } from "./classNames";

/** Public EmptyNoticeData declaration. */
export type EmptyNoticeData = {readonly icon?: IconName;readonly message: string;readonly description?: string;readonly actionLabel?: string;};
/** Public EmptyNoticeActions declaration. */
export type EmptyNoticeActions = {readonly act?: () => void;};
/** Public EmptyNoticeProps declaration. */
export type EmptyNoticeProps = ComponentProps<EmptyNoticeData, EmptyNoticeActions>;

/** Public EmptyNotice declaration. */
export const EmptyNotice = (props: EmptyNoticeProps) => EmptyNoticeView(props);
const EmptyNoticeView = ({ props, on }: EmptyNoticeProps) =>
<div className={ROOT_CLASS_NAME}>
        {props.icon === undefined ? null : <IconTile props={{ icon: props.icon, tone: "neutral", size: "md" }} />}
        <Text props={{ content: props.message, tone: "muted", size: "sm" }} />
        {props.description === undefined ? null : <Text props={{ content: props.description, tone: "muted", size: "xs" }} />}
        {props.actionLabel === undefined ? null : <Button props={{ label: props.actionLabel, variant: "secondary", size: "sm", icon: "retry" }} on={{ press: on?.act }} />}
    </div>;
