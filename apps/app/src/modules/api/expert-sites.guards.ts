/** Runtime parsers for the generated expert-site document payloads. */

import { isNullableString, isOneOf, isRecord, isString, parseEach } from "@nivo/api"
import type {
    CreateExpertSiteMutation,
    MyExpertSiteDeploymentQuery,
    MyExpertSitesQuery,
    ProvisionExpertSiteMutation,
    PublishExpertSiteMutation,
} from "./__generated__/core"

const parseExpertSiteRow = (
    value: unknown,
): NonNullable<MyExpertSitesQuery["myExpertSites"]["data"]>[number] | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.slug) &&
    isNullableString(value.customDomain) &&
    isOneOf(value.provisionStatus, ["not_provisioned", "provisioning", "awaiting_dns", "ready", "failed"]) &&
    isOneOf(value.status, ["draft", "live", "suspended"])
        ? {
              id: value.id,
              slug: value.slug,
              customDomain: value.customDomain,
              provisionStatus: value.provisionStatus,
              status: value.status,
          }
        : null

/** Parse the `data` of `myExpertSites`. */
export const parseExpertSiteRows = (
    input: unknown,
): ReadonlyArray<NonNullable<MyExpertSitesQuery["myExpertSites"]["data"]>[number]> | null =>
    parseEach(input, parseExpertSiteRow)

/** Parse the `data` of `createExpertSite`. */
export const parseCreatedExpertSite = (
    input: unknown,
): NonNullable<CreateExpertSiteMutation["createExpertSite"]["data"]> | null =>
    isRecord(input) && isString(input.id) && isString(input.slug) ? { id: input.id, slug: input.slug } : null

/** Parse the `data` of `publishExpertSite`. */
export const parsePublishedExpertSite = (
    input: unknown,
): NonNullable<PublishExpertSiteMutation["publishExpertSite"]["data"]> | null =>
    isRecord(input) &&
    isString(input.id) &&
    isString(input.slug) &&
    isOneOf(input.status, ["draft", "live", "suspended"])
        ? { id: input.id, slug: input.slug, status: input.status }
        : null

/** Parse the `data` of `provisionExpertSite`. */
export const parseProvisionedExpertSite = (
    input: unknown,
): NonNullable<ProvisionExpertSiteMutation["provisionExpertSite"]["data"]> | null =>
    isRecord(input) && isString(input.jobId) && isString(input.expertDeploymentId) && isString(input.publicHost)
        ? { jobId: input.jobId, expertDeploymentId: input.expertDeploymentId, publicHost: input.publicHost }
        : null

/** Parse the `data` of `myExpertSiteDeployment`. */
export const parseExpertDeploymentSnapshot = (
    input: unknown,
): NonNullable<MyExpertSiteDeploymentQuery["myExpertSiteDeployment"]["data"]> | null =>
    isRecord(input) && isString(input.id) && isString(input.status) && isString(input.publicHost)
        ? { id: input.id, status: input.status, publicHost: input.publicHost }
        : null
