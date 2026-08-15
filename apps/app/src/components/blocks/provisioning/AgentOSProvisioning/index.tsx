"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import { DEFAULT_LOCALE } from "@/i18n/config"
import { useSession } from "@/modules/auth/session"
import {
    catalogItems,
    myAgentWorkspace,
    myCatalogOrders,
    myInvoices,
    orderAgentOs,
    type CatalogItemRow,
    type CatalogTierRow,
} from "@/modules/api/console"
import useProvisioningRealtime, { type ProvisioningTarget } from "@/modules/realtime/provisioning"
import { _AgentOSProvisioning, type AgentOSProvisioningViewProps } from "./component"

/** Route identity owned by the AgentOS provisioning block. */
export type AgentOSProvisioningProps = {
    readonly context:
        | { readonly mode: "new" }
        | { readonly mode: "resume"; readonly orderId: string }
}

type AgentOSFlow =
    | { readonly phase: "catalog_loading" }
    | { readonly phase: "request"; readonly item: CatalogItemRow; readonly tier: CatalogTierRow | null }
    | { readonly phase: "submitting"; readonly item: CatalogItemRow; readonly tier: CatalogTierRow | null }
    | { readonly phase: "awaiting_payment"; readonly orderId: string; readonly subject: string; readonly detail: string }
    | { readonly phase: "accepted"; readonly orderId: string; readonly subject: string; readonly detail: string }
    | { readonly phase: "preparing"; readonly orderId: string; readonly workspaceId: string; readonly subject: string; readonly detail: string }
    | { readonly phase: "ready"; readonly orderId: string; readonly workspaceId: string; readonly subject: string; readonly detail: string }
    | { readonly phase: "failed"; readonly orderId: string | null; readonly subject: string; readonly detail: string; readonly reason: string; readonly atStep: 0 | 1 | 2 | 3 }

const workspacePhase = (status: string): "preparing" | "ready" | "failed" => {
    if (status === "active" || status === "ready") return "ready"
    if (status === "failed") return "failed"
    return "preparing"
}

