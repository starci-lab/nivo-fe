/**
 * The AgentOS workspaces a person owns: their control center, runtime, recovery and application launches.
 *
 * Every operation selects exactly one root field (`graphql` reads the first one and no more), returns an
 * `Outcome` and never throws; a caller keys its sentence off `code`, never off the server's English `reason`.
 * The nullability of every type is the schema's, not a guess.
 */

import { type Outcome } from "@nivo/api"
import { graphql } from "./graphql"
import {
    parseAgentWorkspaceAppLaunch,
    parseAgentWorkspaceControlCenter,
    parseAgentWorkspaceRows,
    parseRenewedAgentWorkspaceAppLaunch,
    parseRevokedAgentWorkspaceAppLaunch,
} from "./agentos-workspaces.guards"

/** One agent workspace. `myAgentWorkspace` returns a LIST despite the singular name. */
export type AgentWorkspaceRow = {
    /** The workspace's identity. */
    readonly id: string
    /** What the customer called it, when they called it anything. */
    readonly name: string | null
    /** Free-form on the wire: `String!`, not an enum. */
    readonly status: string
    /** Catalog order this workspace fulfills; the stable bridge from order events to workspace events. */
    readonly catalogOrder: {
        readonly id: string
    } | null
}

/** One customer-safe application capability inside an AgentOS workspace. */
export type AgentWorkspaceAppCapability = {
    readonly app: "OPENCLAW" | "N8N"
    readonly accessMode: "NIVO_CONSOLE" | "EXTERNAL_LAUNCH" | "UNAVAILABLE"
    readonly available: boolean
    readonly reason: string | null
    readonly observedVersion: string | null
}

/** Resource values and health reported for one Helm component. */
export type AgentWorkspaceRuntimeComponent = {
    readonly key: string
    readonly kind: string
    readonly status: string
    readonly desiredReplicas: number | null
    readonly readyReplicas: number | null
    readonly image: string | null
    readonly pvcSize: string | null
    readonly storagePolicy: string | null
    readonly cpuUsageMillicores: number | null
    readonly cpuRequestMillicores: number | null
    readonly cpuLimitMillicores: number | null
    readonly memoryUsageBytes: number | null
    readonly memoryRequestBytes: number | null
    readonly memoryLimitBytes: number | null
    readonly restartCount: number
    readonly lastTerminationReason: string | null
    readonly oomKilled: boolean
    readonly throttled: boolean | null
}

/** Persistent volume projected from the workspace Helm release. */
export type AgentWorkspaceRuntimeStorage = {
    readonly key: string
    readonly kind: string
    readonly size: string | null
    readonly policy: string | null
    readonly status: string
}

/** Aggregate usage, requests and limits across the workspace. */
export type AgentWorkspaceRuntimeTotals = {
    readonly cpuUsageMillicores: number | null
    readonly cpuRequestMillicores: number
    readonly cpuLimitMillicores: number
    readonly memoryUsageBytes: number | null
    readonly memoryRequestBytes: number
    readonly memoryLimitBytes: number
    readonly restartCount: number
    readonly oomKilled: boolean
    readonly throttled: boolean | null
}

/** Latest persisted probe of one AgentOS Helm release. */
export type AgentWorkspaceRuntime = {
    readonly instanceId: string
    readonly appKey: string
    readonly status: string
    readonly releaseName: string | null
    readonly chartName: string | null
    readonly chartVersion: string | null
    readonly components: ReadonlyArray<AgentWorkspaceRuntimeComponent>
    readonly storage: ReadonlyArray<AgentWorkspaceRuntimeStorage>
    readonly totals: AgentWorkspaceRuntimeTotals
    readonly probeStatus: "available" | "partial" | "unavailable"
    readonly fingerprint: string
    readonly lastError: string | null
    readonly observedAt: string
    readonly stale: boolean
}

/**
 * Owner-safe recovery projection for one workspace, as `AgentWorkspaceRecoveryView` publishes it.
 * Credentials, target addresses and raw errors are intentionally absent from the wire shape, and
 * every timestamp arrives serialized as an ISO string.
 */
