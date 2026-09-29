/**
 * The solution modules a workspace can install, and the installations it holds.
 *
 * Every operation selects exactly one root field (`graphql` reads the first one and no more), returns an
 * `Outcome` and never throws; a caller keys its sentence off `code`, never off the server's English `reason`.
 * The nullability of every type is the schema's, not a guess.
 */

import type { Outcome } from "./outcome"
import { graphql } from "./graphql"
import {
    parseModuleInstallation,
    parseModuleInstallationDetail,
    parseModuleInstallations,
    parseSolutionModules,
} from "./agentos-modules.guards"

/** Immutable AgentOS solution package offered by the Nivo catalog. */
export type AgentosSolutionModule = {
    readonly key: string
    readonly version: string
    readonly name: string
    readonly summary: string
    readonly agentRoles: ReadonlyArray<string>
    readonly channelRoles: ReadonlyArray<string>
    readonly safetyMode: string
}

/** Owner-scoped lifecycle row for one installed solution package. */
export type AgentosModuleInstallation = {
    readonly id: string
    readonly agentWorkspaceId: string
    readonly moduleKey: string
    readonly moduleVersion: string
    readonly displayName: string
    readonly status: string
    readonly failureCode: string | null
    readonly createdAt: string
    readonly updatedAt: string
}

/** Canonical detail snapshot for one installed AgentOS solution package. */
export type AgentosModuleInstallationDetail = {
    readonly id: string
    readonly agentWorkspaceId: string
    readonly moduleKey: string
    readonly moduleVersion: string
    readonly status: string
    readonly sagaId: string | null
    readonly generatedAgentIds: ReadonlyArray<string>
    readonly sharedKnowledgeSourceIds: ReadonlyArray<string>
    readonly channelAccountRefs: ReadonlyArray<string>
    readonly commonKnowledgeVersion: string
    readonly privateKnowledgeVersion: string
    readonly manifestDigest: string
    readonly modelProfileRef: string
    readonly desiredDigest: string | null
    readonly appliedDigest: string | null
    readonly knowledgeState: "recovering" | "current" | "refused"
    readonly knowledgeArtifact: {
        readonly id: string
        readonly knowledgeVersion: string
        readonly sourceDigest: string
        readonly snapshotDigest: string
        readonly embeddingProfile: string
        readonly embeddingDimension: number
        readonly pointCount: number
    } | null
    readonly retrievalScope: {
        readonly installationId: string
        readonly moduleKey: string
        readonly knowledgeVersion: string
    }
    readonly failureCode: string | null
}

/** Customer choice required to start one immutable solution-module installation. */
export type InstallAgentosSolutionModuleInput = {
    readonly agentWorkspaceId: string
    readonly moduleKey: AgentosSolutionModule["key"]
    readonly idempotencyKey: string
}

/** Read the immutable AgentOS solution-module catalog. */
export const myAgentosSolutionModules = (): Promise<Outcome<ReadonlyArray<AgentosSolutionModule>>> =>
    graphql(
        `
            query MyAgentosSolutionModules {
                myAgentosSolutionModules {
                    data {
                        key
                        version
                        name
                        summary
                        agentRoles
                        channelRoles
                        safetyMode
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseSolutionModules,
    )

/** Read installations belonging to one exact owner-scoped AgentOS workspace. */
export const myAgentosModuleInstallations = (
    agentWorkspaceId: string,
): Promise<Outcome<ReadonlyArray<AgentosModuleInstallation>>> =>
    graphql(
        `
            query MyAgentosModuleInstallations($request: MyAgentosModuleInstallationsRequest!) {
                myAgentosModuleInstallations(request: $request) {
                    data {
                        id
                        agentWorkspaceId
                        moduleKey
                        moduleVersion
                        displayName
                        status
                        failureCode
                        createdAt
                        updatedAt
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseModuleInstallations,
        {
            request: { agentWorkspaceId },
        },
    )

/** Read the canonical owner-scoped snapshot for one module installation. */
export const myAgentosModuleInstallation = (
    installationId: string,
): Promise<Outcome<AgentosModuleInstallationDetail>> =>
    graphql(
        `
            query MyAgentosModuleInstallation($request: MyAgentosModuleInstallationRequest!) {
                myAgentosModuleInstallation(request: $request) {
                    data {
                        id
                        agentWorkspaceId
                        moduleKey
                        moduleVersion
                        status
                        sagaId
                        failureCode
                        generatedAgentIds
                        sharedKnowledgeSourceIds
                        channelAccountRefs
                        commonKnowledgeVersion
                        privateKnowledgeVersion
                        manifestDigest
                        modelProfileRef
                        desiredDigest
                        appliedDigest
                        knowledgeState
                        knowledgeArtifact {
                            id
                            knowledgeVersion
                            sourceDigest
                            snapshotDigest
                            embeddingProfile
                            embeddingDimension
                            pointCount
                        }
                        retrievalScope {
                            installationId
                            moduleKey
                            knowledgeVersion
                        }
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseModuleInstallationDetail,
        {
            request: { installationId },
        },
    )

/** Install one immutable solution package using one browser-generated idempotency identity. */
export const installAgentosSolutionModule = (
    input: InstallAgentosSolutionModuleInput,
): Promise<Outcome<AgentosModuleInstallation>> =>
    graphql(
        `
            mutation InstallAgentosSolutionModule($input: InstallAgentosSolutionModuleInput!) {
                installAgentosSolutionModule(request: $input) {
                    data {
                        id
                        agentWorkspaceId
                        moduleKey
                        moduleVersion
                        displayName
                        status
                        failureCode
                        createdAt
                        updatedAt
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseModuleInstallation,
        {
            input: {
                ...input,
                modelProfileRef: "nivo-default",
                channelAccountRefs: [],
                sharedKnowledgeSourceIds: [],
            },
        },
    )
