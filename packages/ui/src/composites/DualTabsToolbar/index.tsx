import { Tree } from "../../branches/Tree"
import { ChoiceTabs, type ChoiceTabsData } from "../../leaves/ChoiceTabs"
import { defineContractComponent, defineLeafComponent, type CompositeProps } from "../../contracts/props"

/** Two controlled peer-choice axes sharing one toolbar row. */
export type DualTabsToolbarData = {
    readonly leading: ChoiceTabsData
    readonly trailing: ChoiceTabsData
}

/** Selection changes reported by the two axes. */
export type DualTabsToolbarActions = {
    readonly selectLeading?: (key: string) => void
    readonly selectTrailing?: (key: string) => void
}

/** Props for the closed two-axis toolbar arrangement. */
export type DualTabsToolbarProps = CompositeProps<DualTabsToolbarData, DualTabsToolbarActions>

/** Draw two primary peer-choice axes on the same toolbar. */
export const DualTabsToolbar = ({ props, on }: DualTabsToolbarProps) => (
    <Tree contract="dual-tabs-toolbar" render={defineContractComponent("dual-tabs-toolbar", {
        leading: defineLeafComponent("choice-tabs", {}, () => (
            <ChoiceTabs props={{ ...props.leading, variant: "primary" }} on={{ select: on?.selectLeading }} />
        )),
        trailing: defineLeafComponent("choice-tabs", {}, () => (
            <ChoiceTabs props={{ ...props.trailing, variant: "primary" }} on={{ select: on?.selectTrailing }} />
        )),
    })} />
)

/** Source-level tier marker for the pure composite. */
export const meta = { shape: "composite", world: "pure" } as const
