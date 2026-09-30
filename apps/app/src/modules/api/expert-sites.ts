/**
 * The expert sites a person owns: their provisioning status, publication and deployment snapshot.
 *
 * Every operation selects exactly one root field (`graphql` reads the first one), returns an `Outcome`
 * and never throws. The document and response shapes come from the generated contract types.
 */

import type { Outcome } from "@nivo/api"
import { graphql } from "./graphql"
import {
    CreateExpertSiteDocument,
    MyExpertSiteDeploymentDocument,
    MyExpertSitesDocument,
    ProvisionExpertSiteDocument,
    PublishExpertSiteDocument,
} from "./__generated__/core"
import type {
    CreateExpertSiteMutation,
    MyExpertSiteDeploymentQuery,
    MyExpertSitesQuery,
    ProvisionExpertSiteMutation,
    PublishExpertSiteMutation,
} from "./__generated__/core"
import {
    parseCreatedExpertSite,
    parseExpertDeploymentSnapshot,
    parseExpertSiteRows,
    parseProvisionedExpertSite,
    parsePublishedExpertSite,
} from "./expert-sites.guards"

/**
 * The apps this account owns.
 *
 * PLURAL SINCE TODAY, which is what makes the app set a set rather than a folder with one thing in
 * it: one customer can already own two academies.
 *
 * @returns Every app, or why there is none.
 */
export const myExpertSites = (): Promise<
    Outcome<ReadonlyArray<NonNullable<MyExpertSitesQuery["myExpertSites"]["data"]>[number]>>
> => graphql(MyExpertSitesDocument, parseExpertSiteRows)

/** Create a draft expert academy site owned by the signed-in viewer. */
export const createExpertSite = (
    slug: string,
): Promise<Outcome<NonNullable<CreateExpertSiteMutation["createExpertSite"]["data"]>>> =>
    graphql(CreateExpertSiteDocument, parseCreatedExpertSite, {
        input: {
            slug,
        },
    })

/** Publish the academy and dispatch its deployment through the live academy owner. */
export const publishExpertSite = (
    siteId: string,
): Promise<Outcome<NonNullable<PublishExpertSiteMutation["publishExpertSite"]["data"]>>> =>
    graphql(PublishExpertSiteDocument, parsePublishedExpertSite, {
        input: {
            siteId,
            published: true,
        },
    })

/** Queue expert academy provisioning; readiness arrives through the deployment stream/read model. */
export const provisionExpertSite = (
    siteId: string,
): Promise<Outcome<NonNullable<ProvisionExpertSiteMutation["provisionExpertSite"]["data"]>>> =>
    graphql(ProvisionExpertSiteDocument, parseProvisionedExpertSite, {
        input: {
            siteId,
        },
    })

/** Read the latest deployment snapshot for one owned expert site so a resumed flow starts from persisted truth. */
export const myExpertSiteDeployment = (
    siteId: string,
): Promise<Outcome<NonNullable<MyExpertSiteDeploymentQuery["myExpertSiteDeployment"]["data"]>>> =>
    graphql(MyExpertSiteDeploymentDocument, parseExpertDeploymentSnapshot, {
        request: { siteId },
    })
