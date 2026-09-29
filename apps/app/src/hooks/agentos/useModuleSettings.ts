"use client"

import { useCallback, useState } from "react"
import { useMutateConfigureAgentWorkspaceChannelSwr } from "../swr/mutations/console"
import type { AgentosModuleRuntime } from "../../modules/api/agentos-module-runtime"
import type { AgentosRuntimeValue } from "../../modules/api/agentos-runtime-tree"
import type { AgentOSModuleView } from "../../components/blocks/agentos/ModuleRouteShellBlock"
import type { SettingsFormContentProps } from "../../modules/agentos/module-page/surface-types"
import { activeVersionFor } from "../../modules/agentos/module-page/sessions"
import { stringSetting } from "../../modules/agentos/module-page/runtime-values"
import { idempotencyKey, saveModuleCredential, type ModuleRuntimeControls } from "./agentos.shared"

type ModuleSettingsValues = {
    readonly displayName: string
    readonly modelProfile: string
    readonly requireConfirmation: boolean
    readonly operatingMode: "assist" | "autopilot"
    readonly channelAccountRef: string
    readonly credentialValues: Readonly<Record<string, string>>
}

/** The runtime, view and shared commands the settings form connects. */
export interface ModuleSettingsInput {
    readonly workspaceId: string
    readonly installationId: string
    readonly runtime: AgentosModuleRuntime | null
    readonly view: AgentOSModuleView
    readonly controls: ModuleRuntimeControls
}

const EMPTY_VALUES: ModuleSettingsValues = {
    displayName: "",
    modelProfile: "",
    requireConfirmation: true,
    operatingMode: "assist",
    channelAccountRef: "",
    credentialValues: {},
}

/**
 * Own the settings form: the editable fields, their reset basis and the save/credential commands.
 *
 * THE FORM RESET IS DERIVED, NOT AN EFFECT. A draft carries the basis it was edited against; when
 * the runtime, credentials or view move the basis, the stale draft stops answering and the
 * runtime's current values show again — the fields reset without any state written in an effect.
 */
export const useModuleSettings = (input: ModuleSettingsInput) => {
    const { workspaceId, installationId, runtime, view, controls } = input
    const { perform, setPending, setActionRefused } = controls
    const [formDraft, setFormDraft] = useState<{ readonly basis: string; readonly values: ModuleSettingsValues } | null>(
        null,
    )
    const channelMutation = useMutateConfigureAgentWorkspaceChannelSwr(workspaceId)

    const settings = runtime?.settings ?? {}
    const currentDisplayName =
        runtime === null
            ? ""
            : stringSetting(
                  settings.displayName,
                  stringSetting(runtime.installation.displayName, runtime.installation.moduleKey),
              ).trim()
    const currentModelProfile = stringSetting(settings.modelProfile, "nivo-default")
    const currentConfirmation =
        typeof settings.requireConfirmation === "boolean" ? settings.requireConfirmation : true
    const currentOperatingMode = runtime?.installation.operatingMode ?? "assist"
    const currentChannelAccountRef = runtime?.installation.channelAccountRef ?? null
    const credentialRevision = JSON.stringify(
        runtime?.credentials.map((credential) => [credential.providerKey, credential.status, credential.maskedHint]) ??
            [],
    )
    // The reset basis: the same facts the replaced effect synced the form against.
    const basis = JSON.stringify([
        workspaceId,
        installationId,
        view,
        runtime !== null,
        currentDisplayName,
        currentModelProfile,
        currentConfirmation,
        currentOperatingMode,
        currentChannelAccountRef,
        credentialRevision,
    ])
    const defaults: ModuleSettingsValues =
        runtime !== null && view === "settings"
            ? {
                  displayName: currentDisplayName,
                  modelProfile: currentModelProfile,
                  requireConfirmation: currentConfirmation,
                  operatingMode: currentOperatingMode,
                  channelAccountRef: currentChannelAccountRef ?? "",
                  credentialValues: {},
              }
            : EMPTY_VALUES
    const values = formDraft !== null && formDraft.basis === basis ? formDraft.values : defaults
    const changeField = <K extends keyof ModuleSettingsValues>(key: K, value: ModuleSettingsValues[K]) => {
        setFormDraft((current) => {
            const base = current !== null && current.basis === basis ? current.values : defaults
            return { basis, values: { ...base, [key]: value } }
        })
    }

    const activeVersion = runtime === null ? null : activeVersionFor(runtime)
    const hasTelegramCredential =
        runtime?.credentials.some(
            (credential) => credential.providerKey === "telegram-bot-token" && credential.status === "configured",
        ) ?? false
    const canEnableLive = activeVersion !== null && currentChannelAccountRef !== null && hasTelegramCredential
    const runtimeDisplayName = runtime?.installation.displayName

    const saveSettings = useCallback(
        (
            next: Readonly<Record<string, AgentosRuntimeValue>>,
            operatingMode: "assist" | "autopilot",
            channelAccountRef: string,
        ) => {
            void perform({
                action: "UPDATE_SETTINGS",
                installationId,
                idempotencyKey: idempotencyKey(),
                settings: next,
                operatingMode,
                channelAccountRef,
            })
        },
        [installationId, perform],
    )
    const setLiveEnabled = useCallback(
        (enabled: boolean) => {
            void perform({
                action: enabled ? "ENABLE_LIVE" : "DISABLE_LIVE",
                installationId,
                idempotencyKey: idempotencyKey(),
            })
        },
        [installationId, perform],
    )
    const saveCredential = useCallback(
        async (credentialKey: string, credentialValue: string) =>
            saveModuleCredential(
                {
                    workspaceId,
                    installationId,
                    displayName: runtimeDisplayName ?? "Support Desk Telegram",
                    configureChannel: channelMutation.trigger,
                    perform,
                    setPending,
                    setActionRefused,
                },
                credentialKey,
                credentialValue,
            ),
        [
            channelMutation.trigger,
            installationId,
            perform,
            runtimeDisplayName,
            setActionRefused,
            setPending,
            workspaceId,
        ],
    )
    const removeCredential = useCallback(
        (credentialKey: string) => {
            void perform({
                action: "REMOVE_MODULE_CREDENTIAL",
                installationId,
                idempotencyKey: idempotencyKey(),
                credentialKey,
            })
        },
        [installationId, perform],
    )

    const handlers: SettingsFormContentProps["on"] = {
        save: saveSettings,
        setLiveEnabled,
        saveCredential: (credentialKey, credentialValue) => void saveCredential(credentialKey, credentialValue),
        removeCredential,
        changeDisplayName: (value) => changeField("displayName", value),
        changeModelProfile: (value) => changeField("modelProfile", value),
        changeConfirmation: (value) => changeField("requireConfirmation", value),
        changeOperatingMode: (value) => changeField("operatingMode", value),
        changeChannelAccountRef: (value) => changeField("channelAccountRef", value),
        changeCredential: (credentialKey, value) =>
            changeField("credentialValues", { ...values.credentialValues, [credentialKey]: value }),
    }
    return {
        values,
        currentDisplayName,
        currentModelProfile,
        currentConfirmation,
        currentOperatingMode,
        currentChannelAccountRef,
        canEnableLive,
        handlers,
    }
}
