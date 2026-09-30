"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/hooks"
import { agentosHome, newWorkspace } from "@/modules/routes"
import { AgentOSPageBase } from "./component"
import type { AgentOSPageBaseState, AgentOSPageLabels } from "./component"

/** Route identity for the dashboard, pre-persistence create flow, or persisted order. */
type AgentOSPageRouteProps = AgentOSPageBaseState
/** Connected page input; resolved copy and commands are page-owned. */
type AgentOSPageProps = AgentOSPageRouteProps & {
    readonly labels?: AgentOSPageLabels
    readonly onOpenDashboard?: () => void
    readonly onCreate?: () => void
}

/** Resolve page copy and route navigation while child blocks own every request. */
export const AgentOSPage = (props: AgentOSPageProps) => {
    const t = useTranslations("console")
    const router = useRouter()
    const state: AgentOSPageBaseState =
        props.mode === "resume" ? { mode: "resume", orderId: props.orderId } : { mode: props.mode }
    return (
        <AgentOSPageBase
            state={state}
            props={{
                labels: {
                    path: t("navigationLabel"),
                    agentos: t("agentos.title"),
                    dashboardDescription: t("agentos.description"),
                    createTitle: t("agentos.createTitle"),
                    createDescription: t("agentos.createDescription"),
                    orderTitle: t("agentos.orderTitle"),
                    orderDescription: t("agentos.orderDescription"),
                    createAction: t("agentos.purchase"),
                    dashboardEyebrow: t("agentos.dashboardEyebrow"),
                    createEyebrow: t("agentos.createEyebrow"),
                    orderEyebrow: t("agentos.orderEyebrow"),
                },
            }}
            on={{
                openDashboard: () => router.push(agentosHome()),
                create: () => router.push(newWorkspace()),
            }}
        />
    )
}
