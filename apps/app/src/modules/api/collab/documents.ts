import type { CollabOperation } from "./types"

/** Root field selected by each generated Collab operation document. */
export const COLLAB_OPERATION_FIELDS: Readonly<Record<CollabOperation, string>> = {
    openOffice: "collabOpenOffice",
    readGroup: "collabReadGroup",
    postMessage: "collabPostMessage",
    pressApprovalButton: "collabPressApprovalButton",
    listTasks: "collabListTasks",
    readTask: "collabReadTask",
    availableCommands: "collabAvailableCommands",
    readNotices: "collabReadNotices",
    openNotice: "collabOpenNotice",
    reconcileRequest: "collabReconcileRequest",
    inviteByEmail: "collabInviteByEmail",
    acceptInvitation: "collabAcceptInvitation",
    withdrawInvitation: "collabWithdrawInvitation",
    changeMemberRole: "collabChangeMemberRole",
}
