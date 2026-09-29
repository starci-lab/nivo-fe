"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import {
    useMutateInstallAgentosSolutionModuleSwr,
    useProvisioningRealtime,
    useQueryMyAgentosModuleInstallationsSwr,
    useQueryMyAgentosSolutionModulesSwr,
} from "@/hooks"
import type { AgentosSolutionModule } from "@/modules/api/agentos-modules"
import { nivoQueryReading, type NivoQueryReading } from "@/modules/query"
import { QueryNotice } from "@/components/blocks/query/QueryNotice"
import { useAccessToken } from "@/hooks"
import {
    AgentOSSolutionModuleCenterBase,
    type AgentOSSolutionLedgerRow,
    type AgentOSSolutionLedgerSectionStatus,
    type AgentOSSolutionModuleCard,
} from "./component"

/** Exact owner workspace scope consumed by the connected module center. */
export type AgentOSSolutionModuleCenterProps = {
    readonly workspaceId: string
    /** `ledger` lists installed solutions above the catalogue (the module route); the default keeps the mode switch. */
    readonly layout?: "tabs" | "ledger"
}
const toneOf = (status: string): "neutral" | "success" | "warning" | "danger" => {
    if (status === "ready") return "success"
    if (status === "failed") return "danger"
    if (status === "provisioning" || status === "degraded") return "warning"
    return "neutral"
}
const sectionState = (reading: NivoQueryReading<ReadonlyArray<unknown>>): AgentOSSolutionLedgerSectionStatus => {
    if (reading.status === "resting") return "resting"
    if (reading.status === "failed") return "failed"
    return reading.data.length === 0 ? "empty" : "ready"
}

