
import type {
    AgentosModuleInstallationFieldsFragment,
    AgentosSolutionModuleSummary,
} from "@/modules/api/__generated__/core"

import { useCallback, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import {
    useMutateInstallAgentosSolutionModuleSwr,
} from "../swr/mutations/useMutateInstallAgentosSolutionModuleSwr"
import useProvisioningRealtime from "../realtime/useProvisioningRealtime"
import { useEventRevalidationSwr } from "../swr/useEventRevalidationSwr"
import {
    useQueryMyAgentosModuleInstallationsSwr,
} from "../swr/queries/useQueryMyAgentosModuleInstallationsSwr"
import { useQueryMyAgentosSolutionModulesSwr } from "../swr/queries/useQueryMyAgentosSolutionModulesSwr"
import { useAccessToken } from "../auth/useAccessToken"
import { nivoQueryReading } from "../../modules/query"
import {
    solutionSectionState,
    type AgentOSSolutionModuleCenterCopy,
    type AgentOSSolutionModuleCenterRouteProps,
} from "../../modules/agentos/solution-module-center"
import {
    solutionCatalogCardsFromQuery,
    solutionInstallationCardsFromQuery,
} from "../../modules/agentos/solution-module-center-query"

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
    const installations: ReadonlyArray<AgentosModuleInstallationFieldsFragment> | undefined =
        installationsReading.status === "ready" ? installationsReading.data : undefined
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
    const refreshSignal =
        realtime.status === "connected"
            ? ["agentos-solution-center", workspaceId, "connected"]
            : realtime.status === "event" && realtime.event.kind === "module-installation"
              ? ["agentos-solution-center", workspaceId, "module-installation", realtime.event.id, realtime.event.updatedAt]
              : null
    useEventRevalidationSwr(refreshSignal, refresh)

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
    const catalogCards = solutionCatalogCardsFromQuery(catalog, installations, copy)
    const { cards: installedCards, rows: installedRows } = solutionInstallationCardsFromQuery(
        installations,
        catalog,
        locale,
        workspaceId,
        copy,
    )

    const install = useCallback(
        async (moduleKey: AgentosSolutionModuleSummary["key"]) => {
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
                    return result
                } else {
                    clearKey()
                    setTrackedInstallationId(result.data.id)
                    setOutcome(t("installAccepted"))
                    setMode("installed")
                }
            } catch {
                setPendingKey(undefined)
                setOutcome(t("installFailed"))
            }
        },
        [installModule, installRequestKeys, t],
    )
    const onPressCard = (id: string) => {
        if (layout === "ledger" || mode === "catalog") void install(id)
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