export type AgentWorkspaceRecovery = {
    /** Recovery lifecycle state; free-form `String!` on the wire, not an enum. */
    readonly state: string
    /** The phase inside that state, when the backend is tracking one. NULLABLE on the wire. */
    readonly phase: string | null
    /** The fenced attempt sequence the workspace's provisioning order has reached. */
    readonly attemptCount: number
    /** When the most recent fenced attempt ran. NULLABLE on the wire. */
    readonly lastAttemptAt: string | null
    /** When the next fenced attempt is scheduled, when one is. NULLABLE on the wire. */
    readonly nextAttemptAt: string | null
    /** The refusal class of the last failed attempt, when it failed. NULLABLE on the wire. */
    readonly failureCode: string | null
    /** The fencing generation the current recovery targets. NULLABLE on the wire. */
    readonly targetGeneration: string | null
    /** The sync revision the workspace must reach. NULLABLE on the wire. */
    readonly requiredSyncRevision: string | null
    /** The sync revision already applied. NULLABLE on the wire. */
    readonly appliedSyncRevision: string | null
    /** When the required sync completed, when it did. NULLABLE on the wire. */
    readonly syncCompletedAt: string | null
    /** When the backend last observed this recovery row. NULLABLE on the wire. */
    readonly observedAt: string | null
    /** The data scope a recovery may restore. */
    readonly recoverableDataScope: string
}

/**
 * Owner-scoped aggregate used by the AgentOS workspace control center.
 *
 * `instance` is null for an owned workspace that has no AgentOS instance yet: the backend answers
 * the workspace and its status, reports both apps unavailable with reason `WORKSPACE_NOT_PROVISIONED`,
 * and carries no runtime. `recovery` is null while the workspace has no recovery order; a workspace
 * the account does not own is refused, never answered with a null.
 */
export type AgentWorkspaceControlCenter = {
    readonly workspace: {
        readonly id: string
        readonly name: string | null
        readonly status: string
        readonly externalWorkspaceRef: string | null
    }
    readonly instance: {
        readonly id: string
        readonly name: string
        readonly hostname: string
        readonly status: string
        readonly chartVersion: string
        readonly ramMb: number
        readonly vcpu: number
        readonly planCode: string | null
        readonly planRamGb: number | null
        readonly planVcpu: number | null
    } | null
    readonly apps: ReadonlyArray<AgentWorkspaceAppCapability>
    readonly runtime: AgentWorkspaceRuntime | null
    /** Present once the serving backend publishes the owner-safe recovery facet; null while the workspace has no recovery order. */
    readonly recovery?: AgentWorkspaceRecovery | null
}

/** One credential-free callback grant for opening a workspace application. */
export type AgentWorkspaceAppLaunch = {
    readonly launchId: string
    readonly redirectUrl: string
    readonly expiresAt: string
}

/** Updated expiry returned after the main Nivo window renews a launch lease. */
export type RenewedAgentWorkspaceAppLaunch = {
    readonly launchId: string
    readonly expiresAt: string
}

/** The fields a workspace row needs. */
const AGENT_WORKSPACE = "{ id name status catalogOrder { id } }"

/**
 * The agent workspaces this account owns.
 *
 * SINGULAR NAME, LIST PAYLOAD. The field is `myAgentWorkspace` and it answers `[AgentWorkspaceEntity!]`.
 * A caller that typed it as one object would read `undefined` off an array on the first account that
 * owns one.
 *
 * @returns Every workspace, or why there is none.
 */
export const myAgentWorkspace = (): Promise<Outcome<ReadonlyArray<AgentWorkspaceRow>>> =>
    graphql(
        `query MyAgentWorkspace { myAgentWorkspace { data ${AGENT_WORKSPACE} message success error } }`,
        parseAgentWorkspaceRows,
    )

