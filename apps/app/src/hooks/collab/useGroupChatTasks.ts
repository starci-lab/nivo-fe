
import { useState } from "react"
import type { CollabApprovalCardView, CollabApprovalDecision, CollabTaskView, CollabTaskQuestionView } from "../../modules/api/collab"
import { useMutateCollabPressApprovalSwr } from "../swr/mutations/useMutateCollabPressApprovalSwr"
import { useQueryCollabTasksSwr } from "../swr/queries/useQueryCollabTasksSwr"
import { type CollabTasksFilter } from "../swr/swr.shared"
import type { GroupChatTab } from "../../modules/collab/group-chat/model"
import type { GroupChatPageView } from "../../modules/collab/group-chat/types"
import { nivoAnswerDenied } from "../../modules/query"
import { readCollabPressCard } from "../../modules/collab/group-chat/model.guards"
import { useScrollToElement, type CollabScrollRequest } from "./useScrollToElement"

/** The question the composer is answering, carried until a send commits or the viewer cancels. */
export type GroupChatAnswering = GroupChatPageView["composer"]["answering"]

/** The read scope the tasks list and the press mutation work under. */
export type GroupChatTasksScope = {
    /** The workspace the commands run on; null while no workspace is resolved. */
    readonly workspaceId: string | null
    /** The workspace once Office answered; the tasks read holds until then. */
    readonly readScope: string | null
    readonly tab: GroupChatTab
    readonly selectTab: (tab: GroupChatTab) => void
}

/**
 * Own the Tasks surface of a workspace: the filtered task read, the question a
 * viewer is answering through the composer, the held approvals a press settles
 * or leaves visibly uncertain, and the jump that opens a task card in Office.
 */
export const useGroupChatTasks = (scope: GroupChatTasksScope) => {
    const { workspaceId, readScope, tab, selectTab } = scope

    const [tasksFilter, setTasksFilter] = useState<CollabTasksFilter>({})
    const [answering, setAnswering] = useState<GroupChatAnswering>(null)
    const [pressingApprovalId, setPressingApprovalId] = useState<string | null>(null)
    const [settledApprovals, setSettledApprovals] = useState<Readonly<Record<string, CollabApprovalCardView>>>({})
    const [approvalNotices, setApprovalNotices] = useState<Readonly<Record<string, "denied" | "uncertain">>>({})
    const [cardScroll, setCardScroll] = useState<CollabScrollRequest | null>(null)

    const tasks = useQueryCollabTasksSwr(readScope, tab === "tasks" ? tasksFilter : undefined)
    const pressApproval = useMutateCollabPressApprovalSwr(workspaceId)
    useScrollToElement(cardScroll)

    const tasksState: GroupChatPageView["tasks"]["state"] =
        tasks.data === undefined && tasks.error === undefined
            ? "loading"
            : tasks.data?.ok === false
              ? nivoAnswerDenied(tasks.data)
                  ? "denied"
                  : "failed"
              : tasks.error !== undefined
                ? "failed"
                : "ready"

    const onPressApproval = async (approvalId: string, button: CollabApprovalDecision): Promise<void> => {
        setPressingApprovalId(approvalId)
        setApprovalNotices((current) => {
            const next = { ...current }
            delete next[approvalId]
            return next
        })
        try {
            const answer = await pressApproval.trigger({ approvalId, button })
            if (answer.ok) {
                const card = readCollabPressCard(answer.data)
                if (card !== null) {
                    setSettledApprovals((current) => ({ ...current, [approvalId]: card }))
                }
                return
            }
            /*
             * A denied press (stale role, wrong member) keeps the card waiting and says
             * so; a lost or malformed answer stays visibly uncertain until the
             * revalidated read proves the card's state - never a speculative approval.
             */
            setApprovalNotices((current) => ({
                ...current,
                [approvalId]: nivoAnswerDenied(answer) ? "denied" : "uncertain",
            }))
        } finally {
            setPressingApprovalId(null)
        }
    }

    const openTaskCard = (taskId: string) => {
        if (tab !== "office") {
            selectTab("office")
        }
        setCardScroll({ elementId: `collab-task-${taskId}` })
    }

    const answerQuestion = (task: CollabTaskView, question: CollabTaskQuestionView) =>
        setAnswering({
            questionId: question.questionId,
            moduleName: task.owningModuleDisplayName ?? task.owningModuleKey,
            excerpt: question.body.slice(0, 80),
        })

    const tasksView: GroupChatPageView["tasks"] = {
        state: tasksState,
        rows: tasks.data?.ok === true ? tasks.data.data.tasks : [],
        filter: tasksFilter,
    }

    return {
        tasksQuery: tasks,
        tasksView,
        changeTasksFilter: setTasksFilter,
        answering,
        answerQuestion,
        cancelAnswer: () => setAnswering(null),
        pressingApprovalId,
        settledApprovals,
        approvalNotices,
        pressApproval: onPressApproval,
        openTaskCard,
    }
}
