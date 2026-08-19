"use client"

import { useEffect, useState } from "react"
import { useFormatter, useTranslations } from "next-intl"
import { myAcademyGrowthSnapshot, type AcademyGrowthSnapshot } from "@/modules/api/console"
import type { Result } from "@/modules/api/graphql"
import { useSession } from "@/modules/auth/session"
import { _AcademyGrowthSummary } from "./component"

/** Owner-scoped identity consumed by the connected growth block. */
export type AcademyGrowthSummaryProps = { readonly siteId: string }

/** Load and format Academy growth independently from neighbouring blocks. */
export const AcademyGrowthSummary = ({ siteId }: AcademyGrowthSummaryProps) => {
    const t = useTranslations("console.academyControlCenter.growth")
    const format = useFormatter()
    const session = useSession()
    const [answer, setAnswer] = useState<Result<AcademyGrowthSnapshot> | null>(null)
    useEffect(() => {
        if (session.state.status !== "signed-in") return
        let cancelled = false
        void myAcademyGrowthSnapshot(siteId).then((result) => { if (!cancelled) setAnswer(result) })
        return () => { cancelled = true }
    }, [session.state.status, siteId])
    const data = answer?.ok === true ? answer.data : undefined
    const settledState = answer?.ok === true ? "answered" : "refused"
    return (
        <_AcademyGrowthSummary
            state={answer === null ? "resting" : settledState}
            data={data}
            revenue={format.number(data?.revenueVnd ?? 0, { style: "currency", currency: "VND", maximumFractionDigits: 0 })}
            labels={{
                section: t("section"), health: t("health"), loading: t("loading"), refused: t("refused"),
                revenue: t("revenue"), orders: t("orders"), members: t("members"), completions: t("completions"), activeRate: t("activeRate"),
            }}
        />
    )
}

/** Source-level tier marker for the connected Academy growth block. */
export const meta = { shape: "block", world: "connected" } as const
