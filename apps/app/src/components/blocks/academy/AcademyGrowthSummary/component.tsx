import type { ReactNode } from "react"
import { LabelledProgressRow } from "@nivo/ui"
import { SurfaceCard, Text } from "@starci/grammar/common"
import type { AcademyGrowthSnapshot } from "@/modules/api/academy"

/** Resolved copy for the growth block. */
export type AcademyGrowthSummaryProps = AcademyGrowthSummaryViewProps
/** Public API role for AcademyGrowthSummaryLabels. */
export type AcademyGrowthSummaryLabels = {
    readonly section: string
    readonly health: string
    readonly loading: string
    readonly revenue: string
    readonly orders: string
    readonly members: string
    readonly completions: string
    readonly activeRate: string
}

/** Atoms the pure growth block draws; the connected half owns the snapshot request. */
export type AcademyGrowthSummaryData = {
    readonly data?: AcademyGrowthSnapshot
    /** The failure the connected half composed for a settled failed read. */
    readonly notice?: ReactNode
    readonly labels: AcademyGrowthSummaryLabels
    readonly revenue: string
}

/** Pure growth block state. */
export type AcademyGrowthSummaryViewProps = {
    readonly state: "resting" | "failed" | "answered"
    readonly props: AcademyGrowthSummaryData
}

/** Render aggregate facts without fetching or formatting. */
const AcademyGrowthSummaryContent = (input: AcademyGrowthSummaryViewProps) => {
    const { state } = input
    const { data, notice, labels, revenue } = input.props
    const facts = [
        {
            id: "revenue",
            subject: revenue,
            caption: labels.revenue,
        },
        {
            id: "orders",
            subject: String(data?.paidOrders ?? 0),
            caption: labels.orders,
        },
        {
            id: "members",
            subject: String(data?.totalMembers ?? 0),
            caption: labels.members,
        },
        {
            id: "completions",
            subject: String(data?.totalCompletions ?? 0),
            caption: labels.completions,
        },
    ]
    const activePercent =
        data === undefined || data.totalMembers === 0 ? 0 : Math.round((data.activeMembers / data.totalMembers) * 100)
    if (state === "failed")
        return (
            <SurfaceCard label={labels.section}>
                <div>{notice}</div>
            </SurfaceCard>
        )
    return (
        <>
            <SurfaceCard label={labels.section}>
                <div>
                    {facts.map((fact) => (
                        <div key={fact.id}>
                            <Text weight="semibold" isSkeleton={state === "resting"}>
                                {fact.subject}
                            </Text>
                            <Text size="xs" tone="muted">
                                {fact.caption}
                            </Text>
                        </div>
                    ))}
                </div>
            </SurfaceCard>

            <SurfaceCard label={labels.health}>
                <div>
                    <>
                        <LabelledProgressRow
                            props={{
                                id: "active-rate",
                                title: labels.activeRate,
                                percent: activePercent,
                                percentText: `${data?.activeMembers ?? 0}/${data?.totalMembers ?? 0}`,
                            }}
                            isLoading={state === "resting"}
                        />
                    </>
                </div>
            </SurfaceCard>
        </>
    )
}

/** Stable typed root for the Academy growth block. */
export const AcademyGrowthSummaryBase = (props: AcademyGrowthSummaryProps) => <AcademyGrowthSummaryContent {...props} />
