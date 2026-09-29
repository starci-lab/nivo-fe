import type {
    CollabApprovalDecision,
    CollabHumanRole,
    CollabOfficeParticipant,
    CollabOfficeViewer,
    CollabTaskQuestionView,
    CollabTaskStatus,
    CollabTaskView,
    CollabTurnNoticeItem,
} from "@/modules/api/collab"
import type { CollabTasksFilter } from "@/hooks"
import type { ConversationItem, GroupChatTab, SettledApprovalMap } from "./model"

/** Copy the connected layer resolves from the locale message files. */
export type GroupChatPageLabels = {
    readonly title: string
    readonly description: string
    readonly workspace: string
    readonly today: string
    readonly tabListLabel: string
    readonly tabs: { readonly office: string; readonly tasks: string }
    readonly roles: Readonly<Record<CollabHumanRole, string>>
    readonly statuses: Readonly<Record<CollabTaskStatus, string>>
    readonly state: {
        readonly loading: string
        readonly retry: string
        readonly readFailedTitle: string
        readonly deniedTitle: string
        readonly deniedBody: string
        readonly backOverview: string
    }
    readonly members: {
        readonly title: string
        readonly humans: (count: number) => string
        readonly modules: (count: number) => string
        readonly countLabel: (count: number) => string
        readonly moduleDescriptions: Readonly<Record<string, string>>
        readonly empty: string
        readonly pending: string
        readonly noModules: string
        readonly moduleRole: string
        readonly openRail: (count: number) => string
        readonly closeRail: string
    }
    readonly invite: {
        readonly title: string
        readonly email: string
        readonly emailPlaceholder: string
        readonly role: string
        readonly hint: string
        readonly submit: string
        readonly sent: (email: string) => string
        readonly existing: string
        readonly refused: string
    }
    readonly conversation: {
        readonly label: string
        readonly empty: string
        readonly unknownAuthor: string
    }
    readonly composer: {
        readonly label: string
        readonly placeholder: string
        readonly send: string
        readonly failed: string
        readonly retry: string
        readonly denied: string
        readonly answering: (moduleName: string, excerpt: string) => string
        readonly cancelAnswer: string
    }
    readonly card: {
        readonly receiptReported: string
        readonly receiptPending: string
        readonly receiptRefused: string
        readonly reference: (ref: string, moduleName: string) => string
        readonly requestedBy: (name: string) => string
        readonly assignedTo: (name: string) => string
    }
    readonly approval: {
        readonly needed: string
        readonly waiting: string
        readonly deciderHint: string
        readonly approve: string
        readonly reject: string
        readonly decidedBy: (name: string, at: string) => string
        readonly withdrawn: string
        readonly uncertain: string
        readonly denied: string
    }
    readonly question: {
        readonly waiting: (name: string) => string
        readonly answer: string
    }
    readonly notice: {
        readonly title: string
        readonly taskAssign: () => string
        readonly approval: string
        readonly open: string
        readonly handled: string
        readonly unavailable: string
    }
    readonly tasks: {
        readonly title: string
        readonly count: (count: number) => string
        readonly filterPerson: string
        readonly filterModule: string
        readonly filterStatus: string
        readonly filterAll: string
        readonly filterHint: string
        readonly empty: string
        readonly invalidFilter: string
        readonly failed: string
        readonly denied: string
        readonly openInOffice: string
        readonly asker: (name: string) => string
        readonly assignee: (name: string) => string
        readonly module: (name: string) => string
    }
    readonly accept: {
        readonly title: string
        readonly body: string
        readonly roleLine: (role: string) => string
        readonly action: string
        readonly refused: string
        readonly invalidLink: string
    }
    readonly formatTime: (iso: string) => string
}

/** Every effect the surface can ask the connected layer to perform. */
export type GroupChatPageActions = {
    readonly changeRailOpen: (isOpen: boolean) => void
    readonly selectTab: (tab: GroupChatTab) => void
    readonly changeComposer: (value: string) => void
    readonly sendMessage: () => void
    readonly retrySend: () => void
    readonly retryOffice: () => void
    readonly retryTasks: () => void
    readonly changeInviteEmail: (value: string) => void
    readonly changeInviteRole: (role: CollabHumanRole) => void
    readonly submitInvite: () => void
    readonly acceptInvitation: () => void
    readonly pressApproval: (approvalId: string, button: CollabApprovalDecision) => void
    readonly answerQuestion: (task: CollabTaskView, question: CollabTaskQuestionView) => void
    readonly cancelAnswer: () => void
    readonly changeTasksFilter: (next: CollabTasksFilter) => void
    readonly openNotice: (noticeId: string) => void
    readonly openTaskCard: (taskId: string) => void
    readonly leaveOffice: () => void
}

/** The settled view the connected layer hands down; all fields already authorized. */
export type GroupChatPageView = {
    readonly screen: "office" | "acceptance"
    readonly officeState: "loading" | "ready" | "failed" | "denied"
    readonly tab: GroupChatTab
    readonly workspaceName: string | null
    readonly viewer: CollabOfficeViewer | null
    readonly participants: ReadonlyArray<CollabOfficeParticipant>
    readonly items: ReadonlyArray<ConversationItem>
    readonly composer: {
        readonly value: string
        readonly pending: boolean
        readonly failure: "retry" | "denied" | null
        readonly answering: {
            readonly questionId: string
            readonly moduleName: string
            readonly excerpt: string
        } | null
    }
    readonly invite: {
        readonly email: string
        readonly role: CollabHumanRole
        readonly pending: boolean
        readonly outcome: "created" | "existing" | "refused" | null
        readonly invitedEmail: string | null
    }
    readonly tasks: {
        readonly state: "loading" | "ready" | "failed" | "denied"
        readonly rows: ReadonlyArray<CollabTaskView>
        readonly filter: CollabTasksFilter
    }
    readonly notices: ReadonlyArray<CollabTurnNoticeItem>
    readonly noticeOutcomes: Readonly<Record<string, "handled" | "ended" | "unavailable">>
    readonly pressingApprovalId: string | null
    readonly settledApprovals: SettledApprovalMap
    readonly approvalNotices: Readonly<Record<string, "denied" | "uncertain">>
    readonly acceptance: {
        readonly state: "ready" | "pending" | "refused"
        readonly roleHint: CollabHumanRole | null
        readonly invalidLink: boolean
    } | null
}

/**
 * The drawn chrome the connected layer settles: the member rail flag, the compact
 * member-sheet presentation and the resolved copy pack. `labels` rides the
 * shape member because its formatter members keep it out of the pure data atom
 * (`starci-fe/base-props-atom`); every sentence still arrives resolved from
 * the connected half, never translated inside the drawing.
 */
export type GroupChatPageBaseChrome = {
    readonly isRailOpen: boolean
    /** Settled by the connected layer: the viewport is in the compact member-sheet presentation. */
    readonly isCompactMembers?: boolean
    readonly labels: GroupChatPageLabels
}

/** The settled Office/Tasks view model: plain data the connected layer already authorized. */
export type GroupChatPageBaseData = {
    readonly view: GroupChatPageView
}

/** Public API role for the pure page: `{ state, props, on }` of atoms. */
export type GroupChatPageBaseProps = {
    readonly state: GroupChatPageBaseChrome
    readonly props: GroupChatPageBaseData
    readonly on: GroupChatPageActions
}
