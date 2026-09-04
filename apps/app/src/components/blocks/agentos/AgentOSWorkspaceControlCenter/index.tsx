"use client";
import { useMutateRenewAgentWorkspaceAppLaunchSwr, useMutateRevokeAgentWorkspaceAppLaunchSwr, useQueryMyAgentWorkspaceControlCenterSwr } from "@/hooks";
import { useSession } from "@/modules/auth/session";
import useProvisioningRealtime from "@/modules/realtime/provisioning";
import { workspaceAppLaunchChannelName, type WorkspaceAppLaunchMessage } from "@/modules/window/workspace-app-launch";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { AgentOSWorkspaceControlCenterBase, type AgentOSWorkspaceControlCenterLabels, type AgentOSWorkspaceControlCenterState, type AgentOSWorkspacePageState } from "./component";
/** Exact workspace identity supplied by the detail route. */
export type AgentOSWorkspaceControlCenterProps = {
    readonly workspaceId: string;
    readonly pageState: AgentOSWorkspacePageState;
    readonly onSelectPageState: (pageState: AgentOSWorkspacePageState) => void;
};
/** Own the aggregate snapshot and refetch it on an exact workspace runtime invalidation. */
export const AgentOSWorkspaceControlCenter = (props: AgentOSWorkspaceControlCenterProps) => {
    const { workspaceId, pageState, onSelectPageState }: AgentOSWorkspaceControlCenterProps = props;
    const t = useTranslations("console.agentos.workspace");
    const format = useFormatter();
    const locale = useLocale();
    const session = useSession();
    const accessToken = session.state.status === "signed-in" ? session.state.accessToken : null;
    const [mounted, setMounted] = useState(false);
    const controlCenter = useQueryMyAgentWorkspaceControlCenterSwr(workspaceId);
    const { trigger: renewLaunch } = useMutateRenewAgentWorkspaceAppLaunchSwr(workspaceId);
    const { trigger: revokeLaunch } = useMutateRevokeAgentWorkspaceAppLaunchSwr(workspaceId);
    const answer = controlCenter.data;
    const [retryPending, setRetryPending] = useState(false);
    const refreshControlCenter = controlCenter.mutate;
    const realtime = useProvisioningRealtime({
        accessToken,
        target: accessToken === null ? null : {
            kind: "workspace",
            id: workspaceId
        }
    });
    const launchId = useRef<string | null>(null);
    const renewingLaunch = useRef(false);
    const [launchState, setLaunchState] = useState<"idle" | "opening" | "connected" | "blocked" | "expired" | "disconnected">("idle");
    useEffect(() => {
        setMounted(true);
    }, []);
    useEffect(() => {
        if (realtime.status !== "event")
            return;
        const currentFingerprint = answer?.ok === true ? answer.data.runtime?.fingerprint ?? null : null;
        if (realtime.event.kind === "workspace-runtime" && realtime.event.fingerprint === currentFingerprint)
            return;
        if (realtime.event.kind !== "workspace-runtime" && realtime.event.kind !== "workspace")
            return;
        void refreshControlCenter();
    }, [answer, realtime, refreshControlCenter]);
    useEffect(() => {
        const channel = new BroadcastChannel(workspaceAppLaunchChannelName(workspaceId));
        channel.addEventListener("message", (event: MessageEvent<WorkspaceAppLaunchMessage>) => {
            if (event.data.workspaceId !== workspaceId)
                return;
            if (event.data.status === "failed") {
                setLaunchState("blocked");
                return;
            }
            if (launchId.current !== null && launchId.current !== event.data.launchId) {
                void revokeLaunch(launchId.current).catch(() => undefined);
            }
            launchId.current = event.data.launchId;
            setLaunchState("connected");
        });
        return () => channel.close();
    }, [revokeLaunch, workspaceId]);
    useEffect(() => {
        const timer = window.setInterval(() => {
            if (launchId.current === null || renewingLaunch.current)
                return;
            const activeLaunchId = launchId.current;
            renewingLaunch.current = true;
            void renewLaunch(activeLaunchId).then(renewed => {
                if (!renewed.ok) {
                    setLaunchState("expired");
                }
            }).catch(() => setLaunchState("expired")).finally(() => {
                renewingLaunch.current = false;
            });
        }, 20000);
        return () => {
            window.clearInterval(timer);
            if (launchId.current !== null)
                void revokeLaunch(launchId.current).catch(() => undefined);
        };
    }, [renewLaunch, revokeLaunch]);
    const openOpenClaw = useCallback(() => {
        setLaunchState("opening");
    }, []);
    if (!mounted)
        return null;
    const labels: AgentOSWorkspaceControlCenterLabels = {
        titleFallback: t("titleFallback"),
        eyebrow: t("eyebrow"),
        description: t("description"),
        stateSection: t("stateSection"),
        readyStatus: t("readyStatus"),
        loadingTitle: t("loadingTitle"),
        refusedTitle: t("refusedTitle"),
        retry: t("retry"),
        loading: t("loading"),
        accessUnavailable: t("accessUnavailable"),
        tabsLabel: t("tabsLabel"),
        tabs: (["overview", "solutions", "ai-knowledge", "applications", "infrastructure", "operations", "access"] as const).map(id => ({
            id,
            label: t(`tabs.${id}`)
        })),
        summary: {
            section: t("summary.section"),
            status: t("summary.status"),
            plan: t("summary.plan"),
            allocation: t("summary.allocation"),
            host: t("summary.host"),
            chart: t("summary.chart")
        },
        applications: {
            section: t("applications.section"),
            openclaw: t("applications.openclaw"),
            n8n: t("applications.n8n"),
            openclawDescription: t("applications.openclawDescription"),
            n8nDescription: t("applications.n8nDescription"),
            available: t("applications.available"),
            unavailable: t("applications.unavailable"),
            manage: t("applications.manage"),
            unavailableAction: t("applications.unavailableAction"),
            securityUpgradeRequired: t("applications.securityUpgradeRequired"),
            unavailableDetail: t("applications.unavailableDetail"),
            opening: t("applications.opening"),
            openAgain: t("applications.openAgain"),
            blocked: t("applications.blocked"),
            expired: t("applications.expired"),
            disconnected: t("applications.disconnected")
        },
        runtime: {
            section: t("runtime.section"),
            cpu: t("runtime.cpu"),
            memory: t("runtime.memory"),
            requests: t("runtime.requests"),
            limits: t("runtime.limits"),
            restarts: t("runtime.restarts"),
            health: t("runtime.health"),
            fresh: t("runtime.fresh"),
            stale: t("runtime.stale"),
            unavailable: t("runtime.unavailable")
        },
        stack: {
            section: t("stack.section"),
            unavailable: t("stack.unavailable"),
            release: t("stack.release"),
            chart: t("stack.chart"),
            storage: t("stack.storage")
        },
        operations: {
            section: t("operations.section"),
            note: t("operations.note"),
            update: t("operations.update"),
            plan: t("operations.plan"),
            backup: t("operations.backup"),
            reset: t("operations.reset"),
            rebuild: t("operations.rebuild")
        }
    };
    let controlCenterState: AgentOSWorkspaceControlCenterState = "refused";
    if (answer === undefined)
        controlCenterState = "loading";
    else if (answer.ok)
        controlCenterState = "ready";
    return <AgentOSWorkspaceControlCenterBase workspaceId={workspaceId} pageState={pageState} controlCenterState={controlCenterState} message={answer !== undefined && !answer.ok ? t("refused") : undefined} data={answer?.ok === true ? answer.data : undefined} labels={labels} launchState={launchState} openClawLaunchHref={`/${locale}/launch/agentos/${workspaceId}/openclaw`} onSelectPageState={onSelectPageState} onOpenAgentConsole={openOpenClaw} retryPending={retryPending} onRetry={() => {
            setRetryPending(true);
            void refreshControlCenter().finally(() => setRetryPending(false));
        }} formatDate={value => format.dateTime(new Date(value), {
            dateStyle: "medium",
            timeStyle: "short"
        })}/>;
};
