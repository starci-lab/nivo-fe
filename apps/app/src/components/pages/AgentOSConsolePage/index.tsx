"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { myAgentThreads, type AgentThread } from "@/modules/api/console"
import type { Result } from "@/modules/api/graphql"
import { useSession } from "@/modules/auth/session"
import useAgentTasksRealtime from "@/modules/realtime/agent-tasks"
import { useAgentConsolePopupBridge } from "@/modules/window/agent-console"
import { _AgentOSConsolePage } from "./component"

/** Exact workspace identity supplied by the console route. */
export type AgentOSConsolePageProps = { readonly workspaceId: string }

/** Own the persisted thread query and live OpenClaw invalidation socket. */
export const AgentOSConsolePage = ({ workspaceId }: AgentOSConsolePageProps) => {
    const t = useTranslations("console.agentos.workspace.console")
    const session = useSession()
    const accessToken = session.state.status === "signed-in" ? session.state.accessToken : null
    const [answer, setAnswer] = useState<Result<ReadonlyArray<AgentThread>> | null>(null)
    const load = useCallback(() => {
        void myAgentThreads(workspaceId).then(setAnswer)
    }, [workspaceId])
    useEffect(() => {
        if (accessToken !== null) load()
    }, [accessToken, load])
    const realtimeConnection = useAgentTasksRealtime(accessToken, workspaceId, load)
    const hostConnection = useAgentConsolePopupBridge(workspaceId, accessToken !== null)
    const threads = answer?.ok === true ? answer.data : []
    const state = answer === null ? "loading" : !answer.ok ? "refused" : threads.length === 0 ? "empty" : "ready"
    return <_AgentOSConsolePage state={state} threads={threads} hostConnection={hostConnection} realtimeConnection={realtimeConnection} labels={{
        title: t("title"), lede: t("lede"), section: t("section"), loading: t("loading"), empty: t("empty"),
        refused: t("refused"), unread: t("unread"), read: t("read"), messages: (count) => t("messages", { count }),
        connection: {
            section: t("connection.section"), mainSession: t("connection.mainSession"), realtime: t("connection.realtime"),
            connected: t("connection.connected"), connecting: t("connection.connecting"), disconnected: t("connection.disconnected"),
        },
    }} />
}

/** Source-level tier marker for the connected AgentOS console page twin. */
export const meta = { shape: "page", world: "connected" } as const
