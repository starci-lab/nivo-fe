"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { nivoQueryData, useMutateDraftLeadReplySwr, useMutateUpdateExpertSiteLeadSwr, useQueryMyExpertSiteLeadsSwr } from "@/hooks/swr"
import type { ExpertSiteLead } from "@/modules/api/console"
import { AcademyLeadPipelineBase } from "./component"

/** Owner-scoped identity consumed by the lead pipeline. */
export type AcademyLeadPipelineProps = { readonly siteId: string }

/**
 * Where a lead moves next when the operator advances it.
 *
 * A TABLE RATHER THAN A CHAIN: the pipeline order is a fact about the vocabulary, and any status
 * the wire holds that is not a step before the end - including `converted` itself - stays at
 * `converted`, which is what the chain it replaces did.
 */
const NEXT_STATUS: Readonly<Record<string, string | undefined>> = {
    new: "contacted",
    contacted: "qualified",
}

/** Settle which state the pipeline surface is in from what the load returned. */
const pipelineState = (leads: ReadonlyArray<ExpertSiteLead> | null | undefined) => {
    if (leads === undefined) return "resting" as const
    if (leads === null) return "refused" as const
    return leads.length === 0 ? "empty" as const : "answered" as const
}

/** Load leads and own targeted update/draft state. */
export const AcademyLeadPipeline = ({ siteId }: AcademyLeadPipelineProps) => {
    const t = useTranslations("console.academyControlCenter.leads")
    const locale = useLocale()
    const query = useQueryMyExpertSiteLeadsSwr(siteId)
    const draftMutation = useMutateDraftLeadReplySwr(siteId)
    const updateMutation = useMutateUpdateExpertSiteLeadSwr(siteId)
    const leads = nivoQueryData(query.data)
    const [selectedId, setSelectedId] = useState<string>()
    const [draft, setDraft] = useState<string>()
    const [pendingAction, setPendingAction] = useState<"advance" | "draft">()
    const [message, setMessage] = useState<string>()
    const selected = leads?.find((lead) => lead.id === selectedId)
    const draftReply = async () => {
        if (selected === undefined) return
        setPendingAction("draft")
        const result = await draftMutation.trigger({ leadId: selected.id, locale: locale === "en" ? "en" : "vi" })
        if (result.ok) setDraft(result.data.reply)
        else setMessage(t("actionFailed"))
        setPendingAction(undefined)
    }
    const advance = async () => {
        if (selected === undefined) return
        setPendingAction("advance")
        const status = NEXT_STATUS[selected.status] ?? "converted"
        const result = await updateMutation.trigger({ leadId: selected.id, status, ...(draft === undefined ? {} : { note: draft }) })
        setMessage(result.ok ? t("saved") : t("actionFailed"))
        setPendingAction(undefined)
    }
    return (
        <AcademyLeadPipelineBase
            state={pipelineState(leads)}
            leads={leads ?? []}
            selected={selected}
            draft={draft}
            pendingAction={pendingAction}
            message={message}
            labels={{ section: t("section"), empty: t("empty"), refused: t("refused"), open: t("open"), detail: t("detail"), advance: t("advance"), draft: t("draft"), saved: t("saved"), actionFailed: t("actionFailed") }}
            onOpenLead={(leadId) => { setSelectedId(leadId); setDraft(undefined); setMessage(undefined) }}
            onAdvance={() => void advance()}
            onDraftReply={() => void draftReply()}
        />
    )
}

/** Source-level tier marker for the connected Academy lead block. */
export const meta = { shape: "block", world: "connected" } as const
