"use client"

import { useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import {
    useMutateCollabAcceptInvitationSwr,
    usePathname,
    useQueryMyAgentWorkspacesSwr,
    useRouter,
    useSession,
} from "@/hooks"
import type { AgentWorkspaceRow } from "../../modules/api/agentos-workspaces"
import { parseRoleHint, type GroupChatTab } from "../../modules/collab/group-chat/model"
import type { GroupChatPageView } from "../../modules/collab/group-chat/types"

/**
 * The route and session inputs the connected GroupChat page reads, plus the
 * invitation acceptance whose whole result is a rewritten URL.
 *
 * WORKSPACE RESOLUTION IS URL STATE. `?workspace=` names the office the viewer
 * opened; absent it, the first owned workspace answers. `?invitation=` enters
 * acceptance mode: the owned-workspace read is withheld because a non-member's
 * read would be denied anyway, and the accepted workspace lands back in the
 * query (`ui.collab.office` invite-accept-*).
 */
export const useGroupChatTab = () => {
    const session = useSession()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()

    /* ---------------- Route inputs ---------------- */
    const invitationId = searchParams.get("invitation")
    const workspaceParam = searchParams.get("workspace")
    const roleHint = parseRoleHint(searchParams.get("role"))
    const viewParam = searchParams.get("view")
    const tab: GroupChatTab = viewParam === "tasks" ? "tasks" : "office"
    const acceptanceMode = invitationId !== null

    /* ---------------- Workspace resolution ---------------- */
    const signedIn = session.state.status === "signed-in"
    const workspaces = useQueryMyAgentWorkspacesSwr(signedIn && invitationId === null)
    const ownedWorkspaceId = workspaces.data?.ok === true ? (workspaces.data.data[0]?.id ?? null) : null
    const workspaceId = workspaceParam ?? ownedWorkspaceId
    const workspaceListed =
        workspaces.data?.ok === true
            ? (workspaces.data.data.find((workspace: AgentWorkspaceRow) => workspace.id === workspaceId)?.name ?? null)
            : null

    const selectTab = useCallback(
        (next: GroupChatTab) => {
            const query = new URLSearchParams(searchParams.toString())
            if (next === "office") {
                query.delete("view")
            } else {
                query.set("view", next)
            }
            const text = query.toString()
            router.replace(text.length === 0 ? pathname : `${pathname}?${text}`)
        },
        [searchParams, router, pathname],
    )

    /* ---------------- Invitation acceptance ---------------- */
    const [acceptanceState, setAcceptanceState] = useState<"ready" | "pending" | "refused">("ready")
    const acceptInvitation = useMutateCollabAcceptInvitationSwr(workspaceId)
    const acceptInvite = async (): Promise<void> => {
        if (invitationId === null || workspaceId === null) {
            return
        }
        setAcceptanceState("pending")
        const answer = await acceptInvitation.trigger({ invitationId })
        if (answer.ok) {
            const query = new URLSearchParams(searchParams.toString())
            query.delete("invitation")
            query.delete("role")
            query.set("workspace", workspaceId)
            router.replace(`${pathname}?${query.toString()}`)
            setAcceptanceState("ready")
            return
        }
        setAcceptanceState("refused")
    }

    const acceptance: GroupChatPageView["acceptance"] = acceptanceMode
        ? {
              state: acceptanceState,
              roleHint,
              invalidLink: workspaceId === null,
          }
        : null

    return {
        tab,
        selectTab,
        signedIn,
        sessionStatus: session.state.status,
        workspaceId,
        workspaceListed,
        workspacesAnswered: workspaces.data !== undefined,
        acceptanceMode,
        acceptance,
        acceptInvite,
        router,
    }
}
