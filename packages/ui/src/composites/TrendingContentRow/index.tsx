import { Tree } from "../../branches/Tree"
import { Text } from "../../leaves/Text"
import { TextLink } from "../../leaves/TextLink"
import { defineContractComponent, defineLeafComponent, type CompositeProps } from "../../contracts/props"

/** Rank and title for one trending result. */
export type TrendingContentRowData = {
    readonly id: string
    readonly rank?: string
    readonly title?: string
    readonly isTopRank?: boolean
}
/** Journey reported when the reader opens the ranked result. */
export type TrendingContentRowActions = { readonly open?: () => void }
/** Props for the closed ranked-result composition. */
export type TrendingContentRowProps = CompositeProps<TrendingContentRowData, TrendingContentRowActions>

/** Draw one ranked actionable title; the first three ranks retain the legacy accent treatment. */
export const TrendingContentRow = ({ props, on, isLoading = false }: TrendingContentRowProps) => (
    <Tree contract="rank-title-row" render={defineContractComponent("rank-title-row", {
        rank: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
            <Text props={{ content: props.rank, size: "sm", weight: "semibold", tone: props.isTopRank === true ? "accent" : "muted" }} isLoading={isLoading} />
        )),
        title: defineLeafComponent("text-link", { size: "sm" }, () => (
            <TextLink props={{ label: props.title ?? "", size: "sm" }} on={{ press: on?.open }} />
        )),
    })} />
)

/** Source-level tier marker for the pure ranked-result composition. */
export const meta = { shape: "composite", world: "pure" } as const