/** Own the real order → payment → workspace lifecycle and its matching Socket.IO target. */
export const AgentOSProvisioning = ({ context }: AgentOSProvisioningProps) => {
    const t = useTranslations("console.provisioningFlows")
    const format = useFormatter()
    const locale = useLocale()
    const router = useRouter()
    const session = useSession()
    const accessToken = session.state.status === "signed-in" ? session.state.accessToken : null
    const [flow, setFlow] = useState<AgentOSFlow>({ phase: "catalog_loading" })
    const route = useCallback((path: string) => locale === DEFAULT_LOCALE ? path : `/${locale}${path}`, [locale])

    const reconcile = useCallback(async (orderId: string) => {
        const [orders, invoices, workspaces] = await Promise.all([
            myCatalogOrders(),
            myInvoices(),
            myAgentWorkspace(),
        ])
        if (!orders.ok || !invoices.ok || !workspaces.ok) {
            setFlow({ phase: "failed", orderId, subject: "AgentOS", detail: orderId, reason: t("failedLoad"), atStep: 0 })
            return
        }
        const order = orders.data.find((candidate) => candidate.id === orderId)
        if (order === undefined) {
            setFlow({ phase: "failed", orderId, subject: "AgentOS", detail: orderId, reason: t("agentos.orderMissing"), atStep: 0 })
            return
        }
        const subject = order.catalogItem?.name ?? "AgentOS"
        const detail = order.catalogTier?.name ?? orderId
        const workspace = workspaces.data.find((candidate) => candidate.catalogOrder?.id === orderId)
        if (workspace !== undefined) {
            const phase = workspacePhase(workspace.status)
            if (phase === "failed") {
                setFlow({ phase: "failed", orderId, subject, detail: workspace.id, reason: t("failedProvision"), atStep: 3 })
                return
            }
            setFlow({ phase, orderId, workspaceId: workspace.id, subject, detail: workspace.name ?? workspace.id })
            return
        }
        const invoice = invoices.data.find((candidate) => candidate.catalogOrder?.id === orderId)
        if (order.status === "pending_payment" || invoice?.status === "unpaid") {
            setFlow({ phase: "awaiting_payment", orderId, subject, detail })
            return
        }
        if (order.status === "cancelled") {
            setFlow({ phase: "failed", orderId, subject, detail, reason: t("agentos.orderCancelled"), atStep: 1 })
            return
        }
        setFlow({ phase: "accepted", orderId, subject, detail })
    }, [t])

    useEffect(() => {
        if (context.mode === "resume" && accessToken === null) return
        let cancelled = false
        const settle = async () => {
            if (context.mode === "resume") {
                if (!cancelled) await reconcile(context.orderId)
                return
            }
            const catalogue = await catalogItems("ai_agent")
            if (cancelled) return
            if (!catalogue.ok || catalogue.data.length === 0) {
                setFlow({ phase: "failed", orderId: null, subject: "AgentOS", detail: "", reason: t("failedLoad"), atStep: 0 })
                return
            }
            const item = catalogue.data[0]
            const tier = [...(item.tiers ?? [])].sort((left, right) => left.orderIndex - right.orderIndex)[0] ?? null
            setFlow({ phase: "request", item, tier })
        }
        void settle()
        return () => {
            cancelled = true
        }
    }, [accessToken, context, reconcile, t])

    const target: ProvisioningTarget | null = flow.phase === "preparing" || flow.phase === "ready"
        ? { kind: "workspace", id: flow.workspaceId }
        : flow.phase === "awaiting_payment" || flow.phase === "accepted"
            ? { kind: "order", id: flow.orderId }
            : null
    const realtime = useProvisioningRealtime({ accessToken, target })

    useEffect(() => {
        if (realtime.status !== "event") return
        if (realtime.event.kind === "order") {
            void reconcile(realtime.event.id)
            return
        }
        if (realtime.event.kind !== "workspace") return
        const event = realtime.event
        const phase = workspacePhase(event.status)
        setFlow((current) => {
            if (current.phase !== "preparing" && current.phase !== "ready") return current
            if (phase === "failed") return { phase: "failed", orderId: current.orderId, subject: current.subject, detail: current.detail, reason: event.reason ?? t("failedProvision"), atStep: 3 }
            return { ...current, phase }
        })
    }, [realtime, reconcile, t])

    useEffect(() => {
        if (flow.phase !== "accepted") return
        const timer = window.setInterval(() => {
            void reconcile(flow.orderId)
        }, 4000)
        return () => window.clearInterval(timer)
    }, [flow, reconcile])

    useEffect(() => {
        if (flow.phase !== "preparing") return
        // Socket.IO is the fast path, while the owner-scoped GraphQL snapshot is the recovery path
        // for a tab that reconnects after a terminal Kafka event has already been relayed.
        const timer = window.setInterval(() => {
            void reconcile(flow.orderId)
        }, 4000)
        return () => window.clearInterval(timer)
    }, [flow, reconcile])

    useEffect(() => {
        if (context.mode !== "resume" || realtime.status !== "connected") return
        void reconcile(context.orderId)
    }, [context, realtime.status, reconcile])

    const submit = async () => {
        if (flow.phase !== "request") return
        setFlow({ phase: "submitting", item: flow.item, tier: flow.tier })
        const order = await orderAgentOs(flow.item.slug, flow.tier?.id)
        if (!order.ok) {
            setFlow({ phase: "failed", orderId: null, subject: flow.item.name, detail: flow.tier?.name ?? flow.item.slug, reason: order.reason, atStep: 0 })
            return
        }
        const next = {
            phase: "awaiting_payment" as const,
            orderId: order.data.id,
            subject: order.data.catalogItem?.name ?? flow.item.name,
            detail: order.data.catalogTier?.name ?? flow.tier?.name ?? order.data.id,
        }
        setFlow(next)
        router.replace(route(`/agentos/orders/${order.data.id}`))
    }

    const phaseIndex = flow.phase === "catalog_loading" || flow.phase === "request" || flow.phase === "submitting"
        ? 0 : flow.phase === "awaiting_payment" ? 1 : flow.phase === "accepted" ? 2 : flow.phase === "preparing" ? 3 : flow.phase === "failed" ? flow.atStep : 4
    const stepLabels = [t("steps.request"), t("steps.payment"), t("steps.createWorkspace"), t("steps.infrastructure"), t("steps.manage")]
    const steps = stepLabels.map((label, index) => ({
        ordinal: String(index + 1),
        label,
        state: index < phaseIndex ? "done" as const : index === phaseIndex ? "current" as const : "upcoming" as const,
        stateLabel: index < phaseIndex ? t("stepState.done") : index === phaseIndex ? t("stepState.current") : t("stepState.upcoming"),
    }))
    const view = (): AgentOSProvisioningViewProps => {
        if (flow.phase === "catalog_loading") return { state: flow.phase, props: { steps, subject: "AgentOS", detail: t("loadingText"), statusTitle: t("loadingTitle"), statusText: t("loadingText") } }
        if (flow.phase === "request" || flow.phase === "submitting") {
            const price = flow.tier?.priceMonthlyVnd
            const detail = price === null || price === undefined ? flow.tier?.name ?? flow.item.slug : `${flow.tier?.name ?? ""} · ${format.number(price, { style: "currency", currency: "VND", maximumFractionDigits: 0 })}`
            return { state: flow.phase, props: { steps, subject: flow.item.name, detail, statusTitle: t("agentos.requestTitle"), statusText: t("agentos.requestText"), requestActionLabel: t("agentos.submit"), isRequestPending: flow.phase === "submitting" }, on: { request: () => void submit() } }
        }
        if (flow.phase === "failed") return { state: "failed", props: { steps, subject: flow.subject, detail: flow.detail, statusTitle: t("failedTitle"), statusText: flow.reason, statusActionLabel: t("agentos.startAgain") }, on: { statusAction: () => router.push(route("/agentos")) } }
        if (flow.phase === "awaiting_payment") return { state: flow.phase, props: { steps, subject: flow.subject, detail: flow.detail, statusTitle: t("agentos.paymentTitle"), statusText: t("agentos.paymentText"), statusActionLabel: t("agentos.openWallet") }, on: { statusAction: () => router.push(route("/wallet")) } }
        if (flow.phase === "ready") return { state: flow.phase, props: { steps, subject: flow.subject, detail: flow.detail, statusTitle: t("readyTitle"), statusText: t("agentos.readyText"), statusActionLabel: t("agentos.manage") }, on: { statusAction: () => router.push(route("/agentos")) } }
        return { state: flow.phase, props: { steps, subject: flow.subject, detail: flow.detail, statusTitle: flow.phase === "accepted" ? t("agentos.acceptedTitle") : t("preparingTitle"), statusText: realtime.status === "connecting" ? t("connecting") : flow.phase === "accepted" ? t("agentos.acceptedText") : t("agentos.preparingText") } }
    }

    return <_AgentOSProvisioning {...view()} />
}

/** Source-level tier marker for the connected block half. */
export const meta = { shape: "block", world: "connected" } as const
