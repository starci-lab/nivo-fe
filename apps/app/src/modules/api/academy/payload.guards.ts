/**
 * The parsers of the Academy bridge documents' payloads. One per shape the operations select; each
 * returns the value or null, which `graphql` reports as `unavailable`. No credential value is ever
 * read - the wire shapes carry statuses and hints only.
 */

import type { AcademyCustomDomainState } from "../../academy"
import {
    isBoolean,
    isNullableString,
    isNumber,
    isRecord,
    isString,
    isStringArray,
    parseEach,
} from "../wire"
import type {
    AcademyCourseAccess,
    AcademyCredentialSaveResult,
    AcademyCredentialStatus,
    AcademyGrowthSnapshot,
    AcademyIntegrations,
    AcademyProviderStatus,
    AcademyStudent,
    AcademyStudentCourseProgress,
    AcademyStudentDetail,
    AcademyStudentOrder,
    AcademyStudentsPage,
    AcademyWebhookSecretResult,
    AcademyWebhookStatus,
    AcademyZaloAuthorization,
    DraftedLeadReply,
    ExpertSiteLead,
    RevokedAcademyCourseAccess,
} from "./types"

/** Parse the `data` of `myAcademyGrowthSnapshot`. */
export const parseAcademyGrowthSnapshot = (input: unknown): AcademyGrowthSnapshot | null =>
    isRecord(input) &&
    isNumber(input.revenueVnd) &&
    isNumber(input.paidOrders) &&
    isNumber(input.totalMembers) &&
    isNumber(input.activeMembers) &&
    isNumber(input.totalCompletions)
        ? {
              revenueVnd: input.revenueVnd,
              paidOrders: input.paidOrders,
              totalMembers: input.totalMembers,
              activeMembers: input.activeMembers,
              totalCompletions: input.totalCompletions,
          }
        : null

/** Parse one student row - also the `data` of the create, update and set-status commands. */
export const parseAcademyStudent = (input: unknown): AcademyStudent | null =>
    isRecord(input) &&
    isString(input.id) &&
    isString(input.name) &&
    isString(input.email) &&
    isString(input.role) &&
    isString(input.status) &&
    isNumber(input.xp)
        ? {
              id: input.id,
              name: input.name,
              email: input.email,
              role: input.role,
              status: input.status,
              xp: input.xp,
          }
        : null

const parseStudentOrder = (value: unknown): AcademyStudentOrder | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.courseSlug) &&
    isString(value.status) &&
    isNumber(value.amountVnd)
        ? { id: value.id, courseSlug: value.courseSlug, status: value.status, amountVnd: value.amountVnd }
        : null

const parseCourseProgress = (value: unknown): AcademyStudentCourseProgress | null =>
    isRecord(value) &&
    isString(value.slug) &&
    isString(value.title) &&
    isNumber(value.completed) &&
    isNumber(value.total)
        ? { slug: value.slug, title: value.title, completed: value.completed, total: value.total }
        : null

/** Parse the `data` of `myAcademyStudents`. */
export const parseAcademyStudentsPage = (input: unknown): AcademyStudentsPage | null => {
    if (!isRecord(input) || !isNumber(input.total)) return null
    const items = parseEach(input.items, parseAcademyStudent)
    return items === null ? null : { items, total: input.total }
}

/** Parse the `data` of `myAcademyStudentDetail`; `member` is the student shape minus `xp`. */
export const parseAcademyStudentDetail = (input: unknown): AcademyStudentDetail | null => {
    if (!isRecord(input)) return null
    const member = input.member
    if (
        !isRecord(member) ||
        !isString(member.id) ||
        !isString(member.name) ||
        !isString(member.email) ||
        !isString(member.role) ||
        !isString(member.status)
    ) {
        return null
    }
    const orders = parseEach(input.orders, parseStudentOrder)
    const courses = parseEach(input.courses, parseCourseProgress)
    if (orders === null || courses === null) return null
    return {
        member: { id: member.id, name: member.name, email: member.email, role: member.role, status: member.status },
        orders,
        courses,
    }
}

const parseCredentialStatus = (value: unknown): AcademyCredentialStatus | null =>
    isRecord(value) &&
    isString(value.key) &&
    isBoolean(value.configured) &&
    isNullableString(value.hint) &&
    isNullableString(value.syncedAt) &&
    isString(value.verification) &&
    isNullableString(value.verificationReason) &&
    isNullableString(value.verifiedAt)
        ? {
              key: value.key,
              configured: value.configured,
              hint: value.hint,
              syncedAt: value.syncedAt,
              verification: value.verification,
              verificationReason: value.verificationReason,
              verifiedAt: value.verifiedAt,
          }
        : null

/** Parse the `data` of `saveAcademyGoogleOAuth`/`disconnectAcademyGoogleOAuth`/`saveAcademyAnalytics`. */
export const parseAcademyProviderStatus = (input: unknown): AcademyProviderStatus | null =>
    isRecord(input) &&
    isString(input.provider) &&
    isString(input.status) &&
    isNullableString(input.clientId) &&
    isNullableString(input.identifier) &&
    isNullableString(input.consentMode) &&
    isNullableString(input.reason) &&
    isNullableString(input.deliveredAt) &&
    isNullableString(input.verifiedAt)
        ? {
              provider: input.provider,
              status: input.status,
              clientId: input.clientId,
              identifier: input.identifier,
              consentMode: input.consentMode,
              reason: input.reason,
              deliveredAt: input.deliveredAt,
              verifiedAt: input.verifiedAt,
          }
        : null

