import type { MyInstancesQuery, MyPodOpenclawStatusQuery } from "./__generated__/core"

/**
 * The hosted app instances a person runs and the status of their pod.
 *
 * Every operation selects exactly one root field (`graphql` reads the first one), returns an `Outcome`
 * and never throws. The document and response shapes come from the generated contract types.
 */

import type { Outcome } from "@nivo/api"
import { graphql } from "./graphql"
import { MyInstancesDocument, MyPodOpenclawStatusDocument } from "./__generated__/core"
import { parseInstanceRows, parsePodStatusRow } from "./instances.guards"

/**
 * The running instances behind this account's apps and workspaces.
 *
 * @returns Every instance, or why there is none.
 */
export const myInstances = (): Promise<
    Outcome<ReadonlyArray<NonNullable<MyInstancesQuery["myInstances"]["data"]>[number]>>
> => graphql(MyInstancesDocument, parseInstanceRows)

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
export const myPodOpenclawStatus = (): Promise<
    Outcome<NonNullable<MyPodOpenclawStatusQuery["myPodOpenclawStatus"]["data"]>>
> => graphql(MyPodOpenclawStatusDocument, parsePodStatusRow)
