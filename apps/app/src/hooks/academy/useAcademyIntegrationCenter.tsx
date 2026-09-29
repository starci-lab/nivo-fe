import { useCallback, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { useMutateAcademyIntegrationSwr, useQueryMyAcademyIntegrationsSwr } from ".."
import type { AcademyIntegrations } from "../../modules/api/academy"
import { nivoQueryReading } from "../../modules/query"
import type {
    AcademyIntegrationCard,
    AcademyIntegrationCenterViewProps,
    AcademyIntegrationFormField,
} from "../../modules/academy/integration-center"
import {
    copyAcademyIntegrationSecret,
    academyIntegrationCardFactsOf,
    academyIntegrationCommandOf,
    academyIntegrationFormFieldFactsOf,
    academyIntegrationOutcomeOf,
    academyIntegrationStatusKeyOf,
    academyIntegrationToneOf,
    type AcademyIntegrationProviderId,
} from "../../modules/academy/integration-center"
import { isAcademyIntegrationProviderId } from "../../modules/academy/integration-center.guards"

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
    const cards: ReadonlyArray<AcademyIntegrationCard> = useMemo(
        () =>
            academyIntegrationCardFactsOf(answer).map((fact) => {
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
            }),
        [answer, t],
    )
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
            const copyOutcome = await copyAcademyIntegrationSecret(result.signingSecret, (secret) =>
                navigator.clipboard.writeText(secret),
            )
            if (copyOutcome.kind === "unavailable") {
                setOutcome(t("saveFailed"))
                setPendingId(undefined)
                return
            }
        }
        const saveOutcome = academyIntegrationOutcomeOf(selectedId, result.ok)
        setOutcome(
            outcome === "failed"
                ? t("saveFailed")
                : outcome === "secret-copied"
                  ? t("webhookSecretCopied")
                  : t("saved"),
        )
        setPendingId(undefined)
    }
    const select = useCallback((id: string) => {
        if (!isAcademyIntegrationProviderId(id)) {
            setSelectedId(undefined)
            setValues({})
            setOutcome(undefined)
            return
        }
        setSelectedId(id)
        setValues({})
        setOutcome(undefined)
    }, [])
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
            select,
            changeField: (name, value) => setValues((current) => ({ ...current, [name]: value })),
            submit: () => void submit(),
            retry: () => void query.mutate(),
        },
    }
}
