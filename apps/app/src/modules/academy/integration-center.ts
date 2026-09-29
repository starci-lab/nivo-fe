import type { AcademyIntegrations } from "@/modules/api/academy"
import type { BadgeTone, InputKind } from "@starci/grammar/common"
import type { NivoQueryFailure } from "@/modules/query"

/** Closed provider keys accepted by the Integration Center. */
export type AcademyIntegrationProviderId =
    | "domain"
    | "google"
    | "smtp"
    | "payment"
    | "zalo"
    | "ga4"
    | "meta_pixel"
    | "webhook"

/** One safe provider card; it contains no credential value. */
export type AcademyIntegrationCard = {
    readonly id: string
    readonly title: string
    readonly description: string
    readonly statusLabel: string
    readonly statusTone: BadgeTone
    readonly detail?: string
    readonly actionLabel: string
}

/** One provider-specific local form field. */
export type AcademyIntegrationFormField = {
    readonly id: string
    readonly name: string
    readonly label: string
    readonly kind?: InputKind
    readonly hint?: string
}

/** Atoms the pure Integration Center draws; the connected half owns provider requests. */
export type AcademyIntegrationCenterData = {
    readonly sectionLabel: string
    readonly failure?: NivoQueryFailure
    readonly cards: ReadonlyArray<AcademyIntegrationCard>
    readonly selected?: {
        readonly id: string
        readonly label: string
        readonly fields: ReadonlyArray<AcademyIntegrationFormField>
        readonly submitLabel: string
        readonly revealLabel: string
        readonly hideLabel: string
    }
    readonly pendingId?: string
    readonly outcome?: string
}

/** Actions the pure Integration Center emits as individual control events. */
export type AcademyIntegrationCenterActions = {
    readonly select: (id: string) => void
    readonly changeField: (name: string, value: string) => void
    readonly submit: () => void
    readonly retry?: () => void
}

/** Resolved pure Integration Center state. */
export type AcademyIntegrationCenterViewProps = {
    readonly state: "resting" | "failed" | "answered"
    readonly props: AcademyIntegrationCenterData
    readonly on: AcademyIntegrationCenterActions
}

/** Public props accepted by the pure Integration Center root. */
export type AcademyIntegrationCenterProps = AcademyIntegrationCenterViewProps

type CardDetail =
    | { readonly kind: "text"; readonly value: string }
    | { readonly kind: "credentialCount"; readonly count: number }
    | { readonly kind: "webhookCount"; readonly count: number }

/** One provider's raw status and safe detail before user-facing copy is applied. */
export type AcademyIntegrationCardFact = {
    readonly id: AcademyIntegrationProviderId
    readonly status: string
    readonly detail?: CardDetail
}

/** Keep provider wire states from escaping the resolved status message catalog. */
export const academyIntegrationStatusKeyOf = (status: string) => {
    const knownStatuses = new Set([
        "absent", "connected", "verified", "live", "configured", "rejected", "failed", "expired", "pending",
        "unreachable", "authorizing",
    ])
    return knownStatuses.has(status) ? status : "absent"
}

/** Convert provider wire states into semantic card tones. */
export const academyIntegrationToneOf = (status: string): "neutral" | "success" | "warning" | "danger" => {
    if (["connected", "verified", "live", "configured"].includes(status)) return "success"
    if (["rejected", "failed", "expired"].includes(status)) return "danger"
    if (["pending", "unreachable", "authorizing"].includes(status)) return "warning"
    return "neutral"
}

const providerOf = (answer: AcademyIntegrations | null | undefined, id: AcademyIntegrationProviderId) => {
    if (answer === null || answer === undefined) return undefined
    if (id === "google") return answer.google
    if (id === "zalo") return answer.zalo
    if (id === "ga4" || id === "meta_pixel") return answer.analytics.find((item) => item.provider === id)
    return undefined
}

const credentialCountOf = (answer: AcademyIntegrations | null | undefined, prefix: string) =>
    answer?.credentials.filter((item) => item.key.startsWith(prefix)).length ?? 0

const verifiedCredentialOf = (answer: AcademyIntegrations | null | undefined, prefixes: ReadonlyArray<string>) =>
    answer?.credentials.some(
        (item) => prefixes.some((prefix) => item.key.startsWith(prefix)) && item.verification === "verified",
    ) === true

