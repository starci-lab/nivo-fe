import type { ComponentProps } from "react"
import { NextIntlClientProvider, useTranslations } from "next-intl"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { TIME_ZONE } from "@/i18n/config"
import { buildModulePageCopy } from "@/components/pages/AgentOSSolutionModulePage/component"
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
import { AgentOSSolutionModulePageBase as ActualAgentOSSolutionModulePageBase } from "./AgentOSSolutionModulePage/component"
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

    it("projects one backend-owned module runtime through the pure routed shell", () => {
        const html = renderToStaticMarkup(
            <AgentOSSolutionModulePageBase
                shell={{
                    workspaceLabel: "Workspace workspac",
                    moduleName: "Sales Copilot",
                    moduleKind: "sales",
                    lifecycleLabel: "ready",
                    contextVersion: "not applied",
                    channelLabel: "Channel not connected",
                    controllerLabel: "Controller healthy",
                    activeView: "diagnostics",
                    onBackToModules: vi.fn(),
                    onNavigate: vi.fn(),
                }}
                screen={{
                    view: "diagnostics",
                    contentProps: {
                        installationId: "installation-1",
                        kindKey: "sales",
                        workbenchKey: "sales-pipeline",
                        diagnostics: { available: true },
                        events: [],
                        selectedSignal: "all",
                        compactPane: "readiness",
                        onSelectSignal: vi.fn(),
                        onSelectPane: vi.fn(),
                    },
                }}
            />,
        )
        expect(html).toContain("Modules")
        expect(html).toContain("Sales Copilot")
        expect(html).toContain("installation-1")
        expect(html).toContain("Signals")
        expect(html).toContain("Runtime health")
        expect(html).toContain("Event trace")
        expect(html).toContain("Controller healthy")
    })

    it("passes route identity, never launch state, into the connected OpenClaw block", () => {
        expect(renderToStaticMarkup(<AgentOSOpenClawLaunchBridgeBase workspaceId="workspace-1" />)).toContain("workspace-1")
    })

    it("renders only a masked credential status and a password input in Settings", () => {
        const html = renderToStaticMarkup(
            <AgentOSSolutionModulePageBase
                shell={{
                    workspaceLabel: "Workspace workspac",
                    moduleName: "Support Desk",
                    moduleKind: "customer-support",
                    lifecycleLabel: "ready",
                    contextVersion: "not applied",
                    channelLabel: "Channel not connected",
                    controllerLabel: "Controller healthy",
                    activeView: "settings",
                    onBackToModules: vi.fn(),
                    onNavigate: vi.fn(),
                }}
                screen={{
                    view: "settings",
                    contentProps: {
                        currentDisplayName: "Support Desk",
                        currentModelProfile: "nivo-default",
                        currentConfirmation: true,
                        currentOperatingMode: "assist",
                        currentChannelAccountRef: "",
                        liveEnabled: false,
                        canEnableLive: false,
                        pending: false,
                        refused: false,
                        credentialSlots: [{ key: "telegram-bot-token", label: "Telegram bot token", provider: "telegram" }],
                        credentialStatuses: [{ providerKey: "telegram-bot-token", maskedHint: "•••• 1234", status: "configured" }],
                        activeVersion: null,
                        onSave: vi.fn(),
                        onSetLiveEnabled: vi.fn(),
                        onSaveCredential: vi.fn(),
                        onRemoveCredential: vi.fn(),
                    },
                }}
            />,
        )
        expect(html).toContain("Telegram bot token")
        expect(html).toContain("•••• 1234")
        expect(html).toContain('type="password"')
    })
})
type AgentOSSolutionModulePageBaseFixtureProps = Omit<ComponentProps<typeof ActualAgentOSSolutionModulePageBase>, "copy"> & { readonly locale?: "en" | "vi" }
const AgentOSSolutionModulePageBaseCopyFixture = (props: AgentOSSolutionModulePageBaseFixtureProps) => {
    const t = useTranslations("console.agentos.modules")
    return <ActualAgentOSSolutionModulePageBase {...props} copy={buildModulePageCopy(t)} />
}
const AgentOSSolutionModulePageBase = ({ locale = "en", ...props }: AgentOSSolutionModulePageBaseFixtureProps) => <NextIntlClientProvider locale={locale} messages={locale === "en" ? enMessages : viMessages} timeZone={TIME_ZONE} onError={error => { throw error }}><AgentOSSolutionModulePageBaseCopyFixture {...props} /></NextIntlClientProvider>

