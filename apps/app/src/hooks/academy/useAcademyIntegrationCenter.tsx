import { useState } from "react"
import { useTranslations } from "next-intl"
import { useMutateAcademyIntegrationSwr, useQueryMyAcademyIntegrationsSwr } from "@/hooks"
import type { AcademyIntegrations } from "@/modules/api/academy"
import { nivoQueryReading } from "@/modules/query"
import type {
    AcademyIntegrationCard,
    AcademyIntegrationCenterViewProps,
    AcademyIntegrationFormField,
} from "@/modules/academy/integration-center"
import {
    academyIntegrationCardFactsOf,
    academyIntegrationCommandOf,
    academyIntegrationFormFieldFactsOf,
    academyIntegrationOutcomeKeyOf,
    academyIntegrationStatusKeyOf,
    academyIntegrationToneOf,
    type AcademyIntegrationProviderId,
} from "@/modules/academy/integration-center"

/** Own provider queries, write-only forms, and post-save feedback. */
export const useAcademyIntegrationCenter = (siteId: string): AcademyIntegrationCenterViewProps => {
    const t = useTranslations("console.academyControlCenter.integrations")
    const query = useQueryMyAcademyIntegrationsSwr(siteId)
    const integrationMutation = useMutateAcademyIntegrationSwr(siteId)
    const reading = nivoQueryReading(query.data)
    const answer: AcademyIntegrations | null | undefined = reading.status === "ready" ? reading.data : undefined
    const [selectedId, setSelectedId] = useState<AcademyIntegrationProviderId>()
    const [values, setValues] = useState<Readonly<Record<string, string>>>({})
    const [pendingId, setPendingId] = useState<AcademyIntegrationProviderId>()
    const [outcome, setOutcome] = useState<string>()
    const cards: ReadonlyArray<AcademyIntegrationCard> = academyIntegrationCardFactsOf(answer).map((fact) => {
        const detail = fact.detail
        return {
            id: fact.id,
            title: t(`providers.${fact.id}.title`),
            description: t(`providers.${fact.id}.description`),
            statusLabel: t(`status.${academyIntegrationStatusKeyOf(fact.status)}`),
            statusTone: academyIntegrationToneOf(fact.status),
            detail:
                detail?.kind === "text"
                    ? detail.value
                    : detail?.kind === "credentialCount"
                      ? detail.count === 0
                          ? t("notConfigured")
                          : t("credentialCount", { count: detail.count })
                      : detail?.kind === "webhookCount"
                        ? t("webhookCount", { count: detail.count })
                        : undefined,
            actionLabel: t("configure"),
        }
    })
    const fieldsOf = (id: AcademyIntegrationProviderId): ReadonlyArray<AcademyIntegrationFormField> =>
        academyIntegrationFormFieldFactsOf(id).map((field) => {
            const target = answer?.customDomain?.target
            const hint =
                field.hintKey === "dnsTarget"
                    ? target === undefined
                        ? undefined
                        : t("dnsTarget", { target })
                    : field.hintKey === "providerKeys"
                      ? t(`providers.${id}.keys`)
                      : field.hint
            return {
                id: field.id,
                name: field.name,
                label: t(`fields.${field.label}`),
                ...(field.kind === undefined ? {} : { kind: field.kind }),
                ...(hint === undefined ? {} : { hint }),
            }
        })
    const submit = async () => {
        if (selectedId === undefined) return
        setPendingId(selectedId)
        setOutcome(undefined)
        const result = await integrationMutation.trigger(academyIntegrationCommandOf(selectedId, values))
        if (result.ok && selectedId === "zalo" && result.authorizationUrl !== undefined)
            window.open(result.authorizationUrl, "academy-zalo-oauth", "popup,width=520,height=720")
        if (result.ok && selectedId === "webhook" && result.signingSecret !== undefined) {
            try {
                await navigator.clipboard.writeText(result.signingSecret)
            } catch {
                /* Browser permission may refuse clipboard; never echo the secret into the DOM. */
            }
        }
        setOutcome(t(academyIntegrationOutcomeKeyOf(selectedId, result.ok)))
        setPendingId(undefined)
    }
    return {
        state: reading.status === "resting" ? "resting" : reading.status === "failed" ? "failed" : "answered",
        props: {
            sectionLabel: t("section"),
            failure: reading.status === "failed" ? reading : undefined,
            cards,
            selected:
                selectedId === undefined
                    ? undefined
                    : {
                          id: selectedId,
                          label: t(`providers.${selectedId}.formLabel`),
                          fields: fieldsOf(selectedId),
                          submitLabel: selectedId === "zalo" ? t("authorize") : t("save"),
                          revealLabel: t("reveal"),
                          hideLabel: t("hide"),
                      },
            pendingId,
            outcome,
        },
        on: {
            select: (id) => {
                setSelectedId(id as AcademyIntegrationProviderId)
                setValues({})
                setOutcome(undefined)
            },
            changeField: (name, value) => setValues((current) => ({ ...current, [name]: value })),
            submit: () => void submit(),
            retry: () => void query.mutate(),
        },
    }
}
