import type { GraphqlDocument, Outcome } from "@nivo/api"
import {
    AcceptCollabInvitationDocument,
    ChangeCollabMemberRoleDocument,
    InviteCollabMemberByEmailDocument,
    ListCollabTasksDocument,
    OpenCollabNoticeDocument,
    OpenCollabOfficeDocument,
    PostCollabMessageDocument,
    PressCollabApprovalButtonDocument,
    ReadCollabAvailableCommandsDocument,
    ReadCollabGroupDocument,
    ReadCollabNoticesDocument,
    ReadCollabTaskDocument,
    ReconcileCollabRequestDocument,
    WithdrawCollabInvitationDocument,
} from "../__generated__/core"
import { graphqlFields } from "../graphql"
import { COLLAB_OPERATION_FIELDS } from "./documents"
import { collabFailure, collabOutcomeOfReply } from "./payload"
import { parseCollabMembershipResult } from "./payload.guards"
import type { CollabMembershipResult, CollabOperation, CollabServed, CollabTransport } from "./types"

/** Run one operation-specific generated document through the shared Collab boundary. */
const sendDocument = async <TVariables>(
    accessToken: string,
    operation: CollabOperation,
    field: string,
    document: GraphqlDocument<TVariables>,
    variables: TVariables,
): Promise<Outcome<CollabServed>> => {
    const answered = await graphqlFields(document, variables, { accessToken })
    if (!answered.ok) return answered
    return collabOutcomeOfReply(answered.data[field], operation)
}

/** The generated GraphQL documents for Collab's registered backend operations. */
export const collabGatewayTransport: CollabTransport = async ({ accessToken, request }) => {
    switch (request.op) {
        case "openOffice":
            return sendDocument(accessToken, request.op, COLLAB_OPERATION_FIELDS.openOffice, OpenCollabOfficeDocument, {
                request: { workspaceId: request.workspaceId },
            })
        case "readGroup":
            return sendDocument(accessToken, request.op, COLLAB_OPERATION_FIELDS.readGroup, ReadCollabGroupDocument, {
                request: { ...request.input, workspaceId: request.workspaceId },
            })
        case "listTasks":
            return sendDocument(accessToken, request.op, COLLAB_OPERATION_FIELDS.listTasks, ListCollabTasksDocument, {
                request: { ...request.input, workspaceId: request.workspaceId },
            })
        case "readTask":
            return sendDocument(accessToken, request.op, COLLAB_OPERATION_FIELDS.readTask, ReadCollabTaskDocument, {
                request: { ...request.input, workspaceId: request.workspaceId },
            })
        case "availableCommands":
            return sendDocument(
                accessToken,
                request.op,
                COLLAB_OPERATION_FIELDS.availableCommands,
                ReadCollabAvailableCommandsDocument,
                { request: { ...request.input, workspaceId: request.workspaceId } },
            )
        case "readNotices":
            return sendDocument(
                accessToken,
                request.op,
                COLLAB_OPERATION_FIELDS.readNotices,
                ReadCollabNoticesDocument,
                { request: { ...request.input, workspaceId: request.workspaceId } },
            )
        case "openNotice":
            return sendDocument(accessToken, request.op, COLLAB_OPERATION_FIELDS.openNotice, OpenCollabNoticeDocument, {
                request: { ...request.input, workspaceId: request.workspaceId },
            })
        case "reconcileRequest":
            return sendDocument(
                accessToken,
                request.op,
                COLLAB_OPERATION_FIELDS.reconcileRequest,
                ReconcileCollabRequestDocument,
                { request: { ...request.input, workspaceId: request.workspaceId } },
            )
        case "postMessage":
            return sendDocument(accessToken, request.op, COLLAB_OPERATION_FIELDS.postMessage, PostCollabMessageDocument, {
                request: { ...request.input, workspaceId: request.workspaceId },
            })
        case "pressApprovalButton":
            return sendDocument(
                accessToken,
                request.op,
                COLLAB_OPERATION_FIELDS.pressApprovalButton,
                PressCollabApprovalButtonDocument,
                { request: { ...request.input, workspaceId: request.workspaceId } },
            )
        case "inviteByEmail":
            return sendDocument(
                accessToken,
                request.op,
                COLLAB_OPERATION_FIELDS.inviteByEmail,
                InviteCollabMemberByEmailDocument,
                { request: { ...request.input, workspaceId: request.workspaceId } },
            )
        case "acceptInvitation":
            return sendDocument(
                accessToken,
                request.op,
                COLLAB_OPERATION_FIELDS.acceptInvitation,
                AcceptCollabInvitationDocument,
                { request: { ...request.input, workspaceId: request.workspaceId } },
            )
        case "withdrawInvitation":
            return sendDocument(
                accessToken,
                request.op,
                COLLAB_OPERATION_FIELDS.withdrawInvitation,
                WithdrawCollabInvitationDocument,
                { request: { ...request.input, workspaceId: request.workspaceId } },
            )
        case "changeMemberRole":
            return sendDocument(
                accessToken,
                request.op,
                COLLAB_OPERATION_FIELDS.changeMemberRole,
                ChangeCollabMemberRoleDocument,
                { request: { ...request.input, workspaceId: request.workspaceId } },
            )
    }
}