/** Project safe provider data into cards without including write-only credential values. */
export const academyIntegrationCardFactsOf = (
    answer: AcademyIntegrations | null | undefined,
): ReadonlyArray<AcademyIntegrationCardFact> => {
    const domain = answer?.customDomain
    const paymentCount =
        credentialCountOf(answer, "PAYOS_") +
        (answer?.credentials.filter((item) => item.key.startsWith("SEPAY_")).length ?? 0)
    return [
        {
            id: "domain",
            status:
                domain?.dnsReady === true
                    ? "live"
                    : domain?.domain === null || domain === null || domain === undefined
                      ? "absent"
                      : "pending",
            detail:
                domain?.domain == null ? undefined : { kind: "text", value: `${domain.domain} → ${domain.target}` },
        },
        {
            id: "google",
            status: providerOf(answer, "google")?.status ?? "absent",
            detail: (() => {
                const google = providerOf(answer, "google")
                const value = google?.reason ?? google?.clientId
                return value === null || value === undefined ? undefined : { kind: "text" as const, value }
            })(),
        },
        {
            id: "smtp",
            status: verifiedCredentialOf(answer, ["SMTP_"]) ? "verified" : "absent",
            detail: { kind: "credentialCount", count: credentialCountOf(answer, "SMTP_") },
        },
        {
            id: "payment",
            status: verifiedCredentialOf(answer, ["PAYOS_", "SEPAY_"]) ? "verified" : "absent",
            detail: { kind: "credentialCount", count: paymentCount },
        },
        {
            id: "zalo",
            status: providerOf(answer, "zalo")?.status ?? "absent",
            detail: (() => {
                const value = providerOf(answer, "zalo")?.reason
                return value == null ? undefined : { kind: "text" as const, value }
            })(),
        },
        ...(["ga4", "meta_pixel"] as const).map((id) => {
            const provider = providerOf(answer, id)
            return {
                id,
                status: provider?.status ?? "absent",
                detail: provider?.identifier == null ? undefined : { kind: "text" as const, value: provider.identifier },
            }
        }),
        {
            id: "webhook",
            status: answer?.webhooks.some((item) => item.enabled) === true ? "connected" : "absent",
            detail: answer === null || answer === undefined ? undefined : { kind: "webhookCount", count: answer.webhooks.length },
        },
    ]
}

/** Translation-neutral field description for one provider configuration form. */
/** Translation-neutral field description for one provider configuration form. */
export type AcademyIntegrationFormFieldFact = {
    readonly id: string
    readonly name: string
    readonly label: string
    readonly kind?: "password"
    readonly hint?: string
    readonly hintKey?: "dnsTarget" | "providerKeys"
}

/** Describe each provider's editable fields without mixing translations into the domain module. */
export const academyIntegrationFormFieldFactsOf = (
    id: AcademyIntegrationProviderId,
): ReadonlyArray<AcademyIntegrationFormFieldFact> => {
    if (id === "domain") return [{ id: "academy-domain", name: "domain", label: "domain", hintKey: "dnsTarget" }]
    if (id === "google")
        return [
            { id: "academy-google-client-id", name: "clientId", label: "clientId" },
            { id: "academy-google-client-secret", name: "clientSecret", label: "clientSecret", kind: "password" },
        ]
    if (id === "smtp" || id === "payment")
        return [
            { id: `academy-${id}-key`, name: "credentialKey", label: "credentialKey", hintKey: "providerKeys" },
            { id: `academy-${id}-value`, name: "credentialValue", label: "credentialValue", kind: "password" },
        ]
    if (id === "zalo") return []
    if (id === "ga4" || id === "meta_pixel")
        return [
            { id: `academy-${id}-identifier`, name: "identifier", label: "identifier" },
            { id: `academy-${id}-consent`, name: "consentMode", label: "consentMode", hint: "required | granted | denied" },
        ]
    return [
        { id: "academy-webhook-endpoint", name: "endpoint", label: "endpoint" },
        {
            id: "academy-webhook-events",
            name: "events",
            label: "events",
            hint: "student.created, student.updated, student.status.changed, course.access.changed",
        },
    ]
}

/** Keep consent mode inside its three-value contract, defaulting any other input to required. */
export const academyConsentModeOf = (value: string | undefined): "required" | "granted" | "denied" =>
    value === "granted" || value === "denied" ? value : "required"

/** Select the localized outcome key for a completed provider save. */
export const academyIntegrationOutcomeKeyOf = (id: AcademyIntegrationProviderId, ok: boolean) =>
    !ok ? "saveFailed" : id === "webhook" ? "webhookSecretCopied" : "saved"

/** Build the provider-specific mutation command from the controlled form fields. */
export const academyIntegrationCommandOf = (
    id: AcademyIntegrationProviderId,
    values: Readonly<Record<string, string>>,
) => {
    if (id === "domain") return { kind: "domain" as const, domain: values.domain?.trim() || null }
    if (id === "google")
        return { kind: "google" as const, clientId: values.clientId ?? "", clientSecret: values.clientSecret ?? "" }
    if (id === "smtp" || id === "payment")
        return { kind: "credential" as const, key: values.credentialKey ?? "", value: values.credentialValue ?? "" }
    if (id === "zalo") return { kind: "zalo" as const }
    if (id === "ga4" || id === "meta_pixel")
        return {
            kind: "analytics" as const,
            provider: id,
            identifier: values.identifier?.trim() || null,
            consentMode: academyConsentModeOf(values.consentMode),
        }
    return {
        kind: "webhook" as const,
        endpoint: values.endpoint ?? "",
        events: (values.events ?? "").split(",").map((event) => event.trim()).filter(Boolean),
    }
}
