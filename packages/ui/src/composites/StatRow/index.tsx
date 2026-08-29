import { Icon, type IconName } from "../../leaves/Icon"
import { Text } from "../../leaves/Text"

/** Resolved icon, label, and figure for one statistic. */
export type StatRowData = { readonly icon: IconName; readonly label: string; readonly value?: string }
/** Props for one statistic row. */
export type StatRowProps = { readonly props: StatRowData; readonly isLoading?: boolean }

/** Render one standing figure with its meaning. */
export const StatRow = (props: StatRowProps) => (
    <div>
        <Icon props={{ name: props.props.icon, role: "leading" }} />
        <Text props={{ content: props.props.label, size: "md" }} />
        <Text props={{ content: props.props.value, size: "xs" }} isLoading={props.isLoading} />
    </div>
)