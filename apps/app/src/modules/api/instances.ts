/**
 * The hosted app instances a person runs and the status of their pod.
 *
 * Every operation selects exactly one root field (`graphql` reads the first one and no more), returns an
 * `Outcome` and never throws; a caller keys its sentence off `code`, never off the server's English `reason`.
 * The nullability of every type is the schema's, not a guess.
 */

import type { Outcome } from "./outcome"
import { graphql } from "./graphql"
import { parseInstanceRows, parsePodStatusRow } from "./instances.guards"

/** One running instance, which is the infrastructure view of an app or a workspace. */
export type InstanceRow = {
    /** The instance row's identity. */
    readonly id: string
    /** The template key this instance was built from; joins to `CatalogItemEntity.templateKey`. */
    readonly appKey: string
    /** The provisioned resource this instance belongs to; joins to `ExpertSiteRow.id`. */
    readonly detailId: string | null
    /** What the instance is called, when it is called anything. */
    readonly name: string | null
    /** The commercial plan it runs under. */
    readonly plan: string | null
    /** Memory, as the backend words it. */
    readonly ram: string | null
    /** Virtual cores. */
    readonly vcpu: number | null
    /** Free-form on the wire: `String!`, not an enum. */
    readonly status: string
}

/** Whether an agent workspace's pod is answering. The query that refuses when there is no pod. */
export type PodStatusRow = {
    /** Whether the pod answered at all. */
    readonly reachable: boolean
    /** What it answered with, when it answered. */
    readonly httpStatus: number | null
    /** Whether a token is configured for it. */
    readonly tokenConfigured: boolean
    /** Enough of the token to recognise it, never the token. */
    readonly tokenHint: string | null
    /** When the check ran. */
    readonly checkedAt: string
}

/** The fields an instance row needs, including the shape the plan record wrongly called absent. */
const INSTANCE = "{ id appKey detailId name plan ram vcpu status }"

/** The pod check. */
const POD_STATUS = "{ reachable httpStatus tokenConfigured tokenHint checkedAt }"

/**
 * The running instances behind this account's apps and workspaces.
 *
 * @returns Every instance, or why there is none.
 */
export const myInstances = (): Promise<Outcome<ReadonlyArray<InstanceRow>>> =>
    graphql(`query MyInstances { myInstances { data ${INSTANCE} message success error } }`, parseInstanceRows)

/**
 * Whether the agent workspace's pod is answering.
 *
 * IT REFUSES IN THE ORDINARY COURSE OF BUSINESS. An account with no workspace, or a workspace with
 * no pod registered, gets `AGENT_WORKSPACE_NOT_FOUND_EXCEPTION` or `POD_REGISTRATION_MISSING_EXCEPTION`
 * rather than a payload - which is the fourth state the console draws beside the part that answered,
 * not a fault to retry.
 *
 * @returns The pod check, or why it could not be made.
 */
export const myPodOpenclawStatus = (): Promise<Outcome<PodStatusRow>> =>
    graphql(
        `query MyPodOpenclawStatus { myPodOpenclawStatus { data ${POD_STATUS} message success error } }`,
        parsePodStatusRow,
    )
