import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

type LaunchOwnerProbeProps = { readonly workspaceId: string }

vi.mock("@/components/blocks/agentos/AgentOSOpenClawLaunch", () => ({
    AgentOSOpenClawLaunch: ({ workspaceId }: LaunchOwnerProbeProps) => <div data-owner="openclaw-launch">{workspaceId}</div>,
}))

import { AgentOSOpenClawLaunchBridgeBase } from "./component"

describe("AgentOSOpenClawLaunchBridgeBase", () => {
    it("passes route identity, never launch state, into the connected OpenClaw block", () => {
        expect(renderToStaticMarkup(<AgentOSOpenClawLaunchBridgeBase props={{ workspaceId: "workspace-1" }} />)).toContain("workspace-1")
    })
})