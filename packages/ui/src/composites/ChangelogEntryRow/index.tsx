import { Badge, type BadgeTone } from "../../leaves/Badge";
import { Text } from "../../leaves/Text";
import { TextLink } from "../../leaves/TextLink";
import type { ComponentProps } from "../component-props";
import { META_CLASS_NAME, ROOT_CLASS_NAME } from "./classNames";

/** Public ChangelogEntryRowData declaration. */
export type ChangelogEntryRowData = {readonly id: string;readonly dateLabel?: string;readonly categoryLabel?: string;readonly categoryTone?: BadgeTone;readonly title?: string;readonly body?: string;readonly isAction?: boolean;};
/** Public ChangelogEntryRowActions declaration. */
export type ChangelogEntryRowActions = {readonly open?: () => void;};
/** Public ChangelogEntryRowProps declaration. */
export type ChangelogEntryRowProps = ComponentProps<ChangelogEntryRowData, ChangelogEntryRowActions>;

/** Public ChangelogEntryRow declaration. */
export const ChangelogEntryRow = (props: ChangelogEntryRowProps) => ChangelogEntryRowView(props);
const ChangelogEntryRowView = ({ props, on, isLoading = false }: ChangelogEntryRowProps) =>
<div className={ROOT_CLASS_NAME}>
        <div className={META_CLASS_NAME}>
            <Text props={{ content: props.dateLabel, size: "xs", tone: "muted" }} isLoading={isLoading} />
            {props.categoryLabel === undefined ? null : <Badge props={{ content: props.categoryLabel, tone: props.categoryTone }} isLoading={isLoading} />}
        </div>
        {props.isAction === true && on?.open !== undefined ? <TextLink props={{ label: props.title ?? "", size: "sm" }} on={{ press: on.open }} /> : <Text props={{ content: props.title, size: "sm", weight: "medium" }} isLoading={isLoading} />}
        {props.body === undefined && !isLoading ? null : <Text props={{ content: props.body, size: "xs", tone: "muted" }} isLoading={isLoading} />}
    </div>;