/** Send one tagged member request and preserve the boundary's own failure vocabulary. */
type CollabTransportCall = Parameters<CollabTransport>[0]

type CollabRequestArguments<T> = {
    [OperationName in CollabOperation]: [
        accessToken: string,
        workspaceId: string,
        op: OperationName,
        input: Extract<CollabTransportCall["request"], { readonly op: OperationName }>["input"],
        pick: (result: Record<string, unknown>) => T | null,
    ]
}[CollabOperation]

/** Route one operation-scoped Collab call through the transport and preserve its failure kind. */
export const collabRequest = async <T>(...args: CollabRequestArguments<T>): Promise<Outcome<T>> => {
    const [accessToken, workspaceId, op, input, pick] = args
    if (accessToken === "") {
        return collabFailure("unauthenticated", "COLLAB_UNAUTHENTICATED", "sign-in required", false)
    }
    if (workspaceId === "") {
        return collabFailure("invalid", "COLLAB_INVALID", "workspaceId required", false)
    }
    let served: Outcome<CollabServed>
    try {
        const sendRequest = async (): Promise<Outcome<CollabServed>> => {
            switch (op) {
                case "openOffice":
                    return collabGatewayTransport({ accessToken, request: { workspaceId, op, input } })
                case "readGroup":
                    return collabGatewayTransport({ accessToken, request: { workspaceId, op, input } })
                case "listTasks":
                    return collabGatewayTransport({ accessToken, request: { workspaceId, op, input } })
                case "readTask":
                    return collabGatewayTransport({ accessToken, request: { workspaceId, op, input } })
                case "availableCommands":
                    return collabGatewayTransport({ accessToken, request: { workspaceId, op, input } })
                case "readNotices":
                    return collabGatewayTransport({ accessToken, request: { workspaceId, op, input } })
                case "openNotice":
                    return collabGatewayTransport({ accessToken, request: { workspaceId, op, input } })
                case "reconcileRequest":
                    return collabGatewayTransport({ accessToken, request: { workspaceId, op, input } })
                case "postMessage":
                    return collabGatewayTransport({ accessToken, request: { workspaceId, op, input } })
                case "pressApprovalButton":
                    return collabGatewayTransport({ accessToken, request: { workspaceId, op, input } })
                case "inviteByEmail":
                    return collabGatewayTransport({ accessToken, request: { workspaceId, op, input } })
                case "acceptInvitation":
                    return collabGatewayTransport({ accessToken, request: { workspaceId, op, input } })
                case "withdrawInvitation":
                    return collabGatewayTransport({ accessToken, request: { workspaceId, op, input } })
                case "changeMemberRole":
                    return collabGatewayTransport({ accessToken, request: { workspaceId, op, input } })
            }
            return collabFailure("invalid", "COLLAB_INVALID", "unsupported operation", false)
        }
        served = await sendRequest()
    } catch {
        return collabFailure("unknown", "COLLAB_UNKNOWN", "transport threw", true)
    }
    if (!served.ok) return served
    try {
        const data = pick(served.data.result)
        if (data === null) return collabFailure("unknown", "COLLAB_UNKNOWN", "malformed result", true)
        return { ok: true, data }
    } catch {
        return collabFailure("unknown", "COLLAB_UNKNOWN", "malformed result", true)
    }
}

/** The `membership` result record of a member command, or null when malformed. */
export const readMembershipResult = (result: Record<string, unknown>): CollabMembershipResult | null =>
    parseCollabMembershipResult(result.membership)