/** Parse the `data` of `disableAcademyWebhook` - the status without a revealed secret. */
export const parseAcademyWebhookStatus = (input: unknown): AcademyWebhookStatus | null =>
    isRecord(input) &&
    isString(input.id) &&
    isString(input.endpoint) &&
    isStringArray(input.events) &&
    isBoolean(input.enabled) &&
    isNumber(input.version) &&
    isNullableString(input.lastDeliveryStatus) &&
    isNullableString(input.lastDeliveredAt)
        ? {
              id: input.id,
              endpoint: input.endpoint,
              events: input.events,
              enabled: input.enabled,
              version: input.version,
              lastDeliveryStatus: input.lastDeliveryStatus,
              lastDeliveredAt: input.lastDeliveredAt,
          }
        : null

/** Parse the `data` of `createAcademyWebhook`/`rotateAcademyWebhookSecret`. */
export const parseAcademyWebhookSecretResult = (input: unknown): AcademyWebhookSecretResult | null => {
    if (!isRecord(input) || !isString(input.signingSecret)) return null
    const webhook = parseAcademyWebhookStatus(input)
    return webhook === null ? null : { ...webhook, signingSecret: input.signingSecret }
}

/** Parse one custom-domain state record, the `data` of `setAcademyCustomDomain`. */
export const parseAcademyCustomDomainState = (input: unknown): AcademyCustomDomainState | null =>
    isRecord(input) &&
    isNullableString(input.domain) &&
    isString(input.target) &&
    isBoolean(input.dnsReady) &&
    isString(input.delivery) &&
    isString(input.detail)
        ? {
              domain: input.domain,
              target: input.target,
              dnsReady: input.dnsReady,
              delivery: input.delivery,
              detail: input.detail,
          }
        : null

/** Parse the `data` of `myAcademyIntegrations`. */
export const parseAcademyIntegrations = (input: unknown): AcademyIntegrations | null => {
    if (!isRecord(input)) return null
    const credentials = parseEach(input.credentials, parseCredentialStatus)
    const customDomain =
        input.customDomain === null || input.customDomain === undefined
            ? null
            : parseAcademyCustomDomainState(input.customDomain)
    const google = parseAcademyProviderStatus(input.google)
    const zalo = parseAcademyProviderStatus(input.zalo)
    const analytics = parseEach(input.analytics, parseAcademyProviderStatus)
    const webhooks = parseEach(input.webhooks, parseAcademyWebhookStatus)
    if (
        credentials === null ||
        (input.customDomain !== null && input.customDomain !== undefined && customDomain === null) ||
        google === null ||
        zalo === null ||
        analytics === null ||
        webhooks === null
    ) {
        return null
    }
    return { credentials, customDomain, google, zalo, analytics, webhooks }
}

/** Parse one lead record - also the `data` of `updateExpertSiteLead`. */
export const parseExpertSiteLead = (input: unknown): ExpertSiteLead | null =>
    isRecord(input) &&
    isString(input.id) &&
    isString(input.name) &&
    isString(input.contact) &&
    isNullableString(input.message) &&
    isString(input.status) &&
    isNullableString(input.note)
        ? {
              id: input.id,
              name: input.name,
              contact: input.contact,
              message: input.message,
              status: input.status,
              note: input.note,
          }
        : null

/** Parse the `data` of `myExpertSiteLeads`. */
export const parseExpertSiteLeads = (input: unknown): ReadonlyArray<ExpertSiteLead> | null =>
    parseEach(input, parseExpertSiteLead)

/** Parse the `data` of `draftLeadReply`. */
export const parseDraftedLeadReply = (input: unknown): DraftedLeadReply | null =>
    isRecord(input) && isString(input.reply) ? { reply: input.reply } : null

/** Parse the `data` of `grantAcademyCourseAccess`. */
export const parseAcademyCourseAccess = (input: unknown): AcademyCourseAccess | null =>
    isRecord(input) &&
    isString(input.id) &&
    isString(input.email) &&
    isString(input.courseSlug) &&
    isString(input.status)
        ? { id: input.id, email: input.email, courseSlug: input.courseSlug, status: input.status }
        : null

/** Parse the `data` of `revokeAcademyCourseAccess`. */
export const parseRevokedAcademyCourseAccess = (input: unknown): RevokedAcademyCourseAccess | null =>
    isRecord(input) && isNumber(input.revoked) && isBoolean(input.keptPaidPurchase)
        ? { revoked: input.revoked, keptPaidPurchase: input.keptPaidPurchase }
        : null

/** Parse the `data` of `saveAcademyCredential`. */
export const parseAcademyCredentialSaveResult = (input: unknown): AcademyCredentialSaveResult | null => {
    if (!isRecord(input) || !isString(input.delivery) || !isString(input.detail)) return null
    const credential = parseCredentialStatus(input.credential)
    return credential === null ? null : { credential, delivery: input.delivery, detail: input.detail }
}

/** Parse the `data` of `beginAcademyZaloAuthorization`. */
export const parseAcademyZaloAuthorization = (input: unknown): AcademyZaloAuthorization | null =>
    isRecord(input) && isString(input.authorizationUrl) && isString(input.expiresAt)
        ? { authorizationUrl: input.authorizationUrl, expiresAt: input.expiresAt }
        : null
