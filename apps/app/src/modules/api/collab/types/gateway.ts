import type { CollabOperation } from "./operation"
import type {
    CollabAcceptInvitationRequest,
    CollabAvailableCommandsRequest,
    CollabChangeMemberRoleRequest,
    CollabInviteByEmailRequest,
    CollabListTasksRequest,
    CollabOpenNoticeRequest,
    CollabOpenOfficeRequest,
    CollabPostMessageRequest,
    CollabPressApprovalButtonRequest,
    CollabReadGroupRequest,
    CollabReadNoticesRequest,
    CollabReadTaskRequest,
    CollabReconcileRequest,
    CollabWithdrawInvitationRequest,
} from "../../__generated__/core"

/** Failure categories returned by the Collab gateway boundary. */
export type CollabFailureKind = "unauthenticated" | "denied" | "invalid" | "conflict" | "unavailable" | "unknown"

/** The generated request input after this client has already separated its shared workspace scope. */
type CollabRequestInputMap = {
    readonly openOffice: Omit<CollabOpenOfficeRequest, "workspaceId">
    readonly readGroup: Omit<CollabReadGroupRequest, "workspaceId">
    readonly postMessage: Omit<CollabPostMessageRequest, "workspaceId">
    readonly pressApprovalButton: Omit<CollabPressApprovalButtonRequest, "workspaceId">
    readonly listTasks: Omit<CollabListTasksRequest, "workspaceId">
    readonly readTask: Omit<CollabReadTaskRequest, "workspaceId">
    readonly availableCommands: Omit<CollabAvailableCommandsRequest, "workspaceId">
    readonly readNotices: Omit<CollabReadNoticesRequest, "workspaceId">
    readonly openNotice: Omit<CollabOpenNoticeRequest, "workspaceId">
    readonly reconcileRequest: Omit<CollabReconcileRequest, "workspaceId">
    readonly inviteByEmail: Omit<CollabInviteByEmailRequest, "workspaceId">
    readonly acceptInvitation: Omit<CollabAcceptInvitationRequest, "workspaceId">
    readonly withdrawInvitation: Omit<CollabWithdrawInvitationRequest, "workspaceId">
    readonly changeMemberRole: Omit<CollabChangeMemberRoleRequest, "workspaceId">
}

/** The tagged member request the ingress resolves against one verified member identity. */
export type CollabGatewayRequest = {
    [OperationName in CollabOperation]: {
        readonly workspaceId: string
        readonly op: OperationName
        readonly input: CollabRequestInputMap[OperationName]
    }
}[CollabOperation]

/* ------------------------------------------------------------------ */

/** Public projection of the workspace's one Office group. */
