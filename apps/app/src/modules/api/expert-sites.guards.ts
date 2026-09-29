/**
 * The parsers of the expert-site documents' payloads. One per shape the expert-site operations
 * select; each returns the value or null, which `graphql` reports as `unavailable`.
 */

import { isNullableString, isOneOf, isRecord, isString, parseEach } from "./wire"
import type {
    CreatedExpertSite,
    ExpertDeploymentSnapshot,
    ExpertSiteRow,
    ProvisionedExpertSite,
    PublishedExpertSite,
} from "./expert-sites"

const parseExpertSiteRow = (value: unknown): ExpertSiteRow | null =>
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
export const parseExpertSiteRows = (input: unknown): ReadonlyArray<ExpertSiteRow> | null =>
    parseEach(input, parseExpertSiteRow)

/** Parse the `data` of `createExpertSite`. */
export const parseCreatedExpertSite = (input: unknown): CreatedExpertSite | null =>
    isRecord(input) && isString(input.id) && isString(input.slug) ? { id: input.id, slug: input.slug } : null

/** Parse the `data` of `publishExpertSite`. */
export const parsePublishedExpertSite = (input: unknown): PublishedExpertSite | null =>
    isRecord(input) &&
    isString(input.id) &&
    isString(input.slug) &&
    isOneOf(input.status, ["draft", "live", "suspended"])
        ? { id: input.id, slug: input.slug, status: input.status }
        : null

/** Parse the `data` of `provisionExpertSite`. */
export const parseProvisionedExpertSite = (input: unknown): ProvisionedExpertSite | null =>
    isRecord(input) &&
    isString(input.jobId) &&
    isString(input.expertDeploymentId) &&
    isString(input.publicHost)
        ? { jobId: input.jobId, expertDeploymentId: input.expertDeploymentId, publicHost: input.publicHost }
        : null

/** Parse the `data` of `myExpertSiteDeployment`. */
export const parseExpertDeploymentSnapshot = (input: unknown): ExpertDeploymentSnapshot | null =>
    isRecord(input) &&
    isString(input.id) &&
    isString(input.status) &&
    isNullableString(input.publicHost)
        ? { id: input.id, status: input.status, publicHost: input.publicHost }
        : null
