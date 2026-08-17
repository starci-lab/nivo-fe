"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import {
    installAgentosSolutionModule,
    myAgentosModuleInstallations,
    myAgentosSolutionModules,
    type AgentosModuleInstallation,
    type AgentosSolutionModule,
} from "@/modules/api/console"
import { useSession } from "@/modules/auth/session"
import useProvisioningRealtime from "@/modules/realtime/provisioning"
import { _AgentOSSolutionModuleCenter, type AgentOSSolutionModuleCard } from "./component"

/** Exact owner workspace scope consumed by the connected module center. */
export type AgentOSSolutionModuleCenterProps = { readonly workspaceId: string }

const toneOf = (status: string): "neutral" | "success" | "warning" | "danger" => {
    if (status === "ready") return "success"
    if (status === "failed") return "danger"
    if (status === "provisioning" || status === "degraded") return "warning"
    return "neutral"
}

/** Own catalog/list/install calls and follow one exact installation Saga at a time. */
export const AgentOSSolutionModuleCenter = ({ workspaceId }: AgentOSSolutionModuleCenterProps) => {
    const t = useTranslations("console.agentos.workspace.solutions")
    const locale = useLocale()
    const session = useSession()
    const accessToken = session.state.status === "signed-in" ? session.state.accessToken : null
    const [mode, setMode] = useState<"catalog" | "installed">("catalog")
    const [catalog, setCatalog] = useState<ReadonlyArray<AgentosSolutionModule> | null | undefined>(undefined)
    const [installations, setInstallations] = useState<ReadonlyArray<AgentosModuleInstallation> | null | undefined>(undefined)
    const [pendingKey, setPendingKey] = useState<string>()
    const [trackedInstallationId, setTrackedInstallationId] = useState<string>()
    const [outcome, setOutcome] = useState<string>()

    const load = useCallback(async () => {
        const [catalogResult, installationsResult] = await Promise.all([
            myAgentosSolutionModules(),
            myAgentosModuleInstallations(workspaceId),
        ])
        setCatalog(catalogResult.ok ? catalogResult.data : null)
        setInstallations(installationsResult.ok ? installationsResult.data : null)
    }, [workspaceId])

    useEffect(() => {
        if (accessToken !== null) void load()
    }, [accessToken, load])

    const realtime = useProvisioningRealtime({
        accessToken,
        target: accessToken === null || trackedInstallationId === undefined ? null : { kind: "module-installation", id: trackedInstallationId },
    })
    useEffect(() => {
        if (realtime.status !== "event" && realtime.status !== "connected") return
        if (realtime.status === "event" && realtime.event.kind !== "module-installation") return
        void load()
    }, [load, realtime])

    const catalogByKey = useMemo(() => new Map(catalog?.map((item) => [item.key, item])), [catalog])
    const install = useCallback(async (moduleKey: AgentosSolutionModule["key"]) => {
        setPendingKey(moduleKey)
        setOutcome(undefined)
        const result = await installAgentosSolutionModule({
            agentWorkspaceId: workspaceId,
            moduleKey,
            idempotencyKey: `nivo-fe:${crypto.randomUUID()}`,
        })
        setPendingKey(undefined)
        if (!result.ok) {
            setOutcome(t("installFailed"))
            return
        }
        setTrackedInstallationId(result.data.id)
        setOutcome(t("installAccepted"))
        setMode("installed")
        await load()
    }, [load, t, workspaceId])

    const catalogCards: ReadonlyArray<AgentOSSolutionModuleCard> = (catalog ?? []).map((module) => {
        const installed = installations?.find((item) => item.moduleKey === module.key)
        return {
            id: module.key,
            title: module.name,
            description: module.summary,
            statusLabel: installed === undefined ? t("status.available") : t(`status.${installed.status}`),
            statusTone: installed === undefined ? "neutral" : toneOf(installed.status),
            detail: t("catalogDetail", { agents: module.agentRoles.length, channels: module.channelRoles.length, safety: module.safetyMode }),
            actionLabel: installed === undefined ? t("install") : t("installed"),
            disabled: installed !== undefined,
        }
    })
    const installedCards: ReadonlyArray<AgentOSSolutionModuleCard> = (installations ?? []).map((installation) => {
        const module = catalogByKey.get(installation.moduleKey as AgentosSolutionModule["key"])
        return {
            id: installation.id,
            title: module?.name ?? installation.moduleKey,
            description: module?.summary ?? t("installedDescription"),
            statusLabel: t(`status.${installation.status}`),
            statusTone: toneOf(installation.status),
            detail: installation.failureCode ?? t("version", { version: installation.moduleVersion }),
            actionLabel: t("viewDetails"),
            actionHref: `/${locale}/agentos/workspaces/${workspaceId}/modules/${installation.id}`,
        }
    })
    const refused = catalog === null || installations === null
    return (
        <_AgentOSSolutionModuleCenter
            state={catalog === undefined || installations === undefined ? "resting" : refused ? "refused" : "answered"}
            mode={mode}
            sectionLabel={mode === "catalog" ? t("catalogSection") : t("installedSection")}
            modesLabel={t("modesLabel")}
            modes={[{ id: "catalog", label: t("modes.catalog") }, { id: "installed", label: t("modes.installed") }]}
            refusedLabel={t("refused")}
            emptyLabel={t("empty")}
            emptyActionLabel={t("browse")}
            cards={mode === "catalog" ? catalogCards : installedCards}
            pendingId={pendingKey}
            outcome={outcome}
            onSelectMode={setMode}
            onPressCard={(id) => {
                if (mode === "catalog") void install(id as AgentosSolutionModule["key"])
            }}
        />
    )
}

/** Source-level tier marker for the connected solution-module center. */
export const meta = { shape: "block", world: "connected" } as const
