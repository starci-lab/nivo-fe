import {
    LabelledProgressRow,
    SurfaceCard,
    Text,
    defineCompositeComponent,
    defineContractComponent,
    defineLeafComponent,
} from "@nivo/ui"
import type { AcademyGrowthSnapshot } from "@/modules/api/console"

/** Resolved copy for the growth block. */
export type AcademyGrowthSummaryLabels = {
    readonly section: string
    readonly health: string
    readonly loading: string
    readonly refused: string
    readonly revenue: string
    readonly orders: string
    readonly members: string
    readonly completions: string
    readonly activeRate: string
}

/** Pure growth block state. */
export type AcademyGrowthSummaryViewProps = {
    readonly state: "resting" | "refused" | "answered"
    readonly data?: AcademyGrowthSnapshot
    readonly labels: AcademyGrowthSummaryLabels
    readonly revenue: string
}

/** Render aggregate facts without fetching or formatting. */
export const AcademyGrowthSummaryBase = ({ state, data, labels, revenue }: AcademyGrowthSummaryViewProps) => {
    const facts = [
        { id: "revenue", subject: revenue, caption: labels.revenue },
        { id: "orders", subject: String(data?.paidOrders ?? 0), caption: labels.orders },
        { id: "members", subject: String(data?.totalMembers ?? 0), caption: labels.members },
        { id: "completions", subject: String(data?.totalCompletions ?? 0), caption: labels.completions },
    ]
    const activePercent = data === undefined || data.totalMembers === 0 ? 0 : Math.round((data.activeMembers / data.totalMembers) * 100)
    if (state === "refused") return (
        <SurfaceCard props={{ label: labels.section }} contract="body-with-refusal-note" render={defineContractComponent("body-with-refusal-note", {
            note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: labels.refused, size: "sm", tone: "muted" }} />),
        })} />
    )
    return (
        <>
            <SurfaceCard
                props={{ label: labels.section }}
                contract="captioned-cell-grid"
                render={defineContractComponent("captioned-cell-grid", {
                        cell: facts.map((fact) => defineContractComponent("subject-over-muted-caption", {
                            subject: defineLeafComponent("text", { weight: "semibold" }, () => <Text props={{ content: fact.subject, weight: "semibold" }} isLoading={state === "resting"} />),
                            caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: fact.caption, size: "xs", tone: "muted" }} />),
                        })),
                    })}
            />
            <SurfaceCard
                    props={{ label: labels.health }}
                    contract="progress-row-stack"
                    render={defineContractComponent("progress-row-stack", {
                        row: [defineCompositeComponent("labelled-progress-row", {}, () => (
                            <LabelledProgressRow
                                props={{ id: "active-rate", title: labels.activeRate, percent: activePercent, percentText: `${data?.activeMembers ?? 0}/${data?.totalMembers ?? 0}` }}
                                isLoading={state === "resting"}
                            />
                        ))],
                    })}
            />
        </>
    )
}

/** Source-level tier marker for the pure Academy growth block. */
export const meta = { shape: "block", world: "pure" } as const
