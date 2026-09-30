"use client"

import type { DomainFieldsFragment } from "@/modules/api/__generated__/core"

import { useFormatter, useTranslations } from "next-intl"
import { useNow } from "@/hooks/time"
import { useOverviewData } from "@/hooks/overview"
import { useQueryNoticeData } from "@/hooks/query"
import type { NivoQueryFailure } from "@/modules/query"

import { BILLING_CURRENCY } from "@/modules/config"
import { OverviewSignalsBase, type OverviewSignalsCell } from "./component"
import {
    dueTone,
    expiryTone,
    OVERVIEW_SIGNAL_STATUS_KEY,
    OVERVIEW_SIGNAL_STATUS_TONE,
    signalReading,
} from "./signals.shared"

/** Public API role for OverviewSignalsProps. */
export type OverviewSignalsProps = {
    readonly label: string
}
export type { OverviewSignalsCell } from "./component"

/** Connect the account signal band to the shared overview answers. */
export const OverviewSignals = (props: OverviewSignalsProps) => {
    const { label } = props
    const data = useOverviewData()
    const now = useNow()
    const t = useTranslations("console")
    const noticeOf = useQueryNoticeData()
    const format = useFormatter()
    const statusLabel = (value: string) => {
        const key = OVERVIEW_SIGNAL_STATUS_KEY[value]
        return key === undefined ? t("status.unknown") : t(key)
    }
    const money = (value: number) =>
        format.number(value, {
            style: "currency",
            currency: BILLING_CURRENCY,
            maximumFractionDigits: 0,
        })
    const day = (value: string) =>
        format.dateTime(new Date(value), {
            day: "2-digit",
            month: "2-digit",
        })
    const domainStatus = (domain: DomainFieldsFragment) => {
        if (domain.expiresAt !== null)
            return t("domains.expiresAt", {
                date: day(domain.expiresAt),
            })
        return domain.autoRenew ? t("domains.autoRenewOn") : t("domains.autoRenewOff")
    }
    const pending = (id: string, cellLabel: string): OverviewSignalsCell => ({
        id,
        label: cellLabel,
        value: "",
        status: "",
        isSkeleton: true,
    })
    const failed = (id: string, cellLabel: string, failure: NivoQueryFailure): OverviewSignalsCell => {
        const notice = noticeOf(failure)
        const detail = notice.description ?? notice.retryLabel ?? notice.signIn?.label
        return {
            id: `${id}:${failure.kind}`,
            label: cellLabel,
            value: notice.message,
            status: detail ?? "",
            badgeTone: "danger",
        }
    }
    const apps = (() => {
        const reading = signalReading(data.apps)
        if (reading.status === "resting") return pending("apps", t("apps.title"))
        if (reading.status === "failed") return failed("apps", t("apps.title"), reading.failure)
        const first =
            reading.data.find((site) => ["awaiting_dns", "failed", "suspended"].includes(site.provisionStatus)) ??
            reading.data[0]
        return first === undefined
            ? {
                  id: "apps",
                  label: t("apps.title"),
                  value: t("overview.none"),
                  status: t("apps.emptyDescription"),
              }
            : {
                  id: "apps",
                  label: t("apps.title"),
                  value: first.slug,
                  status: statusLabel(first.provisionStatus),
                  badgeTone: OVERVIEW_SIGNAL_STATUS_TONE[first.provisionStatus],
                  emphasis: "accent" as const,
              }
    })()
    const agent = (() => {
        const workspaces = signalReading(data.workspaces)
        const pod = signalReading(data.pod)
        if (workspaces.status === "resting" || pod.status === "resting") return pending("agentos", t("agentos.title"))
        if (workspaces.status === "failed") return failed("agentos", t("agentos.title"), workspaces.failure)
        const first = workspaces.data[0]
        if (first === undefined)
            return {
                id: "agentos",
                label: t("agentos.title"),
                value: t("overview.none"),
                status: t("agentos.emptyDescription"),
            }
        let status: string
        let badgeTone: "warning" | "danger" | undefined
        if (pod.status === "ready") {
            status = pod.data.reachable ? t("agentos.podReachable") : t("agentos.podUnreachable")
            badgeTone = pod.data.reachable ? undefined : "danger"
        } else {
            status = noticeOf(pod.failure).message
            badgeTone = "danger"
        }
        return {
            id: "agentos",
            label: t("agentos.title"),
            value: first.name ?? t("agentos.kindWorkspace"),
            status,
            badgeTone,
        }
    })()
    const domains = (() => {
        const reading = signalReading(data.domains)
        if (reading.status === "resting") return pending("domains", t("domains.title"))
        if (reading.status === "failed") return failed("domains", t("domains.title"), reading.failure)
        const first = reading.data[0]
        return first === undefined
            ? {
                  id: "domains",
                  label: t("domains.title"),
                  value: t("overview.none"),
                  status: t("overview.signals.nothingToOpen"),
              }
            : {
                  id: "domains",
                  label: t("domains.title"),
                  value: first.name,
                  status: domainStatus(first),
                  badgeTone: expiryTone(first.expiresAt, now),
              }
    })()
    const wallet = (() => {
        const walletReading = signalReading(data.wallet)
        const invoiceReading = signalReading(data.invoices)
        if (walletReading.status === "resting" || invoiceReading.status === "resting")
            return pending("wallet", t("wallet.title"))
        if (walletReading.status === "failed") return failed("wallet", t("wallet.title"), walletReading.failure)
        const unpaid =
            invoiceReading.status === "ready"
                ? invoiceReading.data.find((invoice) => invoice.status === "unpaid")
                : undefined
        const invoiceFailure = invoiceReading.status === "failed" ? noticeOf(invoiceReading.failure) : undefined
        return {
            id: "wallet",
            label: t("wallet.title"),
            value: money(walletReading.data.balanceVnd),
            status:
                invoiceFailure !== undefined
                    ? invoiceFailure.message
                    : unpaid === undefined
                    ? t("wallet.noUnpaid")
                    : `${money(unpaid.amountVnd)} · ${t("wallet.dueAt", {
                          date: day(unpaid.dueAt),
                      })}`,
            badgeTone:
                invoiceFailure !== undefined
                    ? "danger"
                    : unpaid === undefined
                      ? undefined
                      : dueTone(unpaid.dueAt, now),
            emphasis: "accent" as const,
        }
    })()
    const cells = [apps, agent, domains, wallet]
    const attention = cells.filter((cell) => cell.badgeTone !== undefined).length
    const fact = cells.some((cell) => cell.isSkeleton === true)
        ? undefined
        : attention === 0
          ? t("overview.signals.factNone")
          : t("overview.signals.fact", {
                count: attention,
            })
    return <OverviewSignalsBase props={{ label, fact, cells }} />
}

/** Registry identity for the connected overview signals twin. */
