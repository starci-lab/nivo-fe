import { describe, expect, it } from "vitest"
import {
    supportConversationsQueryKey,
    supportMessagesQueryKey,
    supportTicketsQueryKey,
    type SupportQueryIdentity,
} from "./workspace-controlplane"

const identity: SupportQueryIdentity = {
    hostname: "agent-workspace.nivo.vn",
    workspaceId: "workspace-1",
    installationId: "installation-1",
    enabled: true,
}

describe("workspace control-plane cache identities", () => {
    it("binds collection projections to their controller host and module installation", () => {
        expect(supportConversationsQueryKey(identity)).toEqual([
            "support", "conversations", "agent-workspace.nivo.vn", "workspace-1", "installation-1",
        ])
        expect(supportTicketsQueryKey(identity)).toEqual([
            "support", "tickets", "agent-workspace.nivo.vn", "workspace-1", "installation-1",
        ])
    })

    it("cannot reuse a transcript cache entry across modules or controller hosts", () => {
        const otherModule = { ...identity, installationId: "installation-2" }
        const otherController = { ...identity, hostname: "agent-other.nivo.vn" }
        expect(supportMessagesQueryKey(identity, "conversation-1")).not.toEqual(
            supportMessagesQueryKey(otherModule, "conversation-1"),
        )
        expect(supportMessagesQueryKey(identity, "conversation-1")).not.toEqual(
            supportMessagesQueryKey(otherController, "conversation-1"),
        )
    })
})