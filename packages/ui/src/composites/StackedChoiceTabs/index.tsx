import { Tree } from "../../branches/Tree"
import { ChoiceTabs, type ChoiceTabsData } from "../../leaves/ChoiceTabs"
import { defineContractComponent, defineLeafComponent, type CompositeProps } from "../../contracts/props"

/** Two controlled peer-choice axes stacked over one result set. */
export type StackedChoiceTabsData = {
    readonly primary: ChoiceTabsData
    readonly secondary: ChoiceTabsData
}

/** Selection changes reported by the two stacked axes. */
export type StackedChoiceTabsActions = {
    readonly selectPrimary?: (key: string) => void
    readonly selectSecondary?: (key: string) => void
}

/** Props for the closed two-axis choice arrangement. */
export type StackedChoiceTabsProps = CompositeProps<StackedChoiceTabsData, StackedChoiceTabsActions>

/** Draw two controlled tab axes as one stacked choice surface. */
export const StackedChoiceTabs = ({ props, on }: StackedChoiceTabsProps) => (
    <Tree contract="stacked-choice-tabs" render={defineContractComponent("stacked-choice-tabs", {
        primary: defineLeafComponent("choice-tabs", {}, () => (
            <ChoiceTabs props={props.primary} on={{ select: on?.selectPrimary }} />
        )),
        secondary: defineLeafComponent("choice-tabs", {}, () => (
            <ChoiceTabs props={props.secondary} on={{ select: on?.selectSecondary }} />
        )),
    })} />
)

/** Source-level tier marker for the pure composite. */
export const meta = { shape: "composite", world: "pure" } as const
