import type { ModulePageTranslatorFor } from "./types"

/** Catalog entries used by module settings and credential controls. */
export type SettingsModulePageMessageKey =
    | "runtime.credentialStatus.configured"
    | "runtime.credentialStatus.invalid"
    | "runtime.settings.activeVersion"
    | "runtime.settings.allowedPolicy"
    | "runtime.settings.assist"
    | "runtime.settings.automaticApply"
    | "runtime.settings.autopilot"
    | "runtime.settings.bindingRetained"
    | "runtime.settings.cacheInvalidation"
    | "runtime.settings.channelHint"
    | "runtime.settings.channelRef"
    | "runtime.settings.confirmation"
    | "runtime.settings.contextRequired"
    | "runtime.settings.credentialHint"
    | "runtime.settings.disableLive"
    | "runtime.settings.displayName"
    | "runtime.settings.enableLive"
    | "runtime.settings.enterCredential"
    | "runtime.settings.executeHistory"
    | "runtime.settings.externalSends"
    | "runtime.settings.hideCredential"
    | "runtime.settings.humanApproval"
    | "runtime.settings.inactive"
    | "runtime.settings.liveEnabled"
    | "runtime.settings.liveReady"
    | "runtime.settings.liveRequires"
    | "runtime.settings.mode"
    | "runtime.settings.modelProfile"
    | "runtime.settings.noCredential"
    | "runtime.settings.promptCache"
    | "runtime.settings.refundLegal"
    | "runtime.settings.refused"
    | "runtime.settings.removeCredential"
    | "runtime.settings.requireConfirmation"
    | "runtime.settings.safeguards"
    | "runtime.settings.save"
    | "runtime.settings.saveCredential"
    | "runtime.settings.showCredential"
    | "runtime.settings.stableKnowledge"
    | "runtime.settings.title"

type RuntimeSettingsActiveVersionValues = { readonly version: number }

type RuntimeSettingsAllowedPolicyValues = { readonly mode: string }

type RuntimeSettingsCredentialHintValues = { readonly provider: string }

type RuntimeSettingsHideCredentialValues = { readonly label: string }

type RuntimeSettingsRemoveCredentialValues = { readonly label: string }

type RuntimeSettingsSaveCredentialValues = { readonly label: string }

type RuntimeSettingsShowCredentialValues = { readonly label: string }

type RuntimeSettingsStableKnowledgeValues = { readonly version: number }

/** Build the module settings copy branches from the connected translator. */
export const buildSettingsCopy = (t: ModulePageTranslatorFor<SettingsModulePageMessageKey>) => ({
    credentialStatus: {
        configured: t("runtime.credentialStatus.configured"),
        invalid: t("runtime.credentialStatus.invalid"),
    },
    settings: {
        activeVersion: (values: RuntimeSettingsActiveVersionValues) => t("runtime.settings.activeVersion", values),
        allowedPolicy: (values: RuntimeSettingsAllowedPolicyValues) => t("runtime.settings.allowedPolicy", values),
        assist: t("runtime.settings.assist"),
        automaticApply: t("runtime.settings.automaticApply"),
        autopilot: t("runtime.settings.autopilot"),
        bindingRetained: t("runtime.settings.bindingRetained"),
        cacheInvalidation: t("runtime.settings.cacheInvalidation"),
        channelHint: t("runtime.settings.channelHint"),
        channelRef: t("runtime.settings.channelRef"),
        confirmation: t("runtime.settings.confirmation"),
        contextRequired: t("runtime.settings.contextRequired"),
        credentialHint: (values: RuntimeSettingsCredentialHintValues) => t("runtime.settings.credentialHint", values),
        disableLive: t("runtime.settings.disableLive"),
        displayName: t("runtime.settings.displayName"),
        enableLive: t("runtime.settings.enableLive"),
        enterCredential: t("runtime.settings.enterCredential"),
        executeHistory: t("runtime.settings.executeHistory"),
        externalSends: t("runtime.settings.externalSends"),
        hideCredential: (values: RuntimeSettingsHideCredentialValues) => t("runtime.settings.hideCredential", values),
        humanApproval: t("runtime.settings.humanApproval"),
        inactive: t("runtime.settings.inactive"),
        liveEnabled: t("runtime.settings.liveEnabled"),
        liveReady: t("runtime.settings.liveReady"),
        liveRequires: t("runtime.settings.liveRequires"),
        mode: t("runtime.settings.mode"),
        modelProfile: t("runtime.settings.modelProfile"),
        noCredential: t("runtime.settings.noCredential"),
        promptCache: t("runtime.settings.promptCache"),
        refundLegal: t("runtime.settings.refundLegal"),
        refused: t("runtime.settings.refused"),
        removeCredential: (values: RuntimeSettingsRemoveCredentialValues) =>
            t("runtime.settings.removeCredential", values),
        requireConfirmation: t("runtime.settings.requireConfirmation"),
        safeguards: t("runtime.settings.safeguards"),
        save: t("runtime.settings.save"),
        saveCredential: (values: RuntimeSettingsSaveCredentialValues) => t("runtime.settings.saveCredential", values),
        showCredential: (values: RuntimeSettingsShowCredentialValues) => t("runtime.settings.showCredential", values),
        stableKnowledge: (values: RuntimeSettingsStableKnowledgeValues) =>
            t("runtime.settings.stableKnowledge", values),
        title: t("runtime.settings.title"),
    },
})
