import type { ModulePageTranslatorFor } from "./types"

/** Catalog entries shared by the test and operation workbenches. */
export type OperateModulePageMessageKey =
    | "runtime.executeChat.acceptTask"
    | "runtime.executeChat.ai"
    | "runtime.executeChat.attachment"
    | "runtime.executeChat.messageLabel"
    | "runtime.executeChat.openWorkbench"
    | "runtime.executeChat.placeholder"
    | "runtime.executeChat.refused"
    | "runtime.executeChat.schema"
    | "runtime.executeChat.send"
    | "runtime.executeChat.system"
    | "runtime.executeChat.title"
    | "runtime.executeChat.typedInput"
    | "runtime.executeChat.widgetRefused"
    | "runtime.executeChat.you"
    | "runtime.operate.chat"
    | "runtime.operate.customerQueue"
    | "runtime.operate.customers"
    | "runtime.operate.internalChat"
    | "runtime.operate.internalWorkbench"
    | "runtime.operate.view"
    | "runtime.operate.workbench"
    | "runtime.priority.high"
    | "runtime.priority.low"
    | "runtime.priority.normal"
    | "runtime.priority.urgent"
    | "runtime.queue.customerQueue"
    | "runtime.queue.factValue"
    | "runtime.queue.factsCount"
    | "runtime.queue.information"
    | "runtime.queue.itemsCount"
    | "runtime.queue.loadingFacts"
    | "runtime.queue.loadingTasks"
    | "runtime.queue.noFacts"
    | "runtime.queue.noTasks"
    | "runtime.queue.notice"
    | "runtime.queue.tasks"
    | "runtime.queue.tasksCount"
    | "runtime.queue.ticketValue"
    | "runtime.queue.title"
    | "runtime.sessions.archived"
    | "runtime.sessions.collapse"
    | "runtime.sessions.expand"
    | "runtime.sessions.label"
    | "runtime.sessions.new"
    | "runtime.sessions.title"
    | "runtime.widgets.calendarCaption"
    | "runtime.widgets.calendarNotice"
    | "runtime.widgets.calendarTitle"
    | "runtime.widgets.financeCaption"
    | "runtime.widgets.financeNotice"
    | "runtime.widgets.financeTitle"
    | "runtime.widgets.knowledgeCaption"
    | "runtime.widgets.knowledgeNotice"
    | "runtime.widgets.knowledgeTitle"
    | "runtime.widgets.supportCaption"
    | "runtime.widgets.supportNotice"
    | "runtime.widgets.supportTitle"
    | "runtime.workbench.acceptedEvents"
    | "runtime.workbench.accounting"
    | "runtime.workbench.accountingNotice"
    | "runtime.workbench.blocked"
    | "runtime.workbench.calendar"
    | "runtime.workbench.calendarMutation"
    | "runtime.workbench.calendarNotice"
    | "runtime.workbench.channel"
    | "runtime.workbench.citations"
    | "runtime.workbench.clear"
    | "runtime.workbench.confirmation"
    | "runtime.workbench.due"
    | "runtime.workbench.evidencePack"
    | "runtime.workbench.evidenceTasks"
    | "runtime.workbench.execution"
    | "runtime.workbench.generic"
    | "runtime.workbench.genericCaption"
    | "runtime.workbench.genericNotice"
    | "runtime.workbench.groundedAnswer"
    | "runtime.workbench.highUrgent"
    | "runtime.workbench.inbox"
    | "runtime.workbench.kind"
    | "runtime.workbench.knowledgeCaption"
    | "runtime.workbench.module"
    | "runtime.workbench.needsReview"
    | "runtime.workbench.next"
    | "runtime.workbench.noAnswer"
    | "runtime.workbench.noApprovals"
    | "runtime.workbench.noMeeting"
    | "runtime.workbench.notScheduled"
    | "runtime.workbench.open"
    | "runtime.workbench.ownerReview"
    | "runtime.workbench.payableCaption"
    | "runtime.workbench.policy"
    | "runtime.workbench.proposals"
    | "runtime.workbench.qualified"
    | "runtime.workbench.reader"
    | "runtime.workbench.readerNotice"
    | "runtime.workbench.registered"
    | "runtime.workbench.reviewOnly"
    | "runtime.workbench.sales"
    | "runtime.workbench.scheduleCaption"
    | "runtime.workbench.slaCaption"
    | "runtime.workbench.support"
    | "runtime.workbench.supportNotice"
    | "runtime.workbench.title"
    | "runtime.workbench.unavailable"
    | "runtime.workbench.unavailableNotice"
    | "runtime.workbench.waitChannel"
    | "runtime.workbench.waiting"

