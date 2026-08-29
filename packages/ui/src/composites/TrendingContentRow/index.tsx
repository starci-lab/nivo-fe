import { Text } from "../../leaves/Text"
import { TextLink } from "../../leaves/TextLink"

/** Rank and title for one trending result. */
export type TrendingContentRowData = { readonly id: string; readonly rank?: string; readonly title?: string; readonly isTopRank?: boolean }
/** Journey reported when the reader opens the ranked result. */
export type TrendingContentRowActions = { readonly open?: () => void }
/** Props for the ranked-result row. */
export type TrendingContentRowProps = { readonly props: TrendingContentRowData; readonly on?: TrendingContentRowActions; readonly isLoading?: boolean }

/** Render one ranked actionable title. */
export const TrendingContentRow = (props: TrendingContentRowProps) => (
    <div>
        <Text props={{ content: props.props.rank, size: "sm", weight: "semibold", tone: props.props.isTopRank === true ? "accent" : "muted" }} isLoading={props.isLoading} />
        <TextLink props={{ label: props.props.title ?? "", size: "sm" }} on={{ press: props.on?.open }} />
    </div>
)