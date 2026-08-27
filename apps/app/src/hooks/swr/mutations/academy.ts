"use client"

import {
    beginAcademyZaloAuthorization,
    createAcademyStudent,
    createAcademyWebhook,
    draftLeadReply,
    grantAcademyCourseAccess,
    revokeAcademyCourseAccess,
    saveAcademyAnalytics,
    saveAcademyCredential,
    saveAcademyGoogleOAuth,
    setAcademyCustomDomain,
    setAcademyStudentStatus,
    updateExpertSiteLead,
} from "@/modules/api/console"
import { useNivoMutation } from "../use-nivo-mutation"

type AcademyIntegrationCommand =
    | { readonly kind: "domain"; readonly domain: string | null }
    | { readonly kind: "google"; readonly clientId: string; readonly clientSecret: string }
    | { readonly kind: "credential"; readonly key: string; readonly value: string }
    | { readonly kind: "zalo" }
    | { readonly kind: "analytics"; readonly provider: "ga4" | "meta_pixel"; readonly identifier: string | null; readonly consentMode: "required" | "granted" | "denied" }
    | { readonly kind: "webhook"; readonly endpoint: string; readonly events: ReadonlyArray<string> }

type AcademyIntegrationAnswer =
    | { readonly ok: true; readonly authorizationUrl?: string; readonly signingSecret?: string }
    | { readonly ok: false }

const executeAcademyIntegrationCommand = async (
    siteId: string,
    command: AcademyIntegrationCommand,
): Promise<AcademyIntegrationAnswer> => {
    if (command.kind === "domain") {
        const answer = await setAcademyCustomDomain({ siteId, domain: command.domain })
        return answer.ok ? { ok: true } : { ok: false }
    }
    if (command.kind === "google") {
        const answer = await saveAcademyGoogleOAuth({ siteId, clientId: command.clientId, clientSecret: command.clientSecret })
        return answer.ok ? { ok: true } : { ok: false }
    }
    if (command.kind === "credential") {
        const answer = await saveAcademyCredential({ siteId, key: command.key, value: command.value })
        return answer.ok ? { ok: true } : { ok: false }
    }
    if (command.kind === "zalo") {
        const answer = await beginAcademyZaloAuthorization(siteId)
        return answer.ok ? { ok: true, authorizationUrl: answer.data.authorizationUrl } : { ok: false }
    }
    if (command.kind === "analytics") {
        const answer = await saveAcademyAnalytics({ siteId, provider: command.provider, identifier: command.identifier, consentMode: command.consentMode })
        return answer.ok ? { ok: true } : { ok: false }
    }
    const answer = await createAcademyWebhook({ siteId, endpoint: command.endpoint, events: [...command.events] })
    return answer.ok ? { ok: true, signingSecret: answer.data.signingSecret } : { ok: false }
}

/** Own every Academy integration transport while preserving the provider-specific UI command. */
export const useMutateAcademyIntegrationSwr = (siteId: string) => useNivoMutation<AcademyIntegrationAnswer, AcademyIntegrationCommand>(
    ["academy", "integration", siteId],
    (command) => executeAcademyIntegrationCommand(siteId, command),
    {
        invalidates: [["academy", "integrations", siteId]],
        shouldInvalidate: (answer) => answer.ok,
    },
)

/** Create an Academy student and refresh the owner-scoped collection. */
export const useMutateCreateAcademyStudentSwr = (siteId: string) => useNivoMutation(
    ["academy", "student-create", siteId],
    createAcademyStudent,
    { invalidates: [["academy", "students", siteId]], shouldInvalidate: (answer) => answer.ok },
)

/** Change one Academy student's status and refresh its collection and detail projections. */
export const useMutateSetAcademyStudentStatusSwr = (siteId: string, memberId?: string) => useNivoMutation(
    ["academy", "student-status", siteId],
    setAcademyStudentStatus,
    {
        invalidates: memberId === undefined
            ? [["academy", "students", siteId]]
            : [["academy", "students", siteId], ["academy", "student", siteId, memberId]],
        shouldInvalidate: (answer) => answer.ok,
    },
)

/** Grant course access and refresh the affected student projection. */
export const useMutateGrantAcademyCourseAccessSwr = (siteId: string, memberId?: string) => useNivoMutation(
    ["academy", "course-access-grant", siteId],
    grantAcademyCourseAccess,
    {
        invalidates: memberId === undefined
            ? [["academy", "students", siteId]]
            : [["academy", "students", siteId], ["academy", "student", siteId, memberId]],
        shouldInvalidate: (answer) => answer.ok,
    },
)

/** Revoke course access and refresh the affected student projection. */
export const useMutateRevokeAcademyCourseAccessSwr = (siteId: string, memberId?: string) => useNivoMutation(
    ["academy", "course-access-revoke", siteId],
    revokeAcademyCourseAccess,
    {
        invalidates: memberId === undefined
            ? [["academy", "students", siteId]]
            : [["academy", "students", siteId], ["academy", "student", siteId, memberId]],
        shouldInvalidate: (answer) => answer.ok,
    },
)

/** Generate a reply draft without changing the durable lead collection. */
export const useMutateDraftLeadReplySwr = (siteId: string) => useNivoMutation(
    ["academy", "lead-draft", siteId],
    draftLeadReply,
)

/** Advance or annotate a lead and refresh its owner-scoped collection. */
export const useMutateUpdateExpertSiteLeadSwr = (siteId: string) => useNivoMutation(
    ["academy", "lead-update", siteId],
    updateExpertSiteLead,
    { invalidates: [["academy", "leads", siteId]], shouldInvalidate: (answer) => answer.ok },
)
