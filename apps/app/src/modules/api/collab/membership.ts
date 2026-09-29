import type { Outcome } from "../outcome"
import { rejectAuthorityClaims } from "./commands.validation"
import { collabRequest, readMembershipResult } from "./transport"
import type {
    CollabAcceptInvitationCall,
    CollabAcceptOutcome,
    CollabChangeMemberRoleOutcome,
    CollabChangeRoleCall,
    CollabInviteCall,
    CollabInviteOutcome,
    CollabWithdrawInvitationCall,
    CollabWithdrawOutcome,
} from "./types"

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
        (r) => {
            const membership = readMembershipResult(r)
            return {
                outcome: membership.outcome as CollabInviteOutcome["outcome"],
                ...(membership.member === undefined ? {} : { member: membership.member }),
            }
        },
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
        (r) => {
            const membership = readMembershipResult(r)
            return {
                outcome: membership.outcome as CollabAcceptOutcome["outcome"],
                ...(membership.member === undefined ? {} : { member: membership.member }),
            }
        },
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
        (r) => {
            const membership = readMembershipResult(r)
            return {
                outcome: membership.outcome as CollabWithdrawOutcome["outcome"],
                ...(membership.member === undefined ? {} : { member: membership.member }),
            }
        },
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
        (r) => {
            const membership = readMembershipResult(r)
            return {
                outcome: membership.outcome as CollabChangeMemberRoleOutcome["outcome"],
                ...(membership.member === undefined ? {} : { member: membership.member }),
            }
        },
    )
}
