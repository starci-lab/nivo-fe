/**
 * The parsers of the module-studio documents' payloads. Each returns the value or null, which
 * `graphql` reports as `unavailable`. Secret values are never part of these shapes.
 */

import { isNullableString, isNumber, isOneOf, isRecord, isString, isStringArray, parseEach } from "@nivo/api"
import type {
    MyAgentosCustomModuleStudioQuery,
    PrepareAgentosModuleAttachmentUploadMutation,
} from "./__generated__/core"

type Studio = NonNullable<MyAgentosCustomModuleStudioQuery["myAgentosCustomModuleStudio"]["data"]>
type CustomModule = Studio["module"]
type StudioMessage = Studio["messages"][number]
type StudioAttachment = Studio["attachments"][number]
type StudioIntegration = Studio["integrations"][number]
type StudioSpecification = NonNullable<Studio["specification"]>
type UploadCapability = NonNullable<PrepareAgentosModuleAttachmentUploadMutation["prepareAgentosModuleAttachmentUpload"]["data"]>

const parseCustomModule = (value: unknown): CustomModule | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.agentWorkspaceId) &&
    isString(value.name) &&
    isOneOf(value.status, ["draft", "ready_for_review", "publishing", "active", "publish_failed"]) &&
    isNumber(value.progress) &&
    isStringArray(value.missingFields) &&
    isNullableString(value.currentQuestion) &&
    (value.specificationVersion === null || isNumber(value.specificationVersion)) &&
    isNullableString(value.installationId) &&
    isNullableString(value.failureCode)
        ? {
              id: value.id,
              agentWorkspaceId: value.agentWorkspaceId,
              name: value.name,
              status: value.status,
              progress: value.progress,
              missingFields: value.missingFields,
              currentQuestion: value.currentQuestion,
              specificationVersion: value.specificationVersion,
              installationId: value.installationId,
              failureCode: value.failureCode,
          }
        : null

const parseProfileFact = (value: unknown): Studio["profileFacts"][number] | null =>
    isRecord(value) && isString(value.key) && isString(value.value)
        ? { key: value.key, value: value.value }
        : null

const parseStudioMessage = (value: unknown): StudioMessage | null =>
    isRecord(value) &&
    isString(value.id) &&
    isOneOf(value.role, ["assistant", "user"]) &&
    isString(value.content) &&
    isNumber(value.sequence)
        ? { id: value.id, role: value.role, content: value.content, sequence: value.sequence }
        : null

const parseStudioAttachment = (value: unknown): StudioAttachment | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.fileName) &&
    isString(value.mediaType) &&
    isNumber(value.sizeBytes) &&
    isOneOf(value.status, ["uploading", "scanning", "ready", "refused"]) &&
    isOneOf(value.ingestionStatus, [
        "pending",
        "scanning",
        "extracting",
        "embedding",
        "indexing",
        "indexed",
        "refused",
        "removed",
    ]) &&
    isNullableString(value.detectedMediaType) &&
    isNullableString(value.sha256) &&
    isNumber(value.chunkCount) &&
    isNullableString(value.indexedAt) &&
    isNullableString(value.retrievalRemovedAt) &&
    isOneOf(value.objectDeletionStatus, ["retained", "pending", "deleted", "failed"]) &&
    isNullableString(value.objectDeletionDueAt) &&
    isNullableString(value.failureCode)
        ? {
              id: value.id,
              fileName: value.fileName,
              mediaType: value.mediaType,
              sizeBytes: value.sizeBytes,
              status: value.status,
              ingestionStatus: value.ingestionStatus,
              detectedMediaType: value.detectedMediaType,
              sha256: value.sha256,
              chunkCount: value.chunkCount,
              indexedAt: value.indexedAt,
              retrievalRemovedAt: value.retrievalRemovedAt,
              objectDeletionStatus: value.objectDeletionStatus,
              objectDeletionDueAt: value.objectDeletionDueAt,
              failureCode: value.failureCode,
          }
        : null

const parseStudioIntegration = (value: unknown): StudioIntegration | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.providerKey) &&
    isString(value.maskedHint) &&
    isOneOf(value.status, ["configured", "refused"])
        ? { id: value.id, providerKey: value.providerKey, maskedHint: value.maskedHint, status: value.status }
        : null

const parseStudioSpecification = (value: unknown): StudioSpecification | null =>
    isRecord(value) &&
    isString(value.id) &&
    isNumber(value.version) &&
    isOneOf(value.status, ["ready", "published", "publish_failed"])
        ? { id: value.id, version: value.version, status: value.status }
        : null

/** Parse the `data` of `myAgentosCustomModuleStudio` and every studio mutation. */
export const parseModuleStudio = (input: unknown): Studio | null => {
    if (!isRecord(input)) return null
    const module_ = parseCustomModule(input.module)
    const profileFacts = parseEach(input.profileFacts, parseProfileFact)
    const messages = parseEach(input.messages, parseStudioMessage)
    const attachments = parseEach(input.attachments, parseStudioAttachment)
    const integrations = parseEach(input.integrations, parseStudioIntegration)
    const specification =
        input.specification === null || input.specification === undefined
            ? null
            : parseStudioSpecification(input.specification)
    if (
        module_ === null ||
        profileFacts === null ||
        messages === null ||
        attachments === null ||
        integrations === null ||
        (input.specification !== null && input.specification !== undefined && specification === null)
    ) {
        return null
    }
    return { module: module_, profileFacts, messages, attachments, integrations, specification }
}

/** Parse the `data` of `prepareAgentosModuleAttachmentUpload`: the studio plus the capability. */
export const parseModuleUploadCapability = (input: unknown): UploadCapability | null => {
    if (!isRecord(input)) return null
    const studio = parseModuleStudio(input)
    if (
        studio === null ||
        !isString(input.attachmentId) ||
        !isString(input.uploadUrl) ||
        input.uploadMethod !== "PUT" ||
        !isString(input.uploadExpiresAt)
    ) {
        return null
    }
    return {
        ...studio,
        attachmentId: input.attachmentId,
        uploadUrl: input.uploadUrl,
        uploadMethod: "PUT",
        uploadExpiresAt: input.uploadExpiresAt,
    }
}
