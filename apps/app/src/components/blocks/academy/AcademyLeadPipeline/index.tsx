"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import {
    useMutateDraftLeadReplySwr,
    useMutateUpdateExpertSiteLeadSwr,
    useQueryMyExpertSiteLeadsSwr,
} from "@/hooks/swr"
import { useQueryNoticeData } from "@/hooks/query"
import { ExpertSiteLeadStatus, type ExpertSiteLeadFieldsFragment } from "@/modules/api/__generated__/core"

import { nivoQueryReading, type NivoQueryReading } from "@/modules/query"
import { AcademyLeadPipelineBase } from "./component"

/** Owner-scoped identity consumed by the lead pipeline. */
export type AcademyLeadPipelineProps = {
    readonly siteId: string
}

/**
 * Where a lead moves next when the operator advances it.
 *
 * A TABLE RATHER THAN A CHAIN: the pipeline order is a fact about the backend vocabulary
 * (`new`, `contacted`, `won`, `lost`), and any status that is not a step before the end - `won` and
 * `lost` included - stays at `won`, which is what the chain it replaces did.
 */
const NEXT_STATUS: Readonly<Partial<Record<ExpertSiteLeadStatus, ExpertSiteLeadStatus>>> = {
    [ExpertSiteLeadStatus.New]: ExpertSiteLeadStatus.Contacted,
    [ExpertSiteLeadStatus.Contacted]: ExpertSiteLeadStatus.Won,
}

/** Settle which state the pipeline surface is in from how the load settled. */
const pipelineState = (reading: NivoQueryReading<ReadonlyArray<ExpertSiteLeadFieldsFragment>>) => {
    if (reading.status === "resting") return "resting" as const
    if (reading.status === "failed") return "failed" as const
    return reading.data.length === 0 ? ("empty" as const) : ("answered" as const)
}

/** Load leads and own targeted update/draft state. */
export const AcademyLeadPipeline = (props: AcademyLeadPipelineProps) => {
    const { siteId }: AcademyLeadPipelineProps = props
    const t = useTranslations("console.academyControlCenter.leads")
    const noticeOf = useQueryNoticeData()
    const locale = useLocale()
    const query = useQueryMyExpertSiteLeadsSwr(siteId)
    const draftMutation = useMutateDraftLeadReplySwr(siteId)
    const updateMutation = useMutateUpdateExpertSiteLeadSwr(siteId)
    const reading = nivoQueryReading(query.data)
    const leads = reading.status === "ready" ? reading.data : undefined
    const [selectedId, setSelectedId] = useState<string>()
    const [draft, setDraft] = useState<string>()
    const [pendingAction, setPendingAction] = useState<"advance" | "draft">()
    const [message, setMessage] = useState<string>()
    const selected = leads?.find((lead) => lead.id === selectedId)
    const draftReply = async () => {
        if (selected === undefined) return
        setPendingAction("draft")
        const result = await draftMutation.trigger({
            leadId: selected.id,
            locale: locale === "en" ? "en" : "vi",
        })
        if (result.ok) setDraft(result.data.reply)
        else setMessage(t("actionFailed"))
        setPendingAction(undefined)
    }
    const advance = async () => {
        if (selected === undefined) return
        setPendingAction("advance")
        const status = NEXT_STATUS[selected.status] ?? ExpertSiteLeadStatus.Won
        const result = await updateMutation.trigger({
            leadId: selected.id,
            status,
            ...(draft === undefined
                ? {}
                : {
                      note: draft,
                  }),
        })
        setMessage(result.ok ? t("saved") : t("actionFailed"))
        setPendingAction(undefined)
    }
    return (
        <AcademyLeadPipelineBase
            state={pipelineState(reading)}
            props={{
                leads: leads ?? [],
                selected,
                draft,
                pendingAction,
                message,
                notice: reading.status === "failed" ? noticeOf(reading) : undefined,
                labels: {
                    section: t("section"),
                    empty: t("empty"),
                    open: t("open"),
                    detail: t("detail"),
                    advance: t("advance"),
                    draft: t("draft"),
                    saved: t("saved"),
                    actionFailed: t("actionFailed"),
                },
            }}
            on={{
                openLead: (leadId) => {
                    setSelectedId(leadId)
                    setDraft(undefined)
                    setMessage(undefined)
                },
                advance: () => void advance(),
                draftReply: () => void draftReply(),
                retryNotice: () => void query.mutate(),
            }}
        />
    )
}
