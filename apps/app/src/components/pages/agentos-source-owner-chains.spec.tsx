import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

type WalletOwnerProbeProps = { readonly pageState: string }
type WorkspaceOwnerProbeProps = { readonly workspaceId: string; readonly pageState: string }
type ModuleOwnerProbeProps = { readonly workspaceId: string; readonly installationId: string }
type LaunchOwnerProbeProps = { readonly workspaceId: string }

vi.mock("@/components/blocks/wallet/WalletControlCenter", () => ({
    WalletControlCenter: ({ pageState }: WalletOwnerProbeProps) => <div data-owner="wallet-control-center">{pageState}</div>,
}))
vi.mock("@/components/blocks/agentos/AgentOSWorkspaceControlCenter", () => ({
    AgentOSWorkspaceControlCenter: ({ workspaceId, pageState }: WorkspaceOwnerProbeProps) => <div data-owner="workspace-control-center">{workspaceId}:{pageState}</div>,
}))
vi.mock("@/components/blocks/agentos/AgentOSSolutionModuleDetail", () => ({
    AgentOSSolutionModuleDetail: ({ workspaceId, installationId }: ModuleOwnerProbeProps) => <div data-owner="module-detail">{workspaceId}:{installationId}</div>,
}))
vi.mock("@/components/blocks/agentos/AgentOSOpenClawLaunch", () => ({
    AgentOSOpenClawLaunch: ({ workspaceId }: LaunchOwnerProbeProps) => <div data-owner="openclaw-launch">{workspaceId}</div>,
}))

import { WalletPageBase } from "./WalletPage/component"
import { AgentOSWorkspacePageBase } from "./AgentOSWorkspacePage/component"
import { AgentOSSolutionModulePageBase } from "./AgentOSSolutionModulePage/component"
import { AgentOSOpenClawLaunchBridgeBase } from "./AgentOSOpenClawLaunchBridge/component"

describe("AgentOS SPLIT-6 page owner chains", () => {
    it("keeps only the Wallet page architecture axis above the connected Wallet block", () => {
        expect(renderToStaticMarkup(<WalletPageBase pageState="ordinary" />)).toContain("ordinary")
        expect(renderToStaticMarkup(<WalletPageBase pageState="waypoint" />)).toContain("waypoint")
    })

    it("keeps only workspace route identity and tab state above the connected aggregate block", () => {
        const html = renderToStaticMarkup(<AgentOSWorkspacePageBase workspaceId="workspace-1" pageState="applications" onSelectPageState={vi.fn()} />)
        expect(html).toContain("workspace-1:applications")
    })

    it("passes route identities, never detail state or data, into the connected module block", () => {
        expect(renderToStaticMarkup(<AgentOSSolutionModulePageBase workspaceId="workspace-1" installationId="installation-1" />)).toContain("workspace-1:installation-1")
    })

    it("passes route identity, never launch state, into the connected OpenClaw block", () => {
        expect(renderToStaticMarkup(<AgentOSOpenClawLaunchBridgeBase workspaceId="workspace-1" />)).toContain("workspace-1")
    })
})
