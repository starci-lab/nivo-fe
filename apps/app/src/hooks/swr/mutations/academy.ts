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
} from "@/modules/api/academy"
import { useNivoMutation } from "../useNivoMutation"
import {
    MUTATION_ACADEMY_COURSE_ACCESS_GRANT_SWR_KEY,
    MUTATION_ACADEMY_COURSE_ACCESS_REVOKE_SWR_KEY,
    MUTATION_ACADEMY_INTEGRATION_SWR_KEY,
    MUTATION_ACADEMY_LEAD_DRAFT_SWR_KEY,
    MUTATION_ACADEMY_LEAD_UPDATE_SWR_KEY,
    MUTATION_ACADEMY_STUDENT_CREATE_SWR_KEY,
    MUTATION_ACADEMY_STUDENT_STATUS_SWR_KEY,
    QUERY_ACADEMY_INTEGRATIONS_SWR_KEY,
    QUERY_ACADEMY_STUDENT_DETAIL_SWR_KEY,
    QUERY_ACADEMY_STUDENTS_SWR_KEY,
    QUERY_EXPERT_SITE_LEADS_SWR_KEY,
} from "../swr.shared"
type AcademyIntegrationCommand =
    | {
          readonly kind: "domain"
          readonly domain: string | null
      }
    | {
          readonly kind: "google"
          readonly clientId: string
          readonly clientSecret: string
      }
    | {
          readonly kind: "credential"
          readonly key: string
          readonly value: string
      }
    | {
          readonly kind: "zalo"
      }
    | {
          readonly kind: "analytics"
          readonly provider: "ga4" | "meta_pixel"
          readonly identifier: string | null
          readonly consentMode: "required" | "granted" | "denied"
      }
    | {
          readonly kind: "webhook"
          readonly endpoint: string
          readonly events: ReadonlyArray<string>
      }
type AcademyIntegrationAnswer =
    | {
          readonly ok: true
          readonly authorizationUrl?: string
          readonly signingSecret?: string
      }
    | {
          readonly ok: false
      }
const integrationAnswer = (ok: boolean): AcademyIntegrationAnswer =>
    ok
        ? {
              ok: true,
          }
        : {
              ok: false,
          }
const authorizationAnswer = (
    answer: Awaited<ReturnType<typeof beginAcademyZaloAuthorization>>,
): AcademyIntegrationAnswer =>
    answer.ok
        ? {
              ok: true,
              authorizationUrl: answer.data.authorizationUrl,
          }
        : {
              ok: false,
          }
const signingAnswer = (answer: Awaited<ReturnType<typeof createAcademyWebhook>>): AcademyIntegrationAnswer =>
    answer.ok
        ? {
              ok: true,
              signingSecret: answer.data.signingSecret,
          }
        : {
              ok: false,
          }
const executeAcademyIntegrationCommand = async (
    siteId: string,
    command: AcademyIntegrationCommand,
): Promise<AcademyIntegrationAnswer> => {
    if (command.kind === "domain") {
        const answer = await setAcademyCustomDomain({
            siteId,
            domain: command.domain,
        })
        return integrationAnswer(answer.ok)
    }
    if (command.kind === "google") {
        const answer = await saveAcademyGoogleOAuth({
            siteId,
            clientId: command.clientId,
            clientSecret: command.clientSecret,
        })
        return integrationAnswer(answer.ok)
    }
    if (command.kind === "credential") {
        const answer = await saveAcademyCredential({
            siteId,
            key: command.key,
            value: command.value,
        })
        return integrationAnswer(answer.ok)
    }
    if (command.kind === "zalo") {
        const answer = await beginAcademyZaloAuthorization(siteId)
        return authorizationAnswer(answer)
    }
    if (command.kind === "analytics") {
        const answer = await saveAcademyAnalytics({
            siteId,
            provider: command.provider,
            identifier: command.identifier,
            consentMode: command.consentMode,
        })
        return integrationAnswer(answer.ok)
    }
    const answer = await createAcademyWebhook({
        siteId,
        endpoint: command.endpoint,
        events: [...command.events],
    })
    return signingAnswer(answer)
}

