import type { ModulePageTranslatorFor } from "./types"

/** Catalog entries used by the chatbot portion of the module workbench. */
export type ChatbotModulePageMessageKey =
    | "runtime.chatbot.ambiguous"
    | "runtime.chatbot.actionRefused"
    | "runtime.chatbot.approvedVersion"
    | "runtime.chatbot.automated"
    | "runtime.chatbot.channels"
    | "runtime.chatbot.connectZalo"
    | "runtime.chatbot.conversations"
    | "runtime.chatbot.openConversations"
    | "runtime.chatbot.closeConversations"
    | "runtime.chatbot.delivered"
    | "runtime.chatbot.deliveryPossibleStart"
    | "runtime.chatbot.deliveryQueued"
    | "runtime.chatbot.deliveryUnknown"
    | "runtime.chatbot.failedBeforeStart"
    | "runtime.chatbot.handoffPending"
    | "runtime.chatbot.humanOwned"
    | "runtime.chatbot.installation"
    | "runtime.chatbot.markDelivered"
    | "runtime.chatbot.markFailed"
    | "runtime.chatbot.messages"
    | "runtime.chatbot.noApprovedVersion"
    | "runtime.chatbot.noChannels"
    | "runtime.chatbot.noConversations"
    | "runtime.chatbot.noMessages"
    | "runtime.chatbot.pending"
    | "runtime.chatbot.permissionDenied"
    | "runtime.chatbot.providerAccepted"
    | "runtime.chatbot.read"
    | "runtime.chatbot.recorded"
    | "runtime.chatbot.refused"
    | "runtime.chatbot.requestHandoff"
    | "runtime.chatbot.resolveHandoff"
    | "runtime.chatbot.returnPending"
    | "runtime.chatbot.selectConversation"
    | "runtime.chatbot.selected"
    | "runtime.chatbot.terminalNotDelivered"
    | "runtime.chatbot.title"
    | "runtime.chatbot.cancelled"
    | "runtime.conversations.synced"
    | "runtime.conversations.syncing"
    | "runtime.conversations.takeover"
    | "runtime.conversations.title"
    | "runtime.conversations.unread"
    | "runtime.customerChat.ai"
    | "runtime.customerChat.approval"
    | "runtime.customerChat.approvalNotice"
    | "runtime.customerChat.approve"
    | "runtime.customerChat.context"
    | "runtime.customerChat.customer"
    | "runtime.customerChat.empty"
    | "runtime.customerChat.evidence"
    | "runtime.customerChat.historyNotice"
    | "runtime.customerChat.loading"
    | "runtime.customerChat.markFailed"
    | "runtime.customerChat.markSent"
    | "runtime.customerChat.operator"
    | "runtime.customerChat.reconciliation"
    | "runtime.customerChat.reconciliationNotice"
    | "runtime.customerChat.refused"
    | "runtime.customerChat.return"
    | "runtime.customerChat.select"
    | "runtime.customerChat.takeover"
    | "runtime.customerChat.title"
    | "runtime.deliveryStatus.ambiguous"
    | "runtime.deliveryStatus.approval_required"
    | "runtime.deliveryStatus.received"

type RuntimeConversationsUnreadValues = { readonly count: number }

type RuntimeCustomerChatContextValues = { readonly digest: string }

/** Build the chatbot translation branches without exposing the namespace translator to blocks. */
export const buildChatbotCopy = (t: ModulePageTranslatorFor<ChatbotModulePageMessageKey>) => ({
    chatbot: {
        ambiguous: t("runtime.chatbot.ambiguous"),
        actionRefused: t("runtime.chatbot.actionRefused"),
        approvedVersion: (version: string) => t("runtime.chatbot.approvedVersion", { version }),
        automated: t("runtime.chatbot.automated"),
        cancelled: t("runtime.chatbot.cancelled"),
        channels: t("runtime.chatbot.channels"),
        connectZalo: t("runtime.chatbot.connectZalo"),
        conversations: t("runtime.chatbot.conversations"),
        openConversations: t("runtime.chatbot.openConversations"),
        closeConversations: t("runtime.chatbot.closeConversations"),
        delivered: t("runtime.chatbot.delivered"),
        deliveryPossibleStart: t("runtime.chatbot.deliveryPossibleStart"),
        deliveryQueued: t("runtime.chatbot.deliveryQueued"),
        deliveryUnknown: t("runtime.chatbot.deliveryUnknown"),
        failedBeforeStart: t("runtime.chatbot.failedBeforeStart"),
        handoffPending: t("runtime.chatbot.handoffPending"),
        humanOwned: t("runtime.chatbot.humanOwned"),
        installation: t("runtime.chatbot.installation"),
        markDelivered: t("runtime.chatbot.markDelivered"),
        markFailed: t("runtime.chatbot.markFailed"),
        messages: t("runtime.chatbot.messages"),
        noApprovedVersion: t("runtime.chatbot.noApprovedVersion"),
        noChannels: t("runtime.chatbot.noChannels"),
        noConversations: t("runtime.chatbot.noConversations"),
        noMessages: t("runtime.chatbot.noMessages"),
        pending: t("runtime.chatbot.pending"),
        permissionDenied: t("runtime.chatbot.permissionDenied"),
        providerAccepted: t("runtime.chatbot.providerAccepted"),
        read: t("runtime.chatbot.read"),
        recorded: t("runtime.chatbot.recorded"),
        refused: t("runtime.chatbot.refused"),
        requestHandoff: t("runtime.chatbot.requestHandoff"),
        resolveHandoff: t("runtime.chatbot.resolveHandoff"),
        returnPending: t("runtime.chatbot.returnPending"),
        selectConversation: t("runtime.chatbot.selectConversation"),
        selected: t("runtime.chatbot.selected"),
        terminalNotDelivered: t("runtime.chatbot.terminalNotDelivered"),
        title: t("runtime.chatbot.title"),
    },
    conversations: {
        synced: t("runtime.conversations.synced"),
        syncing: t("runtime.conversations.syncing"),
        takeover: t("runtime.conversations.takeover"),
        title: t("runtime.conversations.title"),
        unread: (values: RuntimeConversationsUnreadValues) => t("runtime.conversations.unread", values),
    },
    customerChat: {
        ai: t("runtime.customerChat.ai"),
        approval: t("runtime.customerChat.approval"),
        approvalNotice: t("runtime.customerChat.approvalNotice"),
        approve: t("runtime.customerChat.approve"),
        context: (values: RuntimeCustomerChatContextValues) => t("runtime.customerChat.context", values),
        customer: t("runtime.customerChat.customer"),
        empty: t("runtime.customerChat.empty"),
        evidence: t("runtime.customerChat.evidence"),
        historyNotice: t("runtime.customerChat.historyNotice"),
        loading: t("runtime.customerChat.loading"),
        markFailed: t("runtime.customerChat.markFailed"),
        markSent: t("runtime.customerChat.markSent"),
        operator: t("runtime.customerChat.operator"),
        reconciliation: t("runtime.customerChat.reconciliation"),
        reconciliationNotice: t("runtime.customerChat.reconciliationNotice"),
        refused: t("runtime.customerChat.refused"),
        return: t("runtime.customerChat.return"),
        select: t("runtime.customerChat.select"),
        takeover: t("runtime.customerChat.takeover"),
        title: t("runtime.customerChat.title"),
    },
    deliveryStatus: {
        ambiguous: t("runtime.deliveryStatus.ambiguous"),
        approval_required: t("runtime.deliveryStatus.approval_required"),
        received: t("runtime.deliveryStatus.received"),
    },
})
