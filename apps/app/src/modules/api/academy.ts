/**
 * The academy an expert runs: growth, students and their course access, leads, and the provider integrations.
 *
 * Every operation selects exactly one root field (`graphql` reads the first one and no more), returns an
 * `Outcome` and never throws; a caller keys its sentence off `code`, never off the server's English `reason`.
 * The nullability of every type is the schema's, not a guess.
 */

import type { AcademyCustomDomainState } from "../academy"
import type { Outcome } from "./outcome"
import { graphql } from "./graphql"

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

/** Read Academy growth through the owner-scoped Nivo bridge. */
export const myAcademyGrowthSnapshot = (siteId: string): Promise<Outcome<AcademyGrowthSnapshot>> =>
    graphql(
        `
            query MyAcademyGrowthSnapshot($request: MyAcademyGrowthSnapshotRequest!) {
                myAcademyGrowthSnapshot(request: $request) {
                    data {
                        revenueVnd
                        paidOrders
                        totalMembers
                        activeMembers
                        totalCompletions
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            request: { siteId },
        },
    )

/** Read one bounded student page through the owner-scoped Nivo bridge. */
export const myAcademyStudents = (input: MyAcademyStudentsInput): Promise<Outcome<AcademyStudentsPage>> =>
    graphql(
        `
            query MyAcademyStudents($input: MyAcademyStudentsInput!) {
                myAcademyStudents(request: $input) {
                    data {
                        items {
                            id
                            name
                            email
                            role
                            status
                            xp
                        }
                        total
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            input,
        },
    )

/** Read one student detail after ownership is checked by Core. */
export const myAcademyStudentDetail = (siteId: string, memberId: string): Promise<Outcome<AcademyStudentDetail>> =>
    graphql(
        `
            query MyAcademyStudentDetail($request: MyAcademyStudentDetailRequest!) {
                myAcademyStudentDetail(request: $request) {
                    data {
                        member {
                            id
                            name
                            email
                            role
                            status
                        }
                        orders {
                            id
                            courseSlug
                            status
                            amountVnd
                        }
                        courses {
                            slug
                            title
                            completed
                            total
                        }
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            request: { siteId, memberId },
        },
    )

/** Read all safe provider states for one owned Academy. */
export const myAcademyIntegrations = (siteId: string): Promise<Outcome<AcademyIntegrations>> =>
    graphql(
        `
            query MyAcademyIntegrations($request: MyAcademyIntegrationsRequest!) {
                myAcademyIntegrations(request: $request) {
                    data {
                        credentials {
                            key
                            configured
                            hint
                            syncedAt
                            verification
                            verificationReason
                            verifiedAt
                        }
                        customDomain {
                            domain
                            target
                            dnsReady
                            delivery
                            detail
                        }
                        google {
                            provider
                            status
                            clientId
                            identifier
                            consentMode
                            reason
                            deliveredAt
                            verifiedAt
                        }
                        zalo {
                            provider
                            status
                            clientId
                            identifier
                            consentMode
                            reason
                            deliveredAt
                            verifiedAt
                        }
                        analytics {
                            provider
                            status
                            clientId
                            identifier
                            consentMode
                            reason
                            deliveredAt
                            verifiedAt
                        }
                        webhooks {
                            id
                            endpoint
                            events
                            enabled
                            version
                            lastDeliveryStatus
                            lastDeliveredAt
                        }
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            request: { siteId },
        },
    )

/** Read leads received by one owned Academy. */
export const myExpertSiteLeads = (
    siteId: string,
    limit = 20,
    offset = 0,
): Promise<Outcome<ReadonlyArray<ExpertSiteLead>>> =>
    graphql(
        `
            query MyExpertSiteLeads($request: MyExpertSiteLeadsRequest!) {
                myExpertSiteLeads(request: $request) {
                    data {
                        id
                        name
                        contact
                        message
                        status
                        note
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            request: { siteId, limit, offset },
        },
    )

/** Create a student in one owned Academy. */
export const createAcademyStudent = (input: CreateAcademyStudentInput): Promise<Outcome<AcademyStudent>> =>
    graphql(
        `
            mutation CreateAcademyStudent($input: CreateAcademyStudentInput!) {
                createAcademyStudent(request: $input) {
                    data {
                        id
                        name
                        email
                        role
                        status
                        xp
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            input,
        },
    )

/** Update one student's identity fields. */
export const updateAcademyStudent = (input: UpdateAcademyStudentInput): Promise<Outcome<AcademyStudent>> =>
    graphql(
        `
            mutation UpdateAcademyStudent($input: UpdateAcademyStudentInput!) {
                updateAcademyStudent(request: $input) {
                    data {
                        id
                        name
                        email
                        role
                        status
                        xp
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            input,
        },
    )

/** Change one student's active/banned state. */
export const setAcademyStudentStatus = (input: SetAcademyStudentStatusInput): Promise<Outcome<AcademyStudent>> =>
    graphql(
        `
            mutation SetAcademyStudentStatus($input: SetAcademyStudentStatusInput!) {
                setAcademyStudentStatus(request: $input) {
                    data {
                        id
                        name
                        email
                        role
                        status
                        xp
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            input,
        },
    )

/** Grant one course to a student. */
export const grantAcademyCourseAccess = (input: AcademyCourseAccessInput): Promise<Outcome<AcademyCourseAccess>> =>
    graphql(
        `
            mutation GrantAcademyCourseAccess($input: GrantAcademyCourseAccessInput!) {
                grantAcademyCourseAccess(request: $input) {
                    data {
                        id
                        email
                        courseSlug
                        status
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            input,
        },
    )

/** Revoke gifted course access from a student. */
export const revokeAcademyCourseAccess = (
    input: RevokeAcademyCourseAccessInput,
): Promise<Outcome<RevokedAcademyCourseAccess>> =>
    graphql(
        `
            mutation RevokeAcademyCourseAccess($input: RevokeAcademyCourseAccessInput!) {
                revokeAcademyCourseAccess(request: $input) {
                    data {
                        revoked
                        keptPaidPurchase
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            input,
        },
    )

/** Update the follow-up state of one Academy lead. */
export const updateExpertSiteLead = (input: UpdateExpertSiteLeadInput): Promise<Outcome<ExpertSiteLead>> =>
    graphql(
        `
            mutation UpdateExpertSiteLead($input: UpdateExpertSiteLeadInput!) {
                updateExpertSiteLead(request: $input) {
                    data {
                        id
                        name
                        contact
                        message
                        status
                        note
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            input,
        },
    )

/** Draft a reply for one Academy lead without sending it. */
export const draftLeadReply = (input: DraftLeadReplyInput): Promise<Outcome<DraftedLeadReply>> =>
    graphql(
        `
            mutation DraftLeadReply($input: DraftLeadReplyInput!) {
                draftLeadReply(request: $input) {
                    data {
                        reply
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            input,
        },
    )

/** Store one Academy credential and return delivery status, never its value. */
export const saveAcademyCredential = (
    input: SaveAcademyCredentialInput,
): Promise<Outcome<AcademyCredentialSaveResult>> =>
    graphql(
        `
            mutation SaveAcademyCredential($input: SaveAcademyCredentialInput!) {
                saveAcademyCredential(request: $input) {
                    data {
                        credential {
                            key
                            configured
                            hint
                            syncedAt
                            verification
                            verificationReason
                            verifiedAt
                        }
                        delivery
                        detail
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            input,
        },
    )

/** Store or clear one Academy custom domain. */
export const setAcademyCustomDomain = (
    input: SetAcademyCustomDomainInput,
): Promise<Outcome<AcademyCustomDomainState>> =>
    graphql(
        `
            mutation SetAcademyCustomDomain($input: SetAcademyCustomDomainInput!) {
                setAcademyCustomDomain(request: $input) {
                    data {
                        domain
                        target
                        dnsReady
                        delivery
                        detail
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            input,
        },
    )

/** Save write-only Google OAuth credentials. */
export const saveAcademyGoogleOAuth = (input: SaveAcademyGoogleOAuthInput): Promise<Outcome<AcademyProviderStatus>> =>
    graphql(
        `
            mutation SaveAcademyGoogleOAuth($input: SaveAcademyGoogleOAuthInput!) {
                saveAcademyGoogleOAuth(request: $input) {
                    data {
                        provider
                        status
                        clientId
                        identifier
                        consentMode
                        reason
                        deliveredAt
                        verifiedAt
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            input,
        },
    )

/** Disconnect the Academy Google login provider. */
export const disconnectAcademyGoogleOAuth = (siteId: string): Promise<Outcome<AcademyProviderStatus>> =>
    graphql(
        `
            mutation DisconnectAcademyGoogleOAuth($request: DisconnectAcademyGoogleOAuthRequest!) {
                disconnectAcademyGoogleOAuth(request: $request) {
                    data {
                        provider
                        status
                        clientId
                        identifier
                        consentMode
                        reason
                        deliveredAt
                        verifiedAt
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            request: { siteId },
        },
    )

/** Begin a short-lived Zalo OA authorization flow. */
export const beginAcademyZaloAuthorization = (siteId: string): Promise<Outcome<AcademyZaloAuthorization>> =>
    graphql(
        `
            mutation BeginAcademyZaloAuthorization($input: BeginAcademyZaloAuthorizationInput!) {
                beginAcademyZaloAuthorization(request: $input) {
                    data {
                        authorizationUrl
                        expiresAt
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            input: {
                siteId,
            },
        },
    )

/** Save one analytics identifier and consent mode. */
export const saveAcademyAnalytics = (input: SaveAcademyAnalyticsInput): Promise<Outcome<AcademyProviderStatus>> =>
    graphql(
        `
            mutation SaveAcademyAnalytics($input: SaveAcademyAnalyticsInput!) {
                saveAcademyAnalytics(request: $input) {
                    data {
                        provider
                        status
                        clientId
                        identifier
                        consentMode
                        reason
                        deliveredAt
                        verifiedAt
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            input,
        },
    )

/** Create a signed Academy webhook and reveal its signing secret once. */
export const createAcademyWebhook = (input: CreateAcademyWebhookInput): Promise<Outcome<AcademyWebhookSecretResult>> =>
    graphql(
        `
            mutation CreateAcademyWebhook($input: CreateAcademyWebhookInput!) {
                createAcademyWebhook(request: $input) {
                    data {
                        id
                        endpoint
                        events
                        enabled
                        version
                        lastDeliveryStatus
                        lastDeliveredAt
                        signingSecret
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            input,
        },
    )

/** Rotate a webhook secret with optimistic version fencing. */
export const rotateAcademyWebhookSecret = (
    input: RotateAcademyWebhookSecretInput,
): Promise<Outcome<AcademyWebhookSecretResult>> =>
    graphql(
        `
            mutation RotateAcademyWebhookSecret($input: RotateAcademyWebhookSecretInput!) {
                rotateAcademyWebhookSecret(request: $input) {
                    data {
                        id
                        endpoint
                        events
                        enabled
                        version
                        lastDeliveryStatus
                        lastDeliveredAt
                        signingSecret
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            input,
        },
    )

/** Disable one Academy webhook. */
export const disableAcademyWebhook = (siteId: string, webhookId: string): Promise<Outcome<AcademyWebhookStatus>> =>
    graphql(
        `
            mutation DisableAcademyWebhook($input: DisableAcademyWebhookInput!) {
                disableAcademyWebhook(request: $input) {
                    data {
                        id
                        endpoint
                        events
                        enabled
                        version
                        lastDeliveryStatus
                        lastDeliveredAt
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            input: {
                siteId,
                webhookId,
            },
        },
    )
