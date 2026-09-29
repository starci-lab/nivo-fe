/**
 * The expert sites a person owns: their provisioning status, publication and deployment snapshot.
 *
 * Every operation selects exactly one root field (`graphql` reads the first one and no more), returns an
 * `Outcome` and never throws; a caller keys its sentence off `code`, never off the server's English `reason`.
 * The nullability of every type is the schema's, not a guess.
 */

import type { Outcome } from "./outcome"
import { graphql } from "./graphql"
import {
    parseCreatedExpertSite,
    parseExpertDeploymentSnapshot,
    parseExpertSiteRows,
    parseProvisionedExpertSite,
    parsePublishedExpertSite,
} from "./expert-sites.guards"

/** How far a provisioned expert site has got. A real enum with exactly five members. */
export type ExpertProvisionStatus = "not_provisioned" | "provisioning" | "awaiting_dns" | "ready" | "failed"

/** Which lifecycle state an expert site is published in. */
export type ExpertSiteStatus = "draft" | "live" | "suspended"

/** One app this account owns, as `myExpertSites` puts it on the wire. */
export type ExpertSiteRow = {
    /** The row's identity, and the join key `MyInstance.detailId` carries. */
    readonly id: string
    /** The address fragment the app answers on. */
    readonly slug: string
    /** The address the customer bought, when they bought one. */
    readonly customDomain: string | null
    /** How far the build has got. */
    readonly provisionStatus: ExpertProvisionStatus
    /** Whether the site is published, apart from whether it is built. */
    readonly status: ExpertSiteStatus
}

/** The fields an app row needs, and no relation it would have to load. */
const EXPERT_SITE = "{ id slug customDomain provisionStatus status }"

/**
 * The apps this account owns.
 *
 * PLURAL SINCE TODAY, which is what makes the app set a set rather than a folder with one thing in
 * it: one customer can already own two academies.
 *
 * @returns Every app, or why there is none.
 */
export const myExpertSites = (): Promise<Outcome<ReadonlyArray<ExpertSiteRow>>> =>
    graphql(
        `query MyExpertSites { myExpertSites { data ${EXPERT_SITE} message success error } }`,
        parseExpertSiteRows,
    )

/** The draft site returned by the expert academy create mutation. */
export interface CreatedExpertSite {
    readonly id: string
    readonly slug: string
}

/** The academy site after its single publication/deployment door has accepted it. */
export interface PublishedExpertSite extends CreatedExpertSite {
    readonly status: ExpertSiteStatus
}

/** Handles returned when expert academy provisioning is queued. */
export interface ProvisionedExpertSite {
    readonly jobId: string
    readonly expertDeploymentId: string
    readonly publicHost: string
}

/** Create a draft expert academy site owned by the signed-in viewer. */
export const createExpertSite = (slug: string): Promise<Outcome<CreatedExpertSite>> =>
    graphql(
        `
            mutation CreateExpertSite($input: CreateExpertSiteInput!) {
                createExpertSite(request: $input) {
                    data {
                        id
                        slug
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseCreatedExpertSite,
        {
            input: {
                slug,
            },
        },
    )

/** Publish the academy and dispatch its deployment through the live academy owner. */
export const publishExpertSite = (siteId: string): Promise<Outcome<PublishedExpertSite>> =>
    graphql(
        `
            mutation PublishExpertSite($input: PublishExpertSiteInput!) {
                publishExpertSite(request: $input) {
                    data {
                        id
                        slug
                        status
                    }
                    message
                    success
                    error
                }
            }
        `,
        parsePublishedExpertSite,
        {
            input: {
                siteId,
                published: true,
            },
        },
    )

/** Queue expert academy provisioning; readiness arrives through the deployment stream/read model. */
export const provisionExpertSite = (siteId: string): Promise<Outcome<ProvisionedExpertSite>> =>
    graphql(
        `
            mutation ProvisionExpertSite($input: ProvisionExpertSiteInput!) {
                provisionExpertSite(request: $input) {
                    data {
                        jobId
                        expertDeploymentId
                        publicHost
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseProvisionedExpertSite,
        {
            input: {
                siteId,
            },
        },
    )

/** Read the latest expert deployment for re-entry/readiness reconciliation. */
export interface ExpertDeploymentSnapshot {
    readonly id: string
    readonly status: string
    readonly publicHost: string | null
}

/** Read the latest deployment snapshot for one owned expert site so a resumed flow starts from persisted truth. */
/*
 * The wire answers `data: null` when no deployment exists, which the transport already reports as
 * `not-found`; a snapshot payload is therefore never null on the `ok` arm.
 */
export const myExpertSiteDeployment = (siteId: string): Promise<Outcome<ExpertDeploymentSnapshot>> =>
    graphql(
        `
            query MyExpertSiteDeployment($request: MyExpertSiteDeploymentRequest!) {
                myExpertSiteDeployment(request: $request) {
                    data {
                        id
                        status
                        publicHost
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseExpertDeploymentSnapshot,
        {
            request: { siteId },
        },
    )
