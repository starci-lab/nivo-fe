import { type Outcome } from "@nivo/api"
import { rejectAuthorityClaims } from "./commands.validation"
import { collabRequest, readMembershipResult } from "./transport"
import type {
    CollabAcceptInvitationCall,
    CollabAcceptOutcome,
    CollabChangeMemberRoleOutcome,
    CollabChangeRoleCall,
    CollabInviteCall,
    CollabInviteOutcome,
    CollabMembershipResult,
    CollabWithdrawInvitationCall,
    CollabWithdrawOutcome,
} from "./types"

/** The decided outcome plus the post-decision member row, under this command's own closed vocabulary. */
const memberOutcome = <OutcomeName extends CollabMembershipResult["outcome"]>(
    membership: CollabMembershipResult | null,
    outcomes: ReadonlyArray<OutcomeName>,
): { readonly outcome: OutcomeName; readonly member?: CollabMembershipResult["member"] } | null => {
    if (membership === null || !isOneOfOutcome(membership.outcome, outcomes)) return null
    return {
        outcome: membership.outcome,
        ...(membership.member === undefined ? {} : { member: membership.member }),
    }
}

const isOneOfOutcome = <OutcomeName extends CollabMembershipResult["outcome"]>(
    value: CollabMembershipResult["outcome"],
    outcomes: ReadonlyArray<OutcomeName>,
): value is OutcomeName => outcomes.some((outcome) => outcome === value)

/** Invites one email address to the workspace with the requested member role. */
export const inviteCollabMemberByEmail = (args: CollabInviteCall): Promise<Outcome<CollabInviteOutcome>> => {
    const refused = rejectAuthorityClaims("inviteByEmail", args, ["email", "role"])
    if (refused !== null) {
        return Promise.resolve(refused)
    }
    return collabRequest(
        args.accessToken,
        args.workspaceId,
        "inviteByEmail",
        { email: args.email, role: args.role },
        (r) => memberOutcome<CollabInviteOutcome["outcome"]>(readMembershipResult(r), ["created", "existing"]),
    )
}

/**
 * `acceptInvitation`: the bearer's Login-verified email consumes one invitation. The
 * call carries only the invitation identity and an optional display name - never an
 * accepter email, phone, role, grant or principal, which the guard above refuses.
 */
export const acceptCollabInvitation = (args: CollabAcceptInvitationCall): Promise<Outcome<CollabAcceptOutcome>> => {
    const refused = rejectAuthorityClaims("acceptInvitation", args, [])
    if (refused !== null) {
        return Promise.resolve(refused)
    }
    return collabRequest(
        args.accessToken,
        args.workspaceId,
        "acceptInvitation",
        {
            invitationId: args.invitationId,
            ...(args.displayName === undefined ? {} : { displayName: args.displayName }),
        },
        (r) => memberOutcome<CollabAcceptOutcome["outcome"]>(readMembershipResult(r), ["accepted", "existing"]),
    )
}

/** `withdrawInvitation`: a current Owner closes one pending invitation. */
export const withdrawCollabInvitation = (
    args: CollabWithdrawInvitationCall,
): Promise<Outcome<CollabWithdrawOutcome>> => {
    const refused = rejectAuthorityClaims("withdrawInvitation", args, [])
    if (refused !== null) {
        return Promise.resolve(refused)
    }
    return collabRequest(
        args.accessToken,
        args.workspaceId,
        "withdrawInvitation",
        { invitationId: args.invitationId },
        (r) => memberOutcome<CollabWithdrawOutcome["outcome"]>(readMembershipResult(r), ["withdrawn", "existing"]),
    )
}

/** `changeMemberRole`: a current Owner replaces one member's role. */
export const changeCollabMemberRole = (args: CollabChangeRoleCall): Promise<Outcome<CollabChangeMemberRoleOutcome>> => {
    const refused = rejectAuthorityClaims("changeMemberRole", args, ["memberId", "role"])
    if (refused !== null) {
        return Promise.resolve(refused)
    }
    return collabRequest(
        args.accessToken,
        args.workspaceId,
        "changeMemberRole",
        { memberId: args.memberId, role: args.role },
        (r) =>
            memberOutcome<CollabChangeMemberRoleOutcome["outcome"]>(readMembershipResult(r), ["roleChanged", "existing"]),
    )
}
