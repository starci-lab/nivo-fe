import type { createTranslator } from "next-intl"
import type enMessages from "@/messages/en.json"
import type { GroupChatPageLabels } from "./types"

/** The next-intl translator bound to `console.groupChat`; its keys are checked against the catalog. */
export type GroupChatTranslator = ReturnType<typeof createTranslator<typeof enMessages, "console.groupChat">>

/**
 * Resolve every Office label from the group-chat catalog namespace.
 *
 * @param t - The translator bound to `console.groupChat`.
 * @param formatTime - Formats one ISO timestamp for display in the viewer's locale.
 * @returns The settled labels a drawing block reads.
 */
export const buildGroupChatLabels = (
    t: GroupChatTranslator,
    formatTime: (iso: string) => string,
): GroupChatPageLabels => ({
    title: t("title"),
    description: t("description"),
    workspace: t("workspace"),
    today: t("today"),
    tabListLabel: t("tabs.label"),
    tabs: { office: t("tabs.office"), tasks: t("tabs.tasks") },
    roles: {
        owner: t("roles.owner"),
        manager: t("roles.manager"),
        staff: t("roles.staff"),
    },
    statuses: {
        created: t("statuses.created"),
        working: t("statuses.working"),
        "waiting-on-answer": t("statuses.waitingOnAnswer"),
        "waiting-on-approval": t("statuses.waitingOnApproval"),
        done: t("statuses.done"),
        rejected: t("statuses.rejected"),
        cancelled: t("statuses.cancelled"),
    },
    state: {
        loading: t("state.loading"),
        retry: t("state.retry"),
        readFailedTitle: t("state.readFailed"),
        deniedTitle: t("state.deniedTitle"),
        deniedBody: t("state.deniedBody"),
        backOverview: t("state.backOverview"),
    },
    members: {
        title: t("members.title"),
        humans: (count) => t("members.humans", { count }),
        modules: (count) => t("members.modules", { count }),
        countLabel: (count) => t("members.countLabel", { count }),
        moduleDescriptions: {
            Sales: t("members.moduleDescriptions.Sales"),
            Accounting: t("members.moduleDescriptions.Accounting"),
            Chatbot: t("members.moduleDescriptions.Chatbot"),
        },
        empty: t("members.empty"),
        pending: t("members.pending"),
        noModules: t("members.noModules"),
        moduleRole: t("members.moduleRole"),
        openRail: (count) => t("members.openRail", { count }),
        closeRail: t("members.closeRail"),
    },
    invite: {
        title: t("invite.title"),
        email: t("invite.email"),
        emailPlaceholder: t("invite.emailPlaceholder"),
        role: t("invite.role"),
        hint: t("invite.hint"),
        submit: t("invite.submit"),
        sent: (email) => t("invite.sent", { email }),
        existing: t("invite.existing"),
        refused: t("invite.refused"),
    },
    conversation: {
        label: t("conversation.label"),
        empty: t("conversation.empty"),
        unknownAuthor: t("conversation.unknownAuthor"),
    },
    composer: {
        label: t("composer.label"),
        placeholder: t("composer.placeholder"),
        send: t("composer.send"),
        failed: t("composer.failed"),
        retry: t("composer.retry"),
        denied: t("composer.denied"),
        answering: (moduleName, excerpt) => t("composer.answering", { moduleName, excerpt }),
        cancelAnswer: t("composer.cancelAnswer"),
    },
    card: {
        receiptReported: t("card.receiptReported"),
        receiptPending: t("card.receiptPending"),
        receiptRefused: t("card.receiptRefused"),
        reference: (ref, moduleName) => t("card.reference", { ref, moduleName }),
        requestedBy: (name) => t("card.requestedBy", { name }),
        assignedTo: (name) => t("card.assignedTo", { name }),
    },
    approval: {
        needed: t("approval.needed"),
        waiting: t("approval.waiting"),
        deciderHint: t("approval.deciderHint"),
        approve: t("approval.approve"),
        reject: t("approval.reject"),
        decidedBy: (name, at) => t("approval.decidedBy", { name, at }),
        withdrawn: t("approval.withdrawn"),
        uncertain: t("approval.uncertain"),
        denied: t("approval.denied"),
    },
    question: {
        waiting: (name) => t("question.waiting", { name }),
        answer: t("question.answer"),
    },
    notice: {
        title: t("notice.title"),
        taskAssign: () => t("notice.taskAssign"),
        approval: t("notice.approval"),
        open: t("notice.open"),
        handled: t("notice.handled"),
        unavailable: t("notice.unavailable"),
    },
    tasks: {
        title: t("tasks.title"),
        count: (count) => t("tasks.count", { count }),
        filterPerson: t("tasks.filterPerson"),
        filterModule: t("tasks.filterModule"),
        filterStatus: t("tasks.filterStatus"),
        filterAll: t("tasks.filterAll"),
        filterHint: t("tasks.filterHint"),
        empty: t("tasks.empty"),
        invalidFilter: t("tasks.invalidFilter"),
        failed: t("tasks.failed"),
        denied: t("tasks.denied"),
        openInOffice: t("tasks.openInOffice"),
        asker: (name) => t("tasks.asker", { name }),
        assignee: (name) => t("tasks.assignee", { name }),
        module: (name) => t("tasks.module", { name }),
    },
    accept: {
        title: t("accept.title"),
        body: t("accept.body"),
        roleLine: (role) => t("accept.roleLine", { role }),
        action: t("accept.action"),
        refused: t("accept.refused"),
        invalidLink: t("accept.invalidLink"),
    },
    formatTime,
})
