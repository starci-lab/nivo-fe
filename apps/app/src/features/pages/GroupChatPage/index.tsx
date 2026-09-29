"use client"

import { useFormatter, useTranslations } from "next-intl"
import { useCallback, useMemo } from "react"
import {
    useCompactMemberView,
    useGroupChatComposer,
    useGroupChatOffice,
    useGroupChatTab,
    useGroupChatTasks,
} from "@/hooks"
import { nivoAnswerDenied } from "../../../modules/query"
import { overview } from "../../../modules/routes"
import { buildGroupChatLabels } from "../../../modules/collab/group-chat/labels"
import {
    buildConversationItems,
    GroupChatPageBase,
    type GroupChatPageLabels,
    type GroupChatPageView,
} from "./component"

/** This page resolves its workspace from the session, the route query, or an invitation link. */
export type GroupChatPageProps = Record<string, never>

/**
 * Connect the Office/Tasks surface to the session, the workspace-scoped Collab
 * reads and commands, and the live hint channel. Nothing here invents
 * authority: reads are the only content source, the server-derived viewer only
 * gates presentation, and every command answer re-reads the cached domains.
 * The connected logic lives in `hooks/collab`; this composition only settles the
 * derived office state, the conversation items and the view the base draws.
 */
export const GroupChatPage = (props: GroupChatPageProps) => {
    void props
    const t = useTranslations("console.groupChat")
    const format = useFormatter()

    const route = useGroupChatTab()
    const office = useGroupChatOffice({
        workspaceId: route.workspaceId,
        acceptanceMode: route.acceptanceMode,
        tab: route.tab,
        selectTab: route.selectTab,
    })
    const tasks = useGroupChatTasks({
        workspaceId: route.workspaceId,
        readScope: office.officeReady ? route.workspaceId : null,
        tab: route.tab,
        selectTab: route.selectTab,
    })
    const composer = useGroupChatComposer({
        workspaceId: route.workspaceId,
        answering: tasks.answering,
        clearAnswering: tasks.cancelAnswer,
    })

    /* ---------------- View assembly ---------------- */
    const officeDenied = nivoAnswerDenied(office.officeQuery.data)
    const readsDenied = nivoAnswerDenied(office.groupQuery.data) || nivoAnswerDenied(tasks.tasksQuery.data)
    const officeState: GroupChatPageView["officeState"] = route.acceptanceMode
        ? "ready"
        : !route.signedIn
          ? route.sessionStatus === "restoring"
              ? "loading"
              : "denied"
          : route.workspaceId === null
            ? route.workspacesAnswered
                ? "denied"
                : "loading"
            : officeDenied || readsDenied
              ? "denied"
              : office.officeQuery.data === undefined && office.officeQuery.error === undefined
                ? "loading"
                : office.officeQuery.data === undefined || office.officeQuery.error !== undefined
                  ? "failed"
                  : office.officeQuery.data.ok === false
                    ? "failed"
                    : "ready"

    const members = useCompactMemberView(officeState === "ready")

    const items = useMemo(
        () =>
            buildConversationItems({
                messages: office.groupQuery.data?.ok === true ? office.groupQuery.data.data.messages : [],
                cards: office.groupQuery.data?.ok === true ? office.groupQuery.data.data.cards : [],
                tasks: tasks.tasksQuery.data?.ok === true ? tasks.tasksQuery.data.data.tasks : [],
                participants: office.officeView?.participants ?? [],
                viewerMemberId: office.officeView?.viewer.memberId ?? null,
                unknownAuthor: t("conversation.unknownAuthor"),
            }),
        [office.groupQuery.data, tasks.tasksQuery.data, office.officeView, t],
    )

    const formatTime = useCallback(
        (iso: string): string => {
            const at = new Date(iso)
            if (Number.isNaN(at.getTime())) {
                return iso
            }
            return format.dateTime(at, { hour: "2-digit", minute: "2-digit" })
        },
        [format],
    )

    const labels: GroupChatPageLabels = useMemo(() => buildGroupChatLabels(t, formatTime), [t, formatTime])

    const view: GroupChatPageView = {
        screen: route.acceptanceMode ? "acceptance" : "office",
        officeState,
        tab: route.tab,
        workspaceName: route.workspaceListed ?? office.officeView?.group.name ?? null,
        viewer: office.officeView?.viewer ?? null,
        participants: office.officeView?.participants ?? [],
        items,
        composer: composer.composer,
        invite: office.invite,
        tasks: tasks.tasksView,
        notices: office.outstandingNotices,
        noticeOutcomes: office.noticeOutcomes,
        pressingApprovalId: tasks.pressingApprovalId,
        settledApprovals: tasks.settledApprovals,
        approvalNotices: tasks.approvalNotices,
        acceptance: route.acceptance,
    }

    return (
        <GroupChatPageBase
            state={{ isRailOpen: members.isRailOpen, isCompactMembers: members.isCompactMembers, labels }}
            props={{ view }}
            on={{
                changeRailOpen: members.changeRailOpen,
                selectTab: route.selectTab,
                changeComposer: composer.changeComposer,
                sendMessage: () => void composer.sendMessage(),
                retrySend: () => void composer.retrySend(),
                retryOffice: () => void office.officeQuery.mutate(),
                retryTasks: () => void tasks.tasksQuery.mutate(),
                changeInviteEmail: office.changeInviteEmail,
                changeInviteRole: office.changeInviteRole,
                submitInvite: () => void office.submitInvite(),
                acceptInvitation: () => void route.acceptInvite(),
                pressApproval: (approvalId, button) => void tasks.pressApproval(approvalId, button),
                answerQuestion: tasks.answerQuestion,
                cancelAnswer: tasks.cancelAnswer,
                changeTasksFilter: tasks.changeTasksFilter,
                openNotice: office.openNotice,
                openTaskCard: tasks.openTaskCard,
                leaveOffice: () => route.router.push(overview()),
            }}
        />
    )
}
