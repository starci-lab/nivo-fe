"use client"

import { useFormatter, useTranslations } from "next-intl"
import { useQueryMyAcademyGrowthSnapshotSwr } from "@/hooks/swr"
import { useQueryNoticeData } from "@/hooks/query"
import { nivoQueryReading } from "@/modules/query"
import { BILLING_CURRENCY } from "@/modules/config"
import { AcademyGrowthSummaryBase } from "./component"

/** Owner-scoped identity consumed by the connected growth block. */
export type AcademyGrowthSummaryProps = {
    readonly siteId: string
}

/** Load and format Academy growth independently from neighbouring blocks. */
export const AcademyGrowthSummary = (props: AcademyGrowthSummaryProps) => {
    const { siteId }: AcademyGrowthSummaryProps = props
    const t = useTranslations("console.academyControlCenter.growth")
    const format = useFormatter()
    const noticeOf = useQueryNoticeData()
    const query = useQueryMyAcademyGrowthSnapshotSwr(siteId)
    const reading = nivoQueryReading(query.data)
    const data = reading.status === "ready" ? reading.data : undefined
    return (
        <AcademyGrowthSummaryBase
            state={reading.status === "resting" ? "resting" : reading.status === "failed" ? "failed" : "answered"}
            props={{
                data,
                notice: reading.status === "failed" ? noticeOf(reading) : undefined,
                revenue: format.number(data?.revenueVnd ?? 0, {
                    style: "currency",
                    currency: BILLING_CURRENCY,
                    maximumFractionDigits: 0,
                }),
                labels: {
                    section: t("section"),
                    health: t("health"),
                    loading: t("loading"),
                    revenue: t("revenue"),
                    orders: t("orders"),
                    members: t("members"),
                    completions: t("completions"),
                    activeRate: t("activeRate"),
                },
            }}
            on={{ retryNotice: () => void query.mutate() }}
        />
    )
}
