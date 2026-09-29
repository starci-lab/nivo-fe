"use client"

import { AgentOSModuleCollectionPageBase } from "./component"
import {
    projectAgentOSShellView,
    type AgentOSShellView,
    type AgentOSWorkspaceControlCenterShellLabels,
} from "@/components/blocks/agentos/AgentOSWorkspaceControlCenter"
import {
    useAgentOSShell,
    useQueryMyAgentosModuleInstallationsSwr,
    useQueryMyAgentWorkspaceControlCenterSwr,
    useRouter,
} from "@/hooks"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useCallback } from "react"
type AgentOSModuleCollectionPageProps = {
    readonly workspaceId: string
}

/** Connect module-management copy, the connected shell and route navigation for one workspace. */
export const AgentOSModuleCollectionPage = (props: AgentOSModuleCollectionPageProps) => {
    const { workspaceId }: AgentOSModuleCollectionPageProps = props
    const t = useTranslations("console.agentos.modules.page")
    const s = useTranslations("console.agentos.shell")
    const format = useFormatter()
    const locale = useLocale()
    const router = useRouter()
    const searchParams = useSearchParams()
    // The connected shell reads one exact selection; the console aggregate names the instance and the
    // installation inventory names the siblings, so the page opens no path the shell does not own.
    const controlCenter = useQueryMyAgentWorkspaceControlCenterSwr(workspaceId)
    const installations = useQueryMyAgentosModuleInstallationsSwr(workspaceId)
    const instanceId =
        controlCenter.data?.ok === true
            ? (controlCenter.data.data.runtime?.instanceId ?? controlCenter.data.data.instance?.id ?? null)
            : null
    const installationIds =
        installations.data?.ok === true ? installations.data.data.map((installation) => installation.id) : []
    // A return from a receiver-owned module route carries one stable command identity: the receiver
    // source is read only when the route brought all three fields, and a partial identity is never
    // completed by guessing.
    const returnedInstallation = searchParams.get("installation")
    const returnedIntent = searchParams.get("intent")
    const returnedCommand = searchParams.get("command")
    const operations =
        returnedInstallation !== null && returnedIntent !== null && returnedCommand !== null
            ? [{ installationId: returnedInstallation, intentId: returnedIntent, commandId: returnedCommand }]
            : []
    const shell = useAgentOSShell({ workspaceId, instanceId: instanceId ?? "", installationIds, operations })
    /** Retry exactly the facets that did not answer with a current observation. */
    const retryShell = useCallback(() => {
        const limited = shell.sources.filter(
            (source): boolean => source.state !== "available" || source.freshness === "stale",
        )
        if (limited.length === 0) {
            shell.readSelection()
            return
        }
        for (const source of limited) shell.retrySource(source.identity)
    }, [shell])
    /** Re-read one receiver source: a status read of its own receipt, never a new effect. */
    const retryOperation = useCallback(
        (installationId: string, intentId: string) => {
            shell.retrySource({ kind: "receiver", installationId, intentId })
        },
        [shell],
    )
    const shellLabels: AgentOSWorkspaceControlCenterShellLabels = {
        headingFallback: s("headingFallback"),
        eyebrow: s("eyebrow"),
        description: s("description"),
        signInRequired: s("signInRequired"),
        signInAction: s("signInAction"),
        accessDenied: s("accessDenied"),
        accessUnverified: s("accessUnverified"),
        retry: s("retry"),
        loading: s("loading"),
        sourceTime: s("sourceTime"),
        identityInstance: s("identityInstance"),
        inventorySection: s("inventory.section"),
        inventoryEmpty: s("inventory.empty"),
        inventoryEmptyDescription: s("inventory.emptyDescription"),
        inventoryLimitPartial: s("inventory.limitPartial"),
        inventoryLimitStale: s("inventory.limitStale"),
        inventoryLimitUnavailable: s("inventory.limitUnavailable"),
        inventoryLimitUnsupported: s("inventory.limitUnsupported"),
        inventoryLimitRefused: s("inventory.limitRefused"),
        inventoryLimitLoading: s("inventory.limitLoading"),
        lastKnown: s("lastKnown"),
        retrying: s("retrying"),
        runtimeSection: s("runtime.section"),
        runtimeProvisioned: s("runtime.provisioned"),
        runtimeNotProvisioned: s("runtime.notProvisioned"),
        runtimeUnavailable: s("runtime.unavailable"),
        runtimeUnknown: s("runtime.unknown"),
        configurationSection: s("configuration.section"),
        configurationCurrent: (digests) => s("configuration.current", digests),
        configurationAbsent: s("configuration.absent"),
        configurationUnsupported: s("configuration.unsupported"),
        attentionSection: s("attention.section"),
        attentionUnsupported: s("attention.unsupported"),
        resultSection: s("result.section"),
        resultUnavailable: s("result.unavailable"),
        resultPending: s("result.pending"),
        resultConfirmed: s("result.confirmed"),
        resultUncertain: s("result.uncertain"),
        resultRecheck: s("result.recheck"),
        installEntry: s("installEntry"),
    }
    const shellView: AgentOSShellView = projectAgentOSShellView(shell, shellLabels)
    return (
        <AgentOSModuleCollectionPageBase
            props={{
                workspaceId,
                shell: shellView,
                shellLabels,
                labels: {
                    path: t("path"),
                    workspace: t("workspace"),
                    title: t("title"),
                    checkedAt: (time) => t("checkedAt", { time }),
                    installedIn: (name) => t("installedIn", { name }),
                    browseCatalog: t("browseCatalog"),
                    installFlow: t("installFlow"),
                    runtimeLine: (value) => t("runtimeLine", { value }),
                    runtimeProvisioned: t("runtimeProvisioned"),
                    runtimeNotProvisioned: t("runtimeNotProvisioned"),
                    runtimeUnavailable: t("runtimeUnavailable"),
                    runtimeUnknown: t("runtimeUnknown"),
                },
                createHref: `/${locale}/agentos/workspaces/${workspaceId}/modules/create`,
                isShellRetrying: shellView.state === "retrying",
            }}
            on={{
                onBack: () => router.push(`/agentos/workspaces/${workspaceId}`),
                onRetryShell: retryShell,
                onRetryOperation: retryOperation,
                formatDate: (value) =>
                    format.dateTime(new Date(value), {
                        dateStyle: "medium",
                        timeStyle: "short",
                    }),
            }}
        />
    )
}