/** Fetch one exact workspace control center; the backend enforces viewer ownership. */
export const myAgentWorkspaceControlCenter = (workspaceId: string): Promise<Outcome<AgentWorkspaceControlCenter>> =>
    graphql(
        `
            query MyAgentWorkspaceControlCenter($request: MyAgentWorkspaceControlCenterRequest!) {
                myAgentWorkspaceControlCenter(request: $request) {
                    data {
                        workspace {
                            id
                            name
                            status
                            externalWorkspaceRef
                        }
                        instance {
                            id
                            name
                            hostname
                            status
                            chartVersion
                            ramMb
                            vcpu
                            planCode
                            planRamGb
                            planVcpu
                        }
                        apps {
                            app
                            accessMode
                            available
                            reason
                            observedVersion
                        }
                        runtime {
                            instanceId
                            appKey
                            status
                            releaseName
                            chartName
                            chartVersion
                            probeStatus
                            fingerprint
                            lastError
                            observedAt
                            stale
                            components {
                                key
                                kind
                                status
                                desiredReplicas
                                readyReplicas
                                image
                                pvcSize
                                storagePolicy
                                cpuUsageMillicores
                                cpuRequestMillicores
                                cpuLimitMillicores
                                memoryUsageBytes
                                memoryRequestBytes
                                memoryLimitBytes
                                restartCount
                                lastTerminationReason
                                oomKilled
                                throttled
                            }
                            storage {
                                key
                                kind
                                size
                                policy
                                status
                            }
                            totals {
                                cpuUsageMillicores
                                cpuRequestMillicores
                                cpuLimitMillicores
                                memoryUsageBytes
                                memoryRequestBytes
                                memoryLimitBytes
                                restartCount
                                oomKilled
                                throttled
                            }
                        }
                        recovery {
                            state
                            phase
                            attemptCount
                            lastAttemptAt
                            nextAttemptAt
                            failureCode
                            targetGeneration
                            requiredSyncRevision
                            appliedSyncRevision
                            syncCompletedAt
                            observedAt
                            recoverableDataScope
                        }
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseAgentWorkspaceControlCenter,
        {
            request: { workspaceId },
        },
    )

/** Issue one owner-scoped OpenClaw launch without exposing a gateway credential. */
export const issueAgentWorkspaceAppLaunch = (workspaceId: string): Promise<Outcome<AgentWorkspaceAppLaunch>> =>
    graphql(
        `
            mutation IssueAgentWorkspaceAppLaunch($input: IssueAgentWorkspaceAppLaunchInput!) {
                issueAgentWorkspaceAppLaunch(request: $input) {
                    data {
                        launchId
                        redirectUrl
                        expiresAt
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseAgentWorkspaceAppLaunch,
        {
            input: {
                workspaceId,
                app: "Openclaw",
            },
        },
    )

/** Keep one redeemed workspace launch alive while the Nivo owner remains present. */
export const renewAgentWorkspaceAppLaunch = (launchId: string): Promise<Outcome<RenewedAgentWorkspaceAppLaunch>> =>
    graphql(
        `
            mutation RenewAgentWorkspaceAppLaunch($input: RenewAgentWorkspaceAppLaunchInput!) {
                renewAgentWorkspaceAppLaunch(request: $input) {
                    data {
                        launchId
                        expiresAt
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseRenewedAgentWorkspaceAppLaunch,
        {
            input: {
                launchId,
            },
        },
    )

/** Revoke a workspace launch when its owner closes the popup or leaves Nivo. */
export const revokeAgentWorkspaceAppLaunch = (
    launchId: string,
): Promise<
    Outcome<{
        readonly launchId: string
        readonly revoked: boolean
    }>
> =>
    graphql(
        `
            mutation RevokeAgentWorkspaceAppLaunch($input: RevokeAgentWorkspaceAppLaunchInput!) {
                revokeAgentWorkspaceAppLaunch(request: $input) {
                    data {
                        launchId
                        revoked
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseRevokedAgentWorkspaceAppLaunch,
        {
            input: {
                launchId,
            },
        },
    )
