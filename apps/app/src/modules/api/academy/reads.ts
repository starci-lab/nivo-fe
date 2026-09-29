import { graphql } from "../graphql"
import type { Outcome } from "../outcome"
import {
    parseAcademyGrowthSnapshot,
    parseAcademyIntegrations,
    parseAcademyStudentDetail,
    parseAcademyStudentsPage,
    parseExpertSiteLeads,
} from "./payload.guards"
import type {
    AcademyGrowthSnapshot,
    AcademyIntegrations,
    AcademyStudentDetail,
    AcademyStudentsPage,
    ExpertSiteLead,
    MyAcademyStudentsInput
} from "./types"

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
        parseAcademyGrowthSnapshot,
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
        parseAcademyStudentsPage,
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
        parseAcademyStudentDetail,
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
        parseAcademyIntegrations,
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
        parseExpertSiteLeads,
        {
            request: { siteId, limit, offset },
        },
    )

/** Create a student in one owned Academy. */
