
import { useEffect, useState } from "react"
import type { CollabHumanRole, CollabTurnNoticeItem } from "../../modules/api/collab"
import {
    useCollabLive,
    useMutateCollabInviteByEmailSwr,
    useQueryCollabGroupSwr,
    useQueryCollabNoticeSwr,
    useQueryCollabNoticesSwr,
    useQueryCollabOfficeSwr,
} from "@/hooks"
import { collabFallbackInterval } from "../../modules/collab"
import { readCollabInviteOutcome, readCollabOpenNotice } from "../../modules/collab/group-chat/model.guards"
import type { GroupChatTab } from "../../modules/collab/group-chat/model"
import type { GroupChatPageView } from "../../modules/collab/group-chat/types"
import { noticeTargetElementId } from "./collab.shared"
import { useScrollToElement } from "./useScrollToElement"

/** The route state the office reads and the notice follow are scoped and steered by. */
export type GroupChatOfficeScope = {
    readonly workspaceId: string | null
    /** Invitation mode mounts no Office read at all - a non-member's read would be denied anyway. */
    readonly acceptanceMode: boolean
    readonly tab: GroupChatTab
    readonly selectTab: (tab: GroupChatTab) => void
}

type NoticeOutcome = "handled" | "ended" | "unavailable"

/**
 * The scroll a followed open notice asks for: which card element, which tab the
 * viewer was on, and the tab selection captured at the moment the notice was
 * read so the scroll effect owes the linter only the record it consumes.
 */
type NoticeScroll = {
    readonly elementId: string
    readonly fromTab: GroupChatTab
    readonly selectTab: (tab: GroupChatTab) => void
}

/** The notice identity already consumed, plus the scroll it asked for when it had a target. */
type HandledNotice = {
    readonly id: string
    readonly scroll: NoticeScroll | null
}

/**
 * Own the workspace's Office reads - the authorized office snapshot, the
 * conversation page, the open notices - the notice follow that navigates to a
 * card, and the member invite form. Reads are the only content source; the
 * socket owns freshness and the reads poll only while it is lost.
 */
export const useGroupChatOffice = (scope: GroupChatOfficeScope) => {
    const { workspaceId, acceptanceMode, tab, selectTab } = scope

    const office = useQueryCollabOfficeSwr(acceptanceMode ? null : workspaceId)
    const officeView = office.data?.ok === true ? office.data.data : null
    const officeReady = officeView !== null

    // The socket owns freshness; the reads poll only while it is lost.
    const live = useCollabLive(officeReady ? workspaceId : null)
    const group = useQueryCollabGroupSwr(
        officeReady ? workspaceId : null,
        undefined,
        collabFallbackInterval(live.status, "group"),
    )
    const notices = useQueryCollabNoticesSwr(
        officeReady ? workspaceId : null,
        undefined,
        collabFallbackInterval(live.status, "notices"),
    )

    /* ---------------- Invite ---------------- */
    const [inviteEmail, setInviteEmail] = useState("")
    const [inviteRole, setInviteRole] = useState<CollabHumanRole>("staff")
    const [inviteOutcome, setInviteOutcome] = useState<{
        kind: "created" | "existing" | "refused"
        email: string | null
    } | null>(null)
    const inviteByEmail = useMutateCollabInviteByEmailSwr(workspaceId)

    const submitInvite = async (): Promise<void> => {
        if (inviteEmail.trim().length === 0) {
            return
        }
        const answer = await inviteByEmail.trigger({ email: inviteEmail, role: inviteRole })
        const outcome = answer.ok ? readCollabInviteOutcome(answer.data) : null
        if (outcome !== null) {
            setInviteOutcome({ kind: outcome, email: inviteEmail })
            if (outcome === "created") {
                setInviteEmail("")
            }
            return
        }
        setInviteOutcome({ kind: "refused", email: null })
    }

    /* ---------------- Notice follow ---------------- */
    const [pendingNoticeId, setPendingNoticeId] = useState<string | null>(null)
    const [handledNotice, setHandledNotice] = useState<HandledNotice | null>(null)
    const [noticeOutcomes, setNoticeOutcomes] = useState<Readonly<Record<string, NoticeOutcome>>>({})
    const notice = useQueryCollabNoticeSwr(workspaceId, pendingNoticeId)

    /*
     * FOLLOWING A NOTICE IS DERIVED STATE, NOT AN EFFECT. When the notice read
     * answers, the render-phase adjustment records the outcome and clears the
     * pending identity in the same pass; the handled identity stands in for the
     * once-only guard so a refetch of the same notice never reprocesses it. The
     * only true side effect - switching to Office and scrolling the card - is
     * queued on the handled record and performed by the effect below.
     */
    if (pendingNoticeId !== null && notice.data !== undefined && handledNotice?.id !== pendingNoticeId) {
        const answer = notice.data
        let scroll: NoticeScroll | null = null
        let outcome: NoticeOutcome | null = null
        if (!answer.ok) {
            outcome = "unavailable"
        } else {
            const opened = readCollabOpenNotice(answer.data)
            if (opened !== null && opened.outcome === "open" && opened.target !== undefined) {
                const elementId = noticeTargetElementId(opened.target)
                if (elementId !== null) {
                    scroll = { elementId, fromTab: tab, selectTab }
                }
            } else {
                outcome =
                    opened !== null && (opened.outcome === "handled" || opened.outcome === "ended")
                        ? opened.outcome
                        : "unavailable"
            }
        }
        setHandledNotice({ id: pendingNoticeId, scroll })
        setPendingNoticeId(null)
        if (outcome !== null) {
            setNoticeOutcomes((current) => ({ ...current, [pendingNoticeId]: outcome }))
        }
    }

    const pendingScroll = handledNotice?.scroll ?? null
    useEffect(() => {
        if (pendingScroll !== null && pendingScroll.fromTab !== "office") {
            pendingScroll.selectTab("office")
        }
    }, [pendingScroll])
    useScrollToElement(pendingScroll)

    const outstandingNotices =
        notices.data?.ok === true
            ? notices.data.data.notices.filter((item: CollabTurnNoticeItem) => item.turn.state === "open")
            : []

    const invite: GroupChatPageView["invite"] = {
        email: inviteEmail,
        role: inviteRole,
        pending: inviteByEmail.isMutating,
        outcome: inviteOutcome?.kind ?? null,
        invitedEmail: inviteOutcome?.email ?? null,
    }

    return {
        officeQuery: office,
        officeView,
        officeReady,
        groupQuery: group,
        outstandingNotices,
        noticeOutcomes,
        openNotice: setPendingNoticeId,
        invite,
        changeInviteEmail: setInviteEmail,
        changeInviteRole: setInviteRole,
        submitInvite,
    }
}
