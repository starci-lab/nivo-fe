"use client"

import { useCallback, useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import {
    useMutateInstallAgentosSolutionModuleSwr,
    useProvisioningRealtime,
    useQueryMyAgentosModuleInstallationsSwr,
    useQueryMyAgentosSolutionModulesSwr,
    useAccessToken,
} from "@/hooks"
import type { AgentosSolutionModule } from "@/modules/api/agentos-modules"
import { nivoQueryReading } from "@/modules/query"
import {
    solutionCatalogCards,
    solutionInstallationCards,
    solutionSectionState,
    type AgentOSSolutionModuleCenterCopy,
    type AgentOSSolutionModuleCenterRouteProps,
} from "@/modules/agentos/solution-module-center"

/** Own solution reads, installation admission, and its selected Saga refresh. */
export const useAgentOSSolutionModuleCenter = (props: AgentOSSolutionModuleCenterRouteProps) => {
    const { workspaceId, layout = "tabs" } = props
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
    const [installRequestKeys, setInstallRequestKeys] = useState<ReadonlyMap<string, string>>(() => new Map())
    const refresh = useCallback(async () => {
        await Promise.all([refreshCatalog(), refreshInstallations()])
    }, [refreshCatalog, refreshInstallations])
    const realtime = useProvisioningRealtime({
        accessToken,
        target:
            accessToken === null || trackedInstallationId === undefined
                ? null
                : { kind: "module-installation", id: trackedInstallationId },
    })
    useEffect(() => {
        if (realtime.status !== "event" && realtime.status !== "connected") return
        if (realtime.status === "event" && realtime.event.kind !== "module-installation") return
        void refresh()
    }, [realtime, refresh])

    const copy: AgentOSSolutionModuleCenterCopy = {
        available: t("status.available"),
        installedCount: (count) => `${count} installed`,
        catalogDetail: (values) => t("catalogDetail", values),
        install: t("install"),
        installedDescription: t("installedDescription"),
        status: (state) => t(`status.${state}`),
        version: (version) => t("version", { version }),
        viewDetails: t("viewDetails"),
        installed: t("installed"),
        catalogSection: t("catalogSection"),
        installedSection: t("installedSection"),
        modesLabel: t("modesLabel"),
        catalogMode: t("modes.catalog"),
        installedMode: t("modes.installed"),
        empty: t("empty"),
        browse: t("browse"),
        emptyTitle: t("emptyTitle"),
        emptyHint: t("emptyHint"),
        catalogueEmptyTitle: t("catalogueEmptyTitle"),
        catalogueEmptyHint: t("catalogueEmptyHint"),
        installedEmptyAction: t("emptyAction"),
    }
    const catalogCards = solutionCatalogCards(catalog, installations, copy)
    const { cards: installedCards, rows: installedRows } = solutionInstallationCards(
        installations,
        catalog,
        locale,
        workspaceId,
        copy,
    )

    const install = useCallback(
        async (moduleKey: AgentosSolutionModule["key"]) => {
            setPendingKey(moduleKey)
            setOutcome(undefined)
            const idempotencyKey = installRequestKeys.get(moduleKey) ?? `nivo-fe:${crypto.randomUUID()}`
            if (!installRequestKeys.has(moduleKey))
                setInstallRequestKeys((current) => new Map(current).set(moduleKey, idempotencyKey))
            const clearKey = () =>
                setInstallRequestKeys((current) => {
                    if (!current.has(moduleKey)) return current
                    const next = new Map(current)
                    next.delete(moduleKey)
                    return next
                })
            try {
                const result = await installModule({ moduleKey, idempotencyKey })
                setPendingKey(undefined)
                if (!result.ok) {
                    if (result.kind !== "unavailable") clearKey()
                    setOutcome(t("installFailed"))
                    return
                }
                clearKey()
                setTrackedInstallationId(result.data.id)
                setOutcome(t("installAccepted"))
                setMode("installed")
            } catch {
                setPendingKey(undefined)
                setOutcome(t("installFailed"))
            }
        },
        [installModule, installRequestKeys, t],
    )
    const onPressCard = (id: string) => {
        if (layout === "ledger" || mode === "catalog") void install(id as AgentosSolutionModule["key"])
    }
    return {
        layout,
        mode,
        setMode,
        catalogReading,
        installationsReading,
        catalogCards,
        installedCards,
        installedRows,
        pendingKey,
        outcome,
        isCatalogValidating: catalogQuery.isValidating,
        isInstallationsValidating: installationsQuery.isValidating,
        refresh,
        refreshCatalog,
        refreshInstallations,
        onPressCard,
        catalogState: solutionSectionState(catalogReading),
        installationsState: solutionSectionState(installationsReading),
        copy,
        isResting: catalogReading.status === "resting" || installationsReading.status === "resting",
    }
}
