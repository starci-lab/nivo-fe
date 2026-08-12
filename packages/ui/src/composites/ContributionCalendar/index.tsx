import { Tree } from "../../branches/Tree"
import { ChoiceTabs } from "../../leaves/ChoiceTabs"
import { ContributionGrid } from "../../leaves/ContributionGrid"
import { ContributionIntensityLegend } from "../../leaves/ContributionIntensityLegend"
import { Text } from "../../leaves/Text"
import {
    defineContractComponent,
    defineLeafComponent,
    type CompositeProps,
} from "../../contracts/props"

/** One contribution day with an accessible, already-resolved description. */
export type ContributionCalendarDay = {
    readonly date: string
    readonly count: number
    readonly label: string
}

/** Resolved labels and values for one yearly activity calendar. */
export type ContributionCalendarData = {
    readonly year: number
    readonly years: ReadonlyArray<number>
    readonly totalLabel?: string
    readonly streakLabel?: string
    readonly lessLabel?: string
    readonly moreLabel?: string
    readonly monthLabels?: ReadonlyArray<string>
    readonly weekdayLabels?: ReadonlyArray<string>
    readonly days?: ReadonlyArray<ContributionCalendarDay>
}

/** What changing the contribution year reports. */
export type ContributionCalendarActions = {
    readonly selectYear?: (year: number) => void
}

/** Props for the closed contribution-calendar composition. */
export type ContributionCalendarProps = CompositeProps<ContributionCalendarData, ContributionCalendarActions>

/** Draw the fixed year summary, intrinsic plot and its reading key. */
export const ContributionCalendar = ({ props, on, isLoading = false }: ContributionCalendarProps) => {
    const heading = defineContractComponent("contribution-calendar-heading-row", {
        total: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
            <Text props={{ content: props.totalLabel, size: "xs", tone: "muted" }} isLoading={isLoading} />
        )),
        years: defineLeafComponent("choice-tabs", {}, () => (
            <ChoiceTabs
                props={{
                    label: props.totalLabel ?? "",
                    selectedKey: String(props.year),
                    tabs: props.years.map((year) => ({ id: String(year), label: String(year) })),
                }}
                on={{ select: (key) => on?.selectYear?.(Number(key)) }}
            />
        )),
    })
    const footer = defineContractComponent("contribution-calendar-footer-row", {
        streak: defineLeafComponent("text", { size: "sm" }, () => (
            <Text props={{ content: props.streakLabel, size: "sm" }} isLoading={isLoading} />
        )),
        intensity: defineLeafComponent("contribution-intensity-legend", {}, () => (
            <ContributionIntensityLegend
                props={{ lessLabel: props.lessLabel, moreLabel: props.moreLabel }}
                isLoading={isLoading}
            />
        )),
    })
    const content = defineContractComponent("contribution-calendar-stack", {
        heading,
        grid: defineLeafComponent("contribution-grid", {}, () => (
            <ContributionGrid
                props={{
                    year: props.year,
                    monthLabels: props.monthLabels ?? [],
                    weekdayLabels: props.weekdayLabels ?? [],
                    days: props.days ?? [],
                }}
                isLoading={isLoading}
            />
        )),
        footer,
    })

    return <Tree contract="contribution-calendar-stack" render={content} />
}

/** Source-level tier marker for the fixed contribution calendar composition. */
export const meta = { shape: "composite", world: "pure" } as const
