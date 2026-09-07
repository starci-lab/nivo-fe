import { describe, expect, it } from "vitest"
import {
    chatbotWorkbenchQueryKey,
    type SupportQueryIdentity,
} from "./workspace-controlplane"

const identity: SupportQueryIdentity = {
    hostname: "agent-workspace.nivo.vn",
    workspaceId: "workspace-1",
    installationId: "installation-1",
    enabled: true,
}

describe("workspace control-plane cache identities", () => {
    it("keeps each Chatbot workbench on its installation-qualified cache key", () => {
        expect(chatbotWorkbenchQueryKey(identity)).toEqual([
            "chatbot", "workbench", "agent-workspace.nivo.vn", "workspace-1", "installation-1",
        ])
        expect(chatbotWorkbenchQueryKey(identity)).not.toEqual(chatbotWorkbenchQueryKey({ ...identity, installationId: "installation-2" }))
    })
})
