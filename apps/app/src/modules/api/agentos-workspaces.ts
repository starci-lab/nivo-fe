/**
 * The AgentOS workspaces a person owns: their control center, runtime, recovery and application launches.
 *
 * Every operation selects exactly one root field (`graphql` reads the first one), returns an `Outcome`
 * and never throws. The documents and response shapes come from the generated contract types.
 */

import type { Outcome } from "@nivo/api"
import { graphql } from "./graphql"
import {
    IssueAgentWorkspaceAppLaunchDocument,
    MyAgentWorkspaceControlCenterDocument,
    MyAgentWorkspaceDocument,
    RenewAgentWorkspaceAppLaunchDocument,
    RevokeAgentWorkspaceAppLaunchDocument,
} from "./__generated__/core"
import type {
    IssueAgentWorkspaceAppLaunchMutation,
    MyAgentWorkspaceControlCenterQuery,
    MyAgentWorkspaceQuery,
    RenewAgentWorkspaceAppLaunchMutation,
    RevokeAgentWorkspaceAppLaunchMutation,
} from "./__generated__/core"
import {
    parseAgentWorkspaceAppLaunch,
    parseAgentWorkspaceControlCenter,
    parseAgentWorkspaceRows,
    parseRenewedAgentWorkspaceAppLaunch,
    parseRevokedAgentWorkspaceAppLaunch,
} from "./agentos-workspaces.guards"

/**
 * The agent workspaces this account owns.
 *
 * SINGULAR NAME, LIST PAYLOAD. The field is `myAgentWorkspace` and it answers `[AgentWorkspaceEntity!]`.
 * A caller that typed it as one object would read `undefined` off an array on the first account that
 * owns one.
 *
 * @returns Every workspace, or why there is none.
 */
export const myAgentWorkspace = (): Promise<
    Outcome<ReadonlyArray<NonNullable<MyAgentWorkspaceQuery["myAgentWorkspace"]["data"]>[number]>>
> => graphql(MyAgentWorkspaceDocument, parseAgentWorkspaceRows)

/** Fetch one exact workspace control center; the backend enforces viewer ownership. */
export const myAgentWorkspaceControlCenter = (
    workspaceId: string,
): Promise<Outcome<NonNullable<MyAgentWorkspaceControlCenterQuery["myAgentWorkspaceControlCenter"]["data"]>>> =>
    graphql(MyAgentWorkspaceControlCenterDocument, parseAgentWorkspaceControlCenter, {
        request: { workspaceId },
    })

/** Issue one owner-scoped OpenClaw launch without exposing a gateway credential. */
export const issueAgentWorkspaceAppLaunch = (
    workspaceId: string,
): Promise<Outcome<NonNullable<IssueAgentWorkspaceAppLaunchMutation["issueAgentWorkspaceAppLaunch"]["data"]>>> =>
    graphql(IssueAgentWorkspaceAppLaunchDocument, parseAgentWorkspaceAppLaunch, {
        input: {
            workspaceId,
            app: "Openclaw",
        },
    })

/** Keep one redeemed workspace launch alive while the Nivo owner remains present. */
export const renewAgentWorkspaceAppLaunch = (
    launchId: string,
): Promise<Outcome<NonNullable<RenewAgentWorkspaceAppLaunchMutation["renewAgentWorkspaceAppLaunch"]["data"]>>> =>
    graphql(RenewAgentWorkspaceAppLaunchDocument, parseRenewedAgentWorkspaceAppLaunch, {
        input: {
            launchId,
        },
    })

/** Revoke a workspace launch when its owner closes the popup or leaves Nivo. */
export const revokeAgentWorkspaceAppLaunch = (
    launchId: string,
): Promise<Outcome<NonNullable<RevokeAgentWorkspaceAppLaunchMutation["revokeAgentWorkspaceAppLaunch"]["data"]>>> =>
    graphql(RevokeAgentWorkspaceAppLaunchDocument, parseRevokedAgentWorkspaceAppLaunch, {
        input: {
            launchId,
        },
    })
