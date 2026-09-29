import type { ModulePageTranslatorFor } from "./types"

/** Catalog entries used by the persistent module shell and loading state. */
export type ShellModulePageMessageKey =
    | "shell.activeContext"
    | "shell.boundContext"
    | "shell.channelConnected"
    | "shell.channelDisconnected"
    | "shell.controllerAttention"
    | "shell.controllerHealthy"
    | "shell.conversation"
    | "shell.diagnostics"
    | "shell.genericAgent"
    | "shell.kind.accounting"
    | "shell.kind.customer-support"
    | "shell.kind.generic-agent"
    | "shell.kind.research"
    | "shell.kind.scheduling"
    | "shell.live"
    | "shell.loading"
    | "shell.modules"
    | "shell.noContextApplied"
    | "shell.noExecuteSession"
    | "shell.operate"
    | "shell.path"
    | "shell.primaryOperations"
    | "shell.reading"
    | "shell.refused"
    | "shell.sections"
    | "shell.settings"
    | "shell.setup"
    | "shell.telegramConnected"
    | "shell.test"
    | "shell.unavailable"
    | "shell.unknownKind"
    | "shell.unknownStatus"
    | "shell.workspace"
    | "studioPage.title"

type ShellActiveContextValues = { readonly version: string; readonly channel: string; readonly controller: string }

type ShellBoundContextValues = { readonly version: number }

type ShellConversationValues = { readonly number: number }

type ShellUnknownKindValues = { readonly kind: string }

type ShellUnknownStatusValues = { readonly status: string }

type ShellWorkspaceValues = { readonly id: string }

/** Build the shell copy branches from the connected translator. */
export const buildShellCopy = (t: ModulePageTranslatorFor<ShellModulePageMessageKey>) => ({
    shell: {
        activeContext: (values: ShellActiveContextValues) => t("shell.activeContext", values),
        boundContext: (values: ShellBoundContextValues) => t("shell.boundContext", values),
        channelConnected: t("shell.channelConnected"),
        channelDisconnected: t("shell.channelDisconnected"),
        controllerAttention: t("shell.controllerAttention"),
        controllerHealthy: t("shell.controllerHealthy"),
        conversation: (values: ShellConversationValues) => t("shell.conversation", values),
        diagnostics: t("shell.diagnostics"),
        genericAgent: t("shell.genericAgent"),
        kind: {
            accounting: t("shell.kind.accounting"),
            "customer-support": t("shell.kind.customer-support"),
            "generic-agent": t("shell.kind.generic-agent"),
            research: t("shell.kind.research"),
            scheduling: t("shell.kind.scheduling"),
        },
        live: t("shell.live"),
        loading: t("shell.loading"),
        modules: t("shell.modules"),
        noContextApplied: t("shell.noContextApplied"),
        noExecuteSession: t("shell.noExecuteSession"),
        operate: t("shell.operate"),
        path: t("shell.path"),
        primaryOperations: t("shell.primaryOperations"),
        reading: t("shell.reading"),
        refused: t("shell.refused"),
        sections: t("shell.sections"),
        settings: t("shell.settings"),
        setup: t("shell.setup"),
        telegramConnected: t("shell.telegramConnected"),
        test: t("shell.test"),
        unavailable: t("shell.unavailable"),
        unknownKind: (values: ShellUnknownKindValues) => t("shell.unknownKind", values),
        unknownStatus: (values: ShellUnknownStatusValues) => t("shell.unknownStatus", values),
        workspace: (values: ShellWorkspaceValues) => t("shell.workspace", values),
    },
    studioPage: {
        title: t("studioPage.title"),
    },
})
