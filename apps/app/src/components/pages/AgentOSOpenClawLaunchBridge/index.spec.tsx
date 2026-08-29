import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

type LaunchBridgeProbeProps = { readonly workspaceId: string }

vi.mock("./component", () => ({
    AgentOSOpenClawLaunchBridgeBase: ({ workspaceId }: LaunchBridgeProbeProps) => <div>{workspaceId}</div>,
}))

import { AgentOSOpenClawLaunchBridge } from "."

describe("AgentOSOpenClawLaunchBridge", () => {
    it("hands the exact route identity to its launch owner", () => {
        expect(renderToStaticMarkup(<AgentOSOpenClawLaunchBridge workspaceId="workspace-42" />)).toContain("workspace-42")
    })
})