import type { AcademyCustomDomainState } from "../../academy"

/** Aggregate growth facts projected from one Academy owned by the viewer. */
export type AcademyGrowthSnapshot = {
    readonly revenueVnd: number
    readonly paidOrders: number
    readonly totalMembers: number
    readonly activeMembers: number
    readonly totalCompletions: number
}

/** One student row in the Academy control center. */
export type AcademyStudent = {
    readonly id: string
    readonly name: string
    readonly email: string
    readonly role: string
    readonly status: string
    readonly xp: number
}

/** A bounded student page returned by the owner-scoped bridge. */
export type AcademyStudentsPage = {
    readonly items: ReadonlyArray<AcademyStudent>
    readonly total: number
}

/** Purchase history carried by a student detail. */
export type AcademyStudentOrder = {
    readonly id: string
    readonly courseSlug: string
    readonly status: string
    readonly amountVnd: number
}

/** Progress through one course. */
export type AcademyStudentCourseProgress = {
    readonly slug: string
    readonly title: string
    readonly completed: number
    readonly total: number
}

/** Owner-only student detail. */
export type AcademyStudentDetail = {
    readonly member: Omit<AcademyStudent, "xp">
    readonly orders: ReadonlyArray<AcademyStudentOrder>
    readonly courses: ReadonlyArray<AcademyStudentCourseProgress>
}

/** Safe status of one write-only Academy credential. */
export type AcademyCredentialStatus = {
    readonly key: string
    readonly configured: boolean
    readonly hint: string | null
    readonly syncedAt: string | null
    readonly verification: string
    readonly verificationReason: string | null
    readonly verifiedAt: string | null
}

/** Safe provider status. Secret values are deliberately absent. */
export type AcademyProviderStatus = {
    readonly provider: string
    readonly status: string
    readonly clientId: string | null
    readonly identifier: string | null
    readonly consentMode: string | null
    readonly reason: string | null
    readonly deliveredAt: string | null
    readonly verifiedAt: string | null
}

/** Safe webhook status. */
export type AcademyWebhookStatus = {
    readonly id: string
    readonly endpoint: string
    readonly events: ReadonlyArray<string>
    readonly enabled: boolean
    readonly version: number
    readonly lastDeliveryStatus: string | null
    readonly lastDeliveredAt: string | null
}

/** Complete Integration Center read model with no credential material. */
export type AcademyIntegrations = {
    readonly credentials: ReadonlyArray<AcademyCredentialStatus>
    readonly customDomain: AcademyCustomDomainState | null
    readonly google: AcademyProviderStatus
    readonly zalo: AcademyProviderStatus
    readonly analytics: ReadonlyArray<AcademyProviderStatus>
    readonly webhooks: ReadonlyArray<AcademyWebhookStatus>
}

/** One lead submitted through an Academy public site. */
export type ExpertSiteLead = {
    readonly id: string
    readonly name: string
    readonly contact: string
    readonly message: string | null
    readonly status: string
    readonly note: string | null
}

/** Filters and pagination accepted by the Academy student list. */
export type MyAcademyStudentsInput = {
    readonly siteId: string
    readonly offset?: number
    readonly limit?: number
    readonly search?: string
    readonly status?: string
}

/** Identity and optional bootstrap credentials for a new student. */
export type CreateAcademyStudentInput = {
    readonly siteId: string
    readonly name: string
    readonly email: string
    readonly password?: string
    readonly role?: string
}

/** Editable identity fields of one existing student. */
export type UpdateAcademyStudentInput = {
    readonly siteId: string
    readonly memberId: string
    readonly name?: string
    readonly email?: string
}

/** Targeted active/banned transition for one student. */
export type SetAcademyStudentStatusInput = {
    readonly siteId: string
    readonly memberId: string
    readonly status: "active" | "banned"
    readonly reason?: string
}

/** Student and course identity used to grant access. */
export type AcademyCourseAccessInput = {
    readonly siteId: string
    readonly email: string
    readonly courseSlug: string
    readonly note?: string
}

/** Student and course identity used to revoke gifted access. */
export type RevokeAcademyCourseAccessInput = {
    readonly siteId: string
    readonly email: string
    readonly courseSlug: string
}

/** Resulting course-access row. */
export type AcademyCourseAccess = {
    readonly id: string
    readonly email: string
    readonly courseSlug: string
    readonly status: string
}

/** Safe result of revoking gifted access. */
export type RevokedAcademyCourseAccess = {
    readonly revoked: number
    readonly keptPaidPurchase: boolean
}

/** Follow-up fields editable on an Academy lead. */
export type UpdateExpertSiteLeadInput = {
    readonly leadId: string
    readonly status?: string
    readonly note?: string
}

/** Lead and locale used to ask for an unsent draft. */
export type DraftLeadReplyInput = {
    readonly leadId: string
    readonly locale?: "vi" | "en"
}

/** AI-authored reply that remains unsent. */
export type DraftedLeadReply = {
    readonly reply: string
}

/** Write-only Academy credential submission. */
export type SaveAcademyCredentialInput = {
    readonly siteId: string
    readonly key: string
    readonly value: string
}

/** Safe status returned after storing and delivering a credential. */
export type AcademyCredentialSaveResult = {
    readonly credential: AcademyCredentialStatus
    readonly delivery: string
    readonly detail: string
}

/** Domain replacement or explicit clear for one Academy. */
export type SetAcademyCustomDomainInput = {
    readonly siteId: string
    readonly domain: string | null
}

/** Write-only Google OAuth client configuration. */
export type SaveAcademyGoogleOAuthInput = {
    readonly siteId: string
    readonly clientId: string
    readonly clientSecret: string
}

/** Analytics identifier and consent policy for one provider. */
export type SaveAcademyAnalyticsInput = {
    readonly siteId: string
    readonly provider: "ga4" | "meta_pixel"
    readonly identifier: string | null
    readonly consentMode: "required" | "granted" | "denied"
}

/** Signed webhook destination and subscribed Academy events. */
export type CreateAcademyWebhookInput = {
    readonly siteId: string
    readonly endpoint: string
    readonly events: ReadonlyArray<string>
}

/** Optimistically fenced webhook-secret rotation. */
export type RotateAcademyWebhookSecretInput = {
    readonly siteId: string
    readonly webhookId: string
    readonly expectedVersion: number
}

/** One-time webhook secret returned only by create or rotate. */
export type AcademyWebhookSecretResult = AcademyWebhookStatus & {
    readonly signingSecret: string
}

/** Short-lived Zalo authorization destination. */
export type AcademyZaloAuthorization = {
    readonly authorizationUrl: string
    readonly expiresAt: string
}
