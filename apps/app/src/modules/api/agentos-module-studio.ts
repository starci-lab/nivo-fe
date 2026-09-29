/**
 * The custom-module studio: intake, attachments and their byte uploads, integration secrets and publication.
 *
 * Every operation selects exactly one root field (`graphql` reads the first one and no more), returns an
 * `Outcome` and never throws; a caller keys its sentence off `code`, never off the server's English `reason`.
 * The nullability of every type is the schema's, not a guess.
 */

import type { Outcome } from "./outcome";
import { graphql } from "./graphql";
import { CORE_API_ORIGIN } from "@/modules/config";
import { send } from "./transport";

/** A byte upload may legitimately outlast an ordinary call. */
const UPLOAD_TIMEOUT_MS = 120_000;

/** Backend-owned lifecycle for one workspace custom module. */
export type AgentosCustomModuleStatus = "draft" | "ready_for_review" | "publishing" | "active" | "publish_failed";

/** One workspace-owned custom module summary returned to the collection. */
export type AgentosCustomModule = {
  readonly id: string;
  readonly agentWorkspaceId: string;
  readonly name: string;
  readonly status: AgentosCustomModuleStatus;
  readonly progress: number;
  readonly missingFields: ReadonlyArray<string>;
  readonly currentQuestion: string | null;
  readonly specificationVersion: number | null;
  readonly installationId: string | null;
  readonly failureCode: string | null;
};

/** Complete resumable studio projection for one owned custom module. */
export type AgentosModuleStudio = {
  readonly module: AgentosCustomModule;
  readonly profileFacts: ReadonlyArray<{
    readonly key: string;
    readonly value: string;
  }>;
  readonly messages: ReadonlyArray<{
    readonly id: string;
    readonly role: "assistant" | "user";
    readonly content: string;
    readonly sequence: number;
  }>;
  readonly attachments: ReadonlyArray<{
    readonly id: string;
    readonly fileName: string;
    readonly mediaType: string;
    readonly sizeBytes: number;
    readonly status: "uploading" | "scanning" | "ready" | "refused";
    readonly ingestionStatus: "pending" | "scanning" | "extracting" | "embedding" | "indexing" | "indexed" | "refused" | "removed";
    readonly detectedMediaType: string | null;
    readonly sha256: string | null;
    readonly chunkCount: number;
    readonly indexedAt: string | null;
    readonly retrievalRemovedAt: string | null;
    readonly objectDeletionStatus: "retained" | "pending" | "deleted" | "failed";
    readonly objectDeletionDueAt: string | null;
    readonly failureCode: string | null;
  }>;
  readonly integrations: ReadonlyArray<{
    readonly id: string;
    readonly providerKey: string;
    readonly maskedHint: string;
    readonly status: "configured" | "refused";
  }>;
  readonly specification: {
    readonly id: string;
    readonly version: number;
    readonly status: "ready" | "published" | "publish_failed";
  } | null;
};

const MODULE_STUDIO_FIELDS = `
    module { id agentWorkspaceId name status progress missingFields currentQuestion specificationVersion installationId failureCode }
    profileFacts { key value }
    messages { id role content sequence }
    attachments { id fileName mediaType sizeBytes status ingestionStatus detectedMediaType sha256 chunkCount indexedAt retrievalRemovedAt objectDeletionStatus objectDeletionDueAt failureCode }
    integrations { id providerKey maskedHint status }
    specification { id version status }
`;

/** Read custom drafts and active custom modules belonging to one exact workspace. */
export const myAgentosCustomModules = (agentWorkspaceId: string): Promise<Outcome<ReadonlyArray<AgentosCustomModule>>> => graphql(`query MyAgentosCustomModules($request: MyAgentosCustomModulesRequest!) {
            myAgentosCustomModules(request: $request) {
                data { id agentWorkspaceId name status progress missingFields currentQuestion specificationVersion installationId failureCode }
                message success error
            }
        }`, {
  request: { agentWorkspaceId }
});

/** Resume the durable module studio for one owner-scoped module. */
export const myAgentosCustomModuleStudio = (agentWorkspaceId: string, moduleId: string): Promise<Outcome<AgentosModuleStudio>> => graphql(`query MyAgentosCustomModuleStudio($request: MyAgentosCustomModuleStudioRequest!) {
            myAgentosCustomModuleStudio(request: $request) {
                data { ${MODULE_STUDIO_FIELDS} }
                message success error
            }
        }`, {
  request: { agentWorkspaceId, moduleId }
});

const studioMutation = (name: string, inputType: string, input: Readonly<Record<string, unknown>>): Promise<Outcome<AgentosModuleStudio>> => graphql(`mutation ${name}($input: ${inputType}!) {
            ${name[0]?.toLowerCase()}${name.slice(1)}(request: $input) {
                data { ${MODULE_STUDIO_FIELDS} }
                message success error
            }
        }`, {
  input
});

type StartAgentosCustomModuleIntakeInput = {
  readonly agentWorkspaceId: string;
  readonly goal: string;
  readonly idempotencyKey: string;
};

type AnswerAgentosCustomModuleIntakeInput = {
  readonly agentWorkspaceId: string;
  readonly moduleId: string;
  readonly answer: string;
};

