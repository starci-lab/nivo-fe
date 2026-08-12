import { Tree } from "../../branches/Tree"
import { ChoiceTabs, type ChoiceTabData } from "../../leaves/ChoiceTabs"
import { defineContractComponent, defineLeafComponent, type CompositeProps } from "../../contracts/props"

/** Two settled controlled-choice axes over one result set. */
export type DualFilterTabsCardData = {
    readonly scopeLabel: string
    readonly scope: string
    readonly scopes: ReadonlyArray<ChoiceTabData>
    readonly categoryLabel: string
    readonly category: string
    readonly categories: ReadonlyArray<ChoiceTabData>
}
/** Selection changes reported by the two axes. */
export type DualFilterTabsCardActions = { readonly selectScope?: (key: string) => void; readonly selectCategory?: (key: string) => void }
/** Props for the closed two-axis filter card. */
export type DualFilterTabsCardProps = CompositeProps<DualFilterTabsCardData, DualFilterTabsCardActions>

/** Draw two controlled tab axes as one bordered control surface. */
export const DualFilterTabsCard = ({ props, on }: DualFilterTabsCardProps) => (
    <Tree contract="dual-filter-tabs-card" render={defineContractComponent("dual-filter-tabs-card", {
        scope: defineLeafComponent("choice-tabs", {}, () => (
            <ChoiceTabs props={{ label: props.scopeLabel, selectedKey: props.scope, tabs: props.scopes }} on={{ select: on?.selectScope }} />
        )),
        category: defineLeafComponent("choice-tabs", {}, () => (
            <ChoiceTabs props={{ label: props.categoryLabel, selectedKey: props.category, tabs: props.categories }} on={{ select: on?.selectCategory }} />
        )),
    })} />
)

/** Source-level tier marker for the pure composite. */
export const meta = { shape: "composite", world: "pure" } as const