/** Own catalog/list/install calls and follow one exact installation Saga at a time. */
export const AgentOSSolutionModuleCenter = (props: AgentOSSolutionModuleCenterProps) => {
    const { workspaceId, layout = "tabs" }: AgentOSSolutionModuleCenterProps = props
    const t = useTranslations("console.agentos.workspace.solutions")
    const locale = useLocale()
    const accessToken = useAccessToken()
    const [mode, setMode] = useState<"catalog" | "installed">("catalog")
    const catalogQuery = useQueryMyAgentosSolutionModulesSwr()
    const installationsQuery = useQueryMyAgentosModuleInstallationsSwr(workspaceId)
    const { trigger: installModule } = useMutateInstallAgentosSolutionModuleSwr(workspaceId)
    const refreshCatalog = catalogQuery.mutate
    const refreshInstallations = installationsQuery.mutate
    const catalogReading = nivoQueryReading(catalogQuery.data)
    const installationsReading = nivoQueryReading(installationsQuery.data)
    const catalog = catalogReading.status === "ready" ? catalogReading.data : undefined
    const installations = installationsReading.status === "ready" ? installationsReading.data : undefined
    const [pendingKey, setPendingKey] = useState<string>()
    const [trackedInstallationId, setTrackedInstallationId] = useState<string>()
    const [outcome, setOutcome] = useState<string>()
    const [retryingInstalled, setRetryingInstalled] = useState(false)
    const [retryingCatalogue, setRetryingCatalogue] = useState(false)
    const installRequestKeys = useRef(new Map<AgentosSolutionModule["key"], string>())
    const refresh = useCallback(async () => {
        await Promise.all([refreshCatalog(), refreshInstallations()])
    }, [refreshCatalog, refreshInstallations])
    const onRetryInstalled = useCallback(() => {
        setRetryingInstalled(true)
        void Promise.resolve(refreshInstallations()).finally(() => setRetryingInstalled(false))
    }, [refreshInstallations])
    const onRetryCatalogue = useCallback(() => {
        setRetryingCatalogue(true)
        void Promise.resolve(refreshCatalog()).finally(() => setRetryingCatalogue(false))
    }, [refreshCatalog])
    const realtime = useProvisioningRealtime({
        accessToken,
        target:
            accessToken === null || trackedInstallationId === undefined
                ? null
                : {
                      kind: "module-installation",
                      id: trackedInstallationId,
                  },
    })
    useEffect(() => {
        if (realtime.status !== "event" && realtime.status !== "connected") return
        if (realtime.status === "event" && realtime.event.kind !== "module-installation") return
        void refresh()
    }, [realtime, refresh])
    const catalogByKey = useMemo(() => new Map(catalog?.map((item) => [item.key, item])), [catalog])
    const install = useCallback(
        async (moduleKey: AgentosSolutionModule["key"]) => {
            setPendingKey(moduleKey)
            setOutcome(undefined)
            const idempotencyKey = installRequestKeys.current.get(moduleKey) ?? `nivo-fe:${crypto.randomUUID()}`
            installRequestKeys.current.set(moduleKey, idempotencyKey)
            try {
                const result = await installModule({
                    moduleKey,
                    idempotencyKey,
                })
                setPendingKey(undefined)
                if (!result.ok) {
                    // An install that never got an answer keeps its idempotency key, so the retry is the same intent.
                    if (result.kind !== "unavailable") installRequestKeys.current.delete(moduleKey)
                    setOutcome(t("installFailed"))
                    return
                }
                installRequestKeys.current.delete(moduleKey)
                setTrackedInstallationId(result.data.id)
                setOutcome(t("installAccepted"))
                setMode("installed")
            } catch {
                setPendingKey(undefined)
                setOutcome(t("installFailed"))
            }
        },
        [installModule, t],
    )
    const catalogCards: ReadonlyArray<AgentOSSolutionModuleCard> = (catalog ?? []).map((module) => {
        const installed = installations?.filter((item) => item.moduleKey === module.key) ?? []
        return {
            id: module.key,
            title: module.name,
            description: module.summary,
            statusLabel: installed.length === 0 ? t("status.available") : `${installed.length} installed`,
            statusTone: installed.length === 0 ? "neutral" : "success",
            detail: t("catalogDetail", {
                agents: module.agentRoles.length,
                channels: module.channelRoles.length,
                safety: module.safetyMode,
            }),
            actionLabel: t("install"),
        }
    })
    const installedCards: ReadonlyArray<AgentOSSolutionModuleCard> = (installations ?? []).map((installation) => {
        const module = catalogByKey.get(installation.moduleKey as AgentosSolutionModule["key"])
        return {
            id: installation.id,
            title: installation.displayName || module?.name || installation.moduleKey,
            description: module?.summary ?? t("installedDescription"),
            statusLabel: t(`status.${installation.status}`),
            statusTone: toneOf(installation.status),
            detail:
                installation.failureCode ??
                t("version", {
                    version: installation.moduleVersion,
                }),
            actionLabel: t("viewDetails"),
            actionHref: `/${locale}/agentos/workspaces/${workspaceId}/modules/${installation.id}`,
        }
    })
    const installedRows: ReadonlyArray<AgentOSSolutionLedgerRow> = (installations ?? []).map((installation) => {
        const module = catalogByKey.get(installation.moduleKey as AgentosSolutionModule["key"])
        return {
            id: installation.id,
            name: installation.displayName || module?.name || installation.moduleKey,
            detail:
                installation.failureCode ??
                t("version", {
                    version: installation.moduleVersion,
                }),
            kind: t("installed"),
            status: t(`status.${installation.status}`),
            statusTone: toneOf(installation.status),
            action: t("viewDetails"),
            href: `/${locale}/agentos/workspaces/${workspaceId}/modules/${installation.id}`,
        }
    })
    const failedReading =
        catalogReading.status === "failed"
            ? catalogReading
            : installationsReading.status === "failed"
              ? installationsReading
              : null
    const settledState = failedReading === null ? "answered" : "failed"
    const ledger = layout === "ledger"
    return (
        <AgentOSSolutionModuleCenterBase
            state={
                catalogReading.status === "resting" || installationsReading.status === "resting"
                    ? "resting"
                    : settledState
            }
            props={{
                layout,
                mode,
                sectionLabel: mode === "catalog" ? t("catalogSection") : t("installedSection"),
                modesLabel: t("modesLabel"),
                modes: [
                    {
                        id: "catalog",
                        label: t("modes.catalog"),
                    },
                    {
                        id: "installed",
                        label: t("modes.installed"),
                    },
                ],
                notice:
                    failedReading === null ? undefined : (
                        <QueryNotice props={{ failure: failedReading }} on={{ retry: () => void refresh() }} />
                    ),
                emptyLabel: t("empty"),
                emptyActionLabel: t("browse"),
                cards: ledger || mode === "catalog" ? catalogCards : installedCards,
                pendingId: pendingKey,
                outcome,
                ledger: {
                    installedLabel: t("installedSection"),
                    catalogLabel: t("catalogSection"),
                    installedState: sectionState(installationsReading),
                    catalogueState: sectionState(catalogReading),
                    installedNotice:
                        installationsReading.status === "failed" ? (
                            <QueryNotice
                                props={{ failure: installationsReading, retryPending: retryingInstalled }}
                                on={{ retry: onRetryInstalled }}
                            />
                        ) : undefined,
                    catalogueNotice:
                        catalogReading.status === "failed" ? (
                            <QueryNotice
                                props={{ failure: catalogReading, retryPending: retryingCatalogue }}
                                on={{ retry: onRetryCatalogue }}
                            />
                        ) : undefined,
                    installedRows,
                    installedEmptyTitle: t("emptyTitle"),
                    installedEmpty: t("emptyHint"),
                    catalogueEmptyTitle: t("catalogueEmptyTitle"),
                    catalogueEmpty: t("catalogueEmptyHint"),
                    installedEmptyAction: t("emptyAction"),
                },
            }}
            on={{
                onSelectMode: setMode,
                onPressCard: (id) => {
                    if (ledger || mode === "catalog") void install(id as AgentosSolutionModule["key"])
                },
            }}
        />
    )
}