/** File metadata required before Core issues one short-lived upload capability. */
export type PrepareAgentosModuleAttachmentUploadInput = {
  readonly agentWorkspaceId: string;
  readonly moduleId: string;
  readonly fileName: string;
  readonly mediaType: string;
  readonly sizeBytes: number;
};

/** Stable attachment identity used by ingestion retry and removal commands. */
export type AgentosModuleAttachmentIdentityInput = {
  readonly agentWorkspaceId: string;
  readonly moduleId: string;
  readonly attachmentId: string;
};

type SaveAgentosModuleIntegrationSecretInput = {
  readonly agentWorkspaceId: string;
  readonly moduleId: string;
  readonly providerKey: string;
  readonly secret: string;
};

type AgentosModuleIntegrationIdentityInput = {
  readonly agentWorkspaceId: string;
  readonly moduleId: string;
  readonly providerKey: string;
};

type PublishAgentosCustomModuleInput = {
  readonly agentWorkspaceId: string;
  readonly moduleId: string;
  readonly acknowledgedVersion: number;
  readonly idempotencyKey: string;
};

/** Create the durable draft only after its first meaningful goal is submitted. */
export const startAgentosCustomModuleIntake = (input: StartAgentosCustomModuleIntakeInput) => studioMutation("StartAgentosCustomModuleIntake", "StartAgentosCustomModuleIntakeInput", input);

/** Persist one accepted answer before asking the backend for the next unresolved question. */
export const answerAgentosCustomModuleIntake = (input: AnswerAgentosCustomModuleIntakeInput) => studioMutation("AnswerAgentosCustomModuleIntake", "AnswerAgentosCustomModuleIntakeInput", input);

/** Browser upload contract: studio state plus one short-lived PUT-only capability. */
export type AgentosModuleUploadCapability = AgentosModuleStudio & {
  readonly attachmentId: string;
  readonly uploadUrl: string;
  readonly uploadMethod: "PUT";
  readonly uploadExpiresAt: string;
};

/** Resolve a backend-issued relative capability without exposing internal object-storage hosts. */
export const resolveCoreApiCapabilityUrl = (capabilityUrl: string): string => {
  return new URL(capabilityUrl, `${CORE_API_ORIGIN}/`).toString();
};

/** Register one quarantined file identity and return its bounded byte-transfer capability. */
export const prepareAgentosModuleAttachmentUpload = (input: PrepareAgentosModuleAttachmentUploadInput): Promise<Outcome<AgentosModuleUploadCapability>> => graphql(`mutation PrepareAgentosModuleAttachmentUpload($input: PrepareAgentosModuleAttachmentUploadInput!) {
            prepareAgentosModuleAttachmentUpload(request: $input) {
                data { ${MODULE_STUDIO_FIELDS} attachmentId uploadUrl uploadMethod uploadExpiresAt }
                message success error
            }
        }`, {
  input
});

/** Transfer bytes through one backend-issued upload capability; UI never owns raw transport. */
export const uploadAgentosModuleAttachment = async (capability: Pick<AgentosModuleUploadCapability, "uploadUrl" | "uploadMethod">, mediaType: string, body: Blob): Promise<Outcome<boolean>> => {
  const sent = await send({
    url: resolveCoreApiCapabilityUrl(capability.uploadUrl),
    method: capability.uploadMethod,
    // The capability URL is signed and short-lived; it is the credential, so no cookie or token rides along.
    credentials: "omit",
    contentType: mediaType,
    body,
    reply: "none",
    timeoutMs: UPLOAD_TIMEOUT_MS
  });
  return sent.ok ? { ok: true, data: true } : sent;
};

/** Mark the prepared attachment ready for external scanner processing. */
export const finalizeAgentosModuleAttachment = (input: AgentosModuleAttachmentIdentityInput) => studioMutation("FinalizeAgentosModuleAttachment", "FinalizeAgentosModuleAttachmentInput", input);

/** Replace one write-only integration secret and receive only masked configuration status. */
export const saveAgentosModuleIntegrationSecret = (input: SaveAgentosModuleIntegrationSecretInput) => studioMutation("SaveAgentosModuleIntegrationSecret", "SaveAgentosModuleIntegrationSecretInput", input);

/** Publish only the exact specification version the owner acknowledged. */
export const publishAgentosCustomModule = (input: PublishAgentosCustomModuleInput) => studioMutation("PublishAgentosCustomModule", "PublishAgentosCustomModuleInput", input);

/** Remove one owner-scoped attachment from the current module draft. */
export const removeAgentosModuleAttachment = (input: AgentosModuleAttachmentIdentityInput): Promise<Outcome<boolean>> => graphql(`mutation RemoveAgentosModuleAttachment($input: RemoveAgentosModuleAttachmentInput!) { removeAgentosModuleAttachment(request: $input) { data message success error } }`, {
  input
});

/** Remove one configured provider without ever reading its encrypted secret back. */
export const removeAgentosModuleIntegrationSecret = (input: AgentosModuleIntegrationIdentityInput): Promise<Outcome<boolean>> => graphql(`mutation RemoveAgentosModuleIntegrationSecret($input: RemoveAgentosModuleIntegrationSecretInput!) { removeAgentosModuleIntegrationSecret(request: $input) { data message success error } }`, {
  input
});
