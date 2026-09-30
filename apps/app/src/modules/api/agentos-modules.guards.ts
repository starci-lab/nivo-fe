/**
 * The parsers of the solution-module documents' payloads: catalog, installations and the canonical
 * installation detail. Each returns the value or null, which `graphql` reports as `unavailable`.
 */

import { isNullableString, isNumber, isOneOf, isRecord, isString, isStringArray, parseEach } from "@nivo/api"
import type {
    AgentosModuleInstallation,
    AgentosModuleInstallationDetail,
    AgentosSolutionModule,
} from "./agentos-modules"

const parseSolutionModule = (value: unknown): AgentosSolutionModule | null =>
    isRecord(value) &&
    isString(value.key) &&
    isString(value.version) &&
    isString(value.name) &&
    isString(value.summary) &&
    isStringArray(value.agentRoles) &&
    isStringArray(value.channelRoles) &&
    isString(value.safetyMode)
        ? {
              key: value.key,
              version: value.version,
              name: value.name,
              summary: value.summary,
              agentRoles: value.agentRoles,
              channelRoles: value.channelRoles,
              safetyMode: value.safetyMode,
          }
        : null

/** Parse the `data` of `myAgentosSolutionModules`. */
export const parseSolutionModules = (input: unknown): ReadonlyArray<AgentosSolutionModule> | null =>
    parseEach(input, parseSolutionModule)

/** Parse one installation row - also the `data` of `installAgentosSolutionModule`. */
export const parseModuleInstallation = (input: unknown): AgentosModuleInstallation | null =>
    isRecord(input) &&
    isString(input.id) &&
    isString(input.agentWorkspaceId) &&
    isString(input.moduleKey) &&
    isString(input.moduleVersion) &&
    isString(input.displayName) &&
    isString(input.status) &&
    isNullableString(input.failureCode) &&
    isString(input.createdAt) &&
    isString(input.updatedAt)
        ? {
              id: input.id,
              agentWorkspaceId: input.agentWorkspaceId,
              moduleKey: input.moduleKey,
              moduleVersion: input.moduleVersion,
              displayName: input.displayName,
              status: input.status,
              failureCode: input.failureCode,
              createdAt: input.createdAt,
              updatedAt: input.updatedAt,
          }
        : null

/** Parse the `data` of `myAgentosModuleInstallations`. */
export const parseModuleInstallations = (input: unknown): ReadonlyArray<AgentosModuleInstallation> | null =>
    parseEach(input, parseModuleInstallation)

const parseKnowledgeArtifact = (
    value: unknown,
): NonNullable<AgentosModuleInstallationDetail["knowledgeArtifact"]> | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.knowledgeVersion) &&
    isString(value.sourceDigest) &&
    isString(value.snapshotDigest) &&
    isString(value.embeddingProfile) &&
    isNumber(value.embeddingDimension) &&
    isNumber(value.pointCount)
        ? {
              id: value.id,
              knowledgeVersion: value.knowledgeVersion,
              sourceDigest: value.sourceDigest,
              snapshotDigest: value.snapshotDigest,
              embeddingProfile: value.embeddingProfile,
              embeddingDimension: value.embeddingDimension,
              pointCount: value.pointCount,
          }
        : null

/** Parse the `data` of `myAgentosModuleInstallation`. */
export const parseModuleInstallationDetail = (input: unknown): AgentosModuleInstallationDetail | null => {
    if (
        !isRecord(input) ||
        !isString(input.id) ||
        !isString(input.agentWorkspaceId) ||
        !isString(input.moduleKey) ||
        !isString(input.moduleVersion) ||
        !isString(input.status) ||
        !isNullableString(input.sagaId) ||
        !isStringArray(input.generatedAgentIds) ||
        !isStringArray(input.sharedKnowledgeSourceIds) ||
        !isStringArray(input.channelAccountRefs) ||
        !isString(input.commonKnowledgeVersion) ||
        !isString(input.privateKnowledgeVersion) ||
        !isString(input.manifestDigest) ||
        !isString(input.modelProfileRef) ||
        !isNullableString(input.desiredDigest) ||
        !isNullableString(input.appliedDigest) ||
        !isOneOf(input.knowledgeState, ["recovering", "current", "refused"]) ||
        !isNullableString(input.failureCode)
    ) {
        return null
    }
    const knowledgeArtifact =
        input.knowledgeArtifact === null || input.knowledgeArtifact === undefined
            ? null
            : parseKnowledgeArtifact(input.knowledgeArtifact)
    if (input.knowledgeArtifact !== null && input.knowledgeArtifact !== undefined && knowledgeArtifact === null) {
        return null
    }
    const scope = input.retrievalScope
    if (
        !isRecord(scope) ||
        !isString(scope.installationId) ||
        !isString(scope.moduleKey) ||
        !isString(scope.knowledgeVersion)
    ) {
        return null
    }
    return {
        id: input.id,
        agentWorkspaceId: input.agentWorkspaceId,
        moduleKey: input.moduleKey,
        moduleVersion: input.moduleVersion,
        status: input.status,
        sagaId: input.sagaId,
        generatedAgentIds: input.generatedAgentIds,
        sharedKnowledgeSourceIds: input.sharedKnowledgeSourceIds,
        channelAccountRefs: input.channelAccountRefs,
        commonKnowledgeVersion: input.commonKnowledgeVersion,
        privateKnowledgeVersion: input.privateKnowledgeVersion,
        manifestDigest: input.manifestDigest,
        modelProfileRef: input.modelProfileRef,
        desiredDigest: input.desiredDigest,
        appliedDigest: input.appliedDigest,
        knowledgeState: input.knowledgeState,
        knowledgeArtifact,
        retrievalScope: {
            installationId: scope.installationId,
            moduleKey: scope.moduleKey,
            knowledgeVersion: scope.knowledgeVersion,
        },
        failureCode: input.failureCode,
    }
}