type RuntimeExecuteChatAttachmentValues = { readonly label: string; readonly mediaType: string }

type RuntimeExecuteChatSchemaValues = { readonly version: string }

type RuntimeQueueFactValueValues = { readonly value: string; readonly confidence: string; readonly source: string }

type RuntimeQueueFactsCountValues = { readonly count: number }

type RuntimeQueueItemsCountValues = { readonly count: number }

type RuntimeQueueTasksCountValues = { readonly count: number }

type RuntimeQueueTicketValueValues = { readonly summary: string; readonly count: number; readonly state: string }

type RuntimeWorkbenchGenericCaptionValues = { readonly version: string }

type RuntimeWorkbenchKnowledgeCaptionValues = { readonly kind: string; readonly version: string }

type RuntimeWorkbenchPayableCaptionValues = { readonly kind: string; readonly version: string }

type RuntimeWorkbenchRegisteredValues = { readonly kind: string; readonly version: string }

type RuntimeWorkbenchScheduleCaptionValues = { readonly kind: string; readonly version: string }

type RuntimeWorkbenchSlaCaptionValues = { readonly kind: string; readonly version: string }

/** Build the operation workbench copy branches from the connected translator. */
export const buildOperateCopy = (t: ModulePageTranslatorFor<OperateModulePageMessageKey>) => ({
    executeChat: {
        acceptTask: t("runtime.executeChat.acceptTask"),
        ai: t("runtime.executeChat.ai"),
        attachment: (values: RuntimeExecuteChatAttachmentValues) => t("runtime.executeChat.attachment", values),
        messageLabel: t("runtime.executeChat.messageLabel"),
        openWorkbench: t("runtime.executeChat.openWorkbench"),
        placeholder: t("runtime.executeChat.placeholder"),
        refused: t("runtime.executeChat.refused"),
        schema: (values: RuntimeExecuteChatSchemaValues) => t("runtime.executeChat.schema", values),
        send: t("runtime.executeChat.send"),
        system: t("runtime.executeChat.system"),
        title: t("runtime.executeChat.title"),
        typedInput: t("runtime.executeChat.typedInput"),
        widgetRefused: t("runtime.executeChat.widgetRefused"),
        you: t("runtime.executeChat.you"),
    },
    operate: {
        chat: t("runtime.operate.chat"),
        customerQueue: t("runtime.operate.customerQueue"),
        customers: t("runtime.operate.customers"),
        internalChat: t("runtime.operate.internalChat"),
        internalWorkbench: t("runtime.operate.internalWorkbench"),
        view: t("runtime.operate.view"),
        workbench: t("runtime.operate.workbench"),
    },
    priority: {
        high: t("runtime.priority.high"),
        low: t("runtime.priority.low"),
        normal: t("runtime.priority.normal"),
        urgent: t("runtime.priority.urgent"),
    },
    queue: {
        customerQueue: t("runtime.queue.customerQueue"),
        factValue: (values: RuntimeQueueFactValueValues) => t("runtime.queue.factValue", values),
        factsCount: (values: RuntimeQueueFactsCountValues) => t("runtime.queue.factsCount", values),
        information: t("runtime.queue.information"),
        itemsCount: (values: RuntimeQueueItemsCountValues) => t("runtime.queue.itemsCount", values),
        loadingFacts: t("runtime.queue.loadingFacts"),
        loadingTasks: t("runtime.queue.loadingTasks"),
        noFacts: t("runtime.queue.noFacts"),
        noTasks: t("runtime.queue.noTasks"),
        notice: t("runtime.queue.notice"),
        tasks: t("runtime.queue.tasks"),
        tasksCount: (values: RuntimeQueueTasksCountValues) => t("runtime.queue.tasksCount", values),
        ticketValue: (values: RuntimeQueueTicketValueValues) => t("runtime.queue.ticketValue", values),
        title: t("runtime.queue.title"),
    },
    sessions: {
        archived: t("runtime.sessions.archived"),
        collapse: t("runtime.sessions.collapse"),
        expand: t("runtime.sessions.expand"),
        label: t("runtime.sessions.label"),
        new: t("runtime.sessions.new"),
        title: t("runtime.sessions.title"),
    },
    widgets: {
        calendarCaption: t("runtime.widgets.calendarCaption"),
        calendarNotice: t("runtime.widgets.calendarNotice"),
        calendarTitle: t("runtime.widgets.calendarTitle"),
        financeCaption: t("runtime.widgets.financeCaption"),
        financeNotice: t("runtime.widgets.financeNotice"),
        financeTitle: t("runtime.widgets.financeTitle"),
        knowledgeCaption: t("runtime.widgets.knowledgeCaption"),
        knowledgeNotice: t("runtime.widgets.knowledgeNotice"),
        knowledgeTitle: t("runtime.widgets.knowledgeTitle"),
        supportCaption: t("runtime.widgets.supportCaption"),
        supportNotice: t("runtime.widgets.supportNotice"),
        supportTitle: t("runtime.widgets.supportTitle"),
    },
    workbench: {
        acceptedEvents: t("runtime.workbench.acceptedEvents"),
        accounting: t("runtime.workbench.accounting"),
        accountingNotice: t("runtime.workbench.accountingNotice"),
        blocked: t("runtime.workbench.blocked"),
        calendar: t("runtime.workbench.calendar"),
        calendarMutation: t("runtime.workbench.calendarMutation"),
        calendarNotice: t("runtime.workbench.calendarNotice"),
        channel: t("runtime.workbench.channel"),
        citations: t("runtime.workbench.citations"),
        clear: t("runtime.workbench.clear"),
        confirmation: t("runtime.workbench.confirmation"),
        due: t("runtime.workbench.due"),
        evidencePack: t("runtime.workbench.evidencePack"),
        evidenceTasks: t("runtime.workbench.evidenceTasks"),
        execution: t("runtime.workbench.execution"),
        generic: t("runtime.workbench.generic"),
        genericCaption: (values: RuntimeWorkbenchGenericCaptionValues) => t("runtime.workbench.genericCaption", values),
        genericNotice: t("runtime.workbench.genericNotice"),
        groundedAnswer: t("runtime.workbench.groundedAnswer"),
        highUrgent: t("runtime.workbench.highUrgent"),
        inbox: t("runtime.workbench.inbox"),
        kind: t("runtime.workbench.kind"),
        knowledgeCaption: (values: RuntimeWorkbenchKnowledgeCaptionValues) =>
            t("runtime.workbench.knowledgeCaption", values),
        module: t("runtime.workbench.module"),
        needsReview: t("runtime.workbench.needsReview"),
        next: t("runtime.workbench.next"),
        noAnswer: t("runtime.workbench.noAnswer"),
        noApprovals: t("runtime.workbench.noApprovals"),
        noMeeting: t("runtime.workbench.noMeeting"),
        notScheduled: t("runtime.workbench.notScheduled"),
        open: t("runtime.workbench.open"),
        ownerReview: t("runtime.workbench.ownerReview"),
        payableCaption: (values: RuntimeWorkbenchPayableCaptionValues) => t("runtime.workbench.payableCaption", values),
        policy: t("runtime.workbench.policy"),
        proposals: t("runtime.workbench.proposals"),
        qualified: t("runtime.workbench.qualified"),
        reader: t("runtime.workbench.reader"),
        readerNotice: t("runtime.workbench.readerNotice"),
        registered: (values: RuntimeWorkbenchRegisteredValues) => t("runtime.workbench.registered", values),
        reviewOnly: t("runtime.workbench.reviewOnly"),
        sales: t("runtime.workbench.sales"),
        scheduleCaption: (values: RuntimeWorkbenchScheduleCaptionValues) =>
            t("runtime.workbench.scheduleCaption", values),
        slaCaption: (values: RuntimeWorkbenchSlaCaptionValues) => t("runtime.workbench.slaCaption", values),
        support: t("runtime.workbench.support"),
        supportNotice: t("runtime.workbench.supportNotice"),
        title: t("runtime.workbench.title"),
        unavailable: t("runtime.workbench.unavailable"),
        unavailableNotice: t("runtime.workbench.unavailableNotice"),
        waitChannel: t("runtime.workbench.waitChannel"),
        waiting: t("runtime.workbench.waiting"),
    },
})