/** Own every Academy integration transport while preserving the provider-specific UI command. */
export const useMutateAcademyIntegrationSwr = (siteId: string) =>
    useNivoMutation<AcademyIntegrationAnswer, AcademyIntegrationCommand>(
        MUTATION_ACADEMY_INTEGRATION_SWR_KEY(siteId),
        (command) => executeAcademyIntegrationCommand(siteId, command),
        {
            invalidates: [QUERY_ACADEMY_INTEGRATIONS_SWR_KEY(siteId)],
            shouldInvalidate: (answer) => answer.ok,
        },
    )

/** Create an Academy student and refresh the owner-scoped collection. */
export const useMutateCreateAcademyStudentSwr = (siteId: string) =>
    useNivoMutation(MUTATION_ACADEMY_STUDENT_CREATE_SWR_KEY(siteId), createAcademyStudent, {
        invalidates: [QUERY_ACADEMY_STUDENTS_SWR_KEY(siteId)],
        shouldInvalidate: (answer) => answer.ok,
    })

/** Change one Academy student's status and refresh its collection and detail projections. */
export const useMutateSetAcademyStudentStatusSwr = (siteId: string, memberId?: string) =>
    useNivoMutation(MUTATION_ACADEMY_STUDENT_STATUS_SWR_KEY(siteId), setAcademyStudentStatus, {
        invalidates:
            memberId === undefined
                ? [QUERY_ACADEMY_STUDENTS_SWR_KEY(siteId)]
                : [
                      QUERY_ACADEMY_STUDENTS_SWR_KEY(siteId),
                      QUERY_ACADEMY_STUDENT_DETAIL_SWR_KEY(siteId, memberId),
                  ],
        shouldInvalidate: (answer) => answer.ok,
    })

/** Grant course access and refresh the affected student projection. */
export const useMutateGrantAcademyCourseAccessSwr = (siteId: string, memberId?: string) =>
    useNivoMutation(MUTATION_ACADEMY_COURSE_ACCESS_GRANT_SWR_KEY(siteId), grantAcademyCourseAccess, {
        invalidates:
            memberId === undefined
                ? [QUERY_ACADEMY_STUDENTS_SWR_KEY(siteId)]
                : [
                      QUERY_ACADEMY_STUDENTS_SWR_KEY(siteId),
                      QUERY_ACADEMY_STUDENT_DETAIL_SWR_KEY(siteId, memberId),
                  ],
        shouldInvalidate: (answer) => answer.ok,
    })

/** Revoke course access and refresh the affected student projection. */
export const useMutateRevokeAcademyCourseAccessSwr = (siteId: string, memberId?: string) =>
    useNivoMutation(MUTATION_ACADEMY_COURSE_ACCESS_REVOKE_SWR_KEY(siteId), revokeAcademyCourseAccess, {
        invalidates:
            memberId === undefined
                ? [QUERY_ACADEMY_STUDENTS_SWR_KEY(siteId)]
                : [
                      QUERY_ACADEMY_STUDENTS_SWR_KEY(siteId),
                      QUERY_ACADEMY_STUDENT_DETAIL_SWR_KEY(siteId, memberId),
                  ],
        shouldInvalidate: (answer) => answer.ok,
    })

/** Generate a reply draft without changing the durable lead collection. */
export const useMutateDraftLeadReplySwr = (siteId: string) =>
    useNivoMutation(MUTATION_ACADEMY_LEAD_DRAFT_SWR_KEY(siteId), draftLeadReply)

/** Advance or annotate a lead and refresh its owner-scoped collection. */
export const useMutateUpdateExpertSiteLeadSwr = (siteId: string) =>
    useNivoMutation(MUTATION_ACADEMY_LEAD_UPDATE_SWR_KEY(siteId), updateExpertSiteLead, {
        invalidates: [QUERY_EXPERT_SITE_LEADS_SWR_KEY(siteId)],
        shouldInvalidate: (answer) => answer.ok,
    })
