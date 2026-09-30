import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { AgentosModuleRuntime } from "../../modules/api/agentos-module-runtime"
import type { AgentOSModuleView } from "../../components/blocks/agentos/ModuleRouteShellBlock"
import { moduleRuntimeFixture, runtimeContextFixture } from "../../test-support/mock-result"
import type { ModuleRuntimeControls } from "./agentos.shared"

/*
 * The settings hook's load-bearing behaviours: the form's shown values follow the runtime while
 * the page's basis matches, an edit rides on a draft stamped with that basis, and a moved basis
 * discards the stale draft during render — no effect ever syncs the fields back.
 */

const mocks = vi.hoisted(() => ({
    channelTrigger: vi.fn(),
}))

vi.mock("@/hooks/swr/mutations/useMutateConfigureAgentWorkspaceChannelSwr", () => ({
    useMutateConfigureAgentWorkspaceChannelSwr: () => ({ trigger: mocks.channelTrigger }),
}))

import { useModuleSettings } from "./useModuleSettings"

const controlsFixture = (overrides: Partial<ModuleRuntimeControls> = {}): ModuleRuntimeControls => ({
    pending: false,
    setPending: vi.fn(),
    setActionRefused: vi.fn(),
    perform: vi.fn(async () => moduleRuntimeFixture()),
    settleRuntime: vi.fn(async () => moduleRuntimeFixture()),
    ...overrides,
})

const settingsRuntime = () =>
    moduleRuntimeFixture({
        installation: {
            displayName: "Desk Agent",
            operatingMode: "autopilot",
            channelAccountRef: "TELEGRAM:12345",
        },
        settings: { displayName: "Desk Agent", modelProfile: "nivo-pro" },
    })

type SettingsRenderProps = { readonly view: AgentOSModuleView }

const renderSettings = (runtime: AgentosModuleRuntime | null, view: AgentOSModuleView, controls: ModuleRuntimeControls) =>
    renderHook(
        ({ view: currentView }: SettingsRenderProps) =>
            useModuleSettings({ workspaceId: "ws-1", installationId: "inst-1", runtime, view: currentView, controls }),
        { initialProps: { view } },
    )

describe("useModuleSettings", () => {
    beforeEach(() => {
        mocks.channelTrigger.mockReset()
    })

    it("shows the runtime's values while the settings view is active", () => {
        const { result } = renderSettings(settingsRuntime(), "settings", controlsFixture())
        expect(result.current.values.displayName).toBe("Desk Agent")
        expect(result.current.values.modelProfile).toBe("nivo-pro")
        expect(result.current.values.operatingMode).toBe("autopilot")
        expect(result.current.values.channelAccountRef).toBe("TELEGRAM:12345")
    })

    it("discards a stale draft once the basis moves, without an effect", () => {
        const runtime = settingsRuntime()
        const { result, rerender } = renderSettings(runtime, "settings", controlsFixture())
        act(() => result.current.handlers.changeDisplayName("Edited name"))
        expect(result.current.values.displayName).toBe("Edited name")
        rerender({ view: "setup" })
        expect(result.current.values.displayName).toBe("")
        rerender({ view: "settings" })
        expect(result.current.values.displayName).toBe("Desk Agent")
    })

    it("refuses a malformed telegram token before any channel call", async () => {
        const controls = controlsFixture()
        const { result } = renderSettings(settingsRuntime(), "settings", controls)
        await act(async () => {
            await result.current.handlers.saveCredential("telegram-bot-token", "not-a-token")
        })
        expect(mocks.channelTrigger).not.toHaveBeenCalled()
        expect(controls.setActionRefused).toHaveBeenCalledWith(true)
    })

    it("stores a generic credential through the shared perform command", async () => {
        const controls = controlsFixture()
        const { result } = renderSettings(settingsRuntime(), "settings", controls)
        await act(async () => {
            await result.current.handlers.saveCredential("other-key", "value")
        })
        expect(controls.perform).toHaveBeenCalledWith(
            expect.objectContaining({ action: "SAVE_MODULE_CREDENTIAL", credentialKey: "other-key" }),
        )
    })

    it("only offers live enablement when a version, channel and credential exist", () => {
        const { result } = renderSettings(settingsRuntime(), "settings", controlsFixture())
        expect(result.current.canEnableLive).toBe(false)
        const live = moduleRuntimeFixture({
            installation: {
                activeContextVersionId: "ctx-1",
                channelAccountRef: "TELEGRAM:12345",
            },
            contextVersions: [runtimeContextFixture({ id: "ctx-1" })],
            credentials: [
                {
                    id: "cred-1",
                    installationId: "installation-fixture",
                    providerKey: "telegram-bot-token",
                    maskedHint: "…",
                    status: "configured" as const,
                },
            ],
        })
        const enabled = renderSettings(live, "settings", controlsFixture()).result.current
        expect(enabled.canEnableLive).toBe(true)
    })
})
