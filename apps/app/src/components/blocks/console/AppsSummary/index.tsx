"use client"

import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import type { BadgeTone } from "@nivo/ui"
import { DEFAULT_LOCALE } from "@/i18n/config"
import { useOverviewData } from "@/modules/overview/context"
import { AppsSummaryBase, type AppsSummaryState } from "./component"

export type { AppsSummaryItem, AppsSummaryProps, AppsSummaryState } from "./component"

const HOST_SUFFIX = process.env.NEXT_PUBLIC_ACADEMY_HOST_SUFFIX ?? ".nivo.vn"
const STATUS_KEY: Readonly<Record<string, string | undefined>> = { not_provisioned: "status.notProvisioned", provisioning: "status.provisioning", awaiting_dns: "status.awaitingDns", ready: "status.ready", failed: "status.failed", active: "status.active", suspended: "status.suspended" }
const STATUS_TONE: Readonly<Record<string, BadgeTone | undefined>> = { not_provisioned: "neutral", provisioning: "accent", awaiting_dns: "warning", ready: "success", failed: "danger", active: "success", suspended: "neutral" }
const NAMED_REFUSALS = new Set(["EXPERT_SITE_NOT_FOUND_EXCEPTION", "EXPERT_SITE_AMBIGUOUS_FOR_VIEWER_EXCEPTION"])

/** Connect the joined Apps collection to its one source-owned slice. */
export const AppsSummary = () => {
    const { apps } = useOverviewData()
    const t = useTranslations("console")
    const locale = useLocale()
    const router = useRouter()
    const open = (route: string) => router.push(locale === DEFAULT_LOCALE ? route : `/${locale}${route}`)
    const refusal = (code: string | undefined) => code !== undefined && NAMED_REFUSALS.has(code) ? t(`refusal.${code}`) : t("refusal.unknown")
    const statusLabel = (status: string) => STATUS_KEY[status] === undefined ? t("status.unknown") : t(STATUS_KEY[status]!)
    const state: AppsSummaryState = apps === null
        ? { phase: "pending" }
        : !apps.ok
            ? { phase: "forbidden", message: refusal(apps.code) }
            : apps.data.length === 0
                ? { phase: "empty", message: t("apps.emptyDescription") }
                : { phase: "populated", items: apps.data.map((site) => ({
                    id: site.id,
                    name: site.slug,
                    detail: site.customDomain ?? `${site.slug}${HOST_SUFFIX}`,
                    statusLabel: statusLabel(site.provisionStatus),
                    statusTone: STATUS_TONE[site.provisionStatus] ?? "neutral",
                    actionLabel: site.provisionStatus === "awaiting_dns" ? t("apps.viewDns") : t("apps.open"),
                })) }
    return <AppsSummaryBase label={t("apps.title")} openAllLabel={t("apps.openSet")} state={state} onOpenAll={() => open("/apps")} onOpenApp={(id) => open(`/apps/${id}`)} />
}

/** Registry identity for the connected Apps summary twin. */
export const meta = { shape: "block", world: "connected" } as const
