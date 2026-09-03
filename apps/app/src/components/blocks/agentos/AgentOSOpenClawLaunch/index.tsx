"use client";
import { useMutateIssueAgentWorkspaceAppLaunchSwr, useMutateRevokeAgentWorkspaceAppLaunchSwr } from "@/hooks";
import { useRouter } from "@/i18n/navigation";
import { useSession } from "@/modules/auth/session";
import { followWorkspaceAppRedirect, safeWorkspaceAppRedirect, workspaceAppLaunchChannelName, type WorkspaceAppLaunchMessage } from "@/modules/window/workspace-app-launch";
import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { AgentOSOpenClawLaunchBase, type AgentOSOpenClawLaunchLabels, type OpenClawLaunchBlockState } from "./component";
/** Exact workspace identity supplied by the dedicated launch route. */
export type AgentOSOpenClawLaunchProps = {
    readonly workspaceId: string;
};
/** Issue a launch inside a native new tab, notify its Nivo owner, then leave no credential in FE state. */
export const AgentOSOpenClawLaunch = (props: AgentOSOpenClawLaunchProps) => {
    const { workspaceId }: AgentOSOpenClawLaunchProps = props;
    const session = useSession();
    const t = useTranslations("console.agentos.workspace.launch");
    const format = useFormatter();
    const router = useRouter();
    const { trigger: issueLaunch } = useMutateIssueAgentWorkspaceAppLaunchSwr(workspaceId);
    const { trigger: revokeLaunch } = useMutateRevokeAgentWorkspaceAppLaunchSwr(workspaceId);
    const started = useRef(false);
    const [retry, setRetry] = useState(0);
    const [launchState, setLaunchState] = useState<OpenClawLaunchBlockState>("issuing");
    const [expiresAt, setExpiresAt] = useState<string>();
    useEffect(() => {
        if (session.state.status === "anonymous") {
            setLaunchState("blocked");
            return;
        }
        if (session.state.status !== "signed-in" || started.current)
            return;
        started.current = true;
        const channel = new BroadcastChannel(workspaceAppLaunchChannelName(workspaceId));
        const publish = (message: WorkspaceAppLaunchMessage) => channel.postMessage(message);
        const launch = async () => {
            const issued = await issueLaunch(undefined);
            if (!issued.ok) {
                publish({
                    status: "failed",
                    workspaceId
                });
                channel.close();
                setLaunchState("blocked");
                return;
            }
            const destination = safeWorkspaceAppRedirect(issued.data.redirectUrl);
            if (destination === null) {
                await revokeLaunch(issued.data.launchId);
                publish({
                    status: "failed",
                    workspaceId
                });
                channel.close();
                setLaunchState("blocked");
                return;
            }
            publish({
                status: "issued",
                workspaceId,
                launchId: issued.data.launchId
            });
            channel.close();
            setExpiresAt(issued.data.expiresAt);
            setLaunchState("connected");
            window.requestAnimationFrame(() => followWorkspaceAppRedirect(destination));
        };
        void launch().catch(() => {
            publish({
                status: "failed",
                workspaceId
            });
            channel.close();
            setLaunchState("blocked");
        });
    }, [issueLaunch, retry, revokeLaunch, session.state.status, workspaceId]);
    const labels: AgentOSOpenClawLaunchLabels = {
        title: t("title"),
        workspaceLabel: t("workspaceLabel"),
        securityNote: t("securityNote"),
        returnToWorkspace: t("returnToWorkspace"),
        retry: t("retry"),
        states: {
            issuing: {
                label: t("states.issuing.label"),
                detail: t("states.issuing.detail")
            },
            connected: {
                label: t("states.connected.label"),
                detail: t("states.connected.detail")
            },
            blocked: {
                label: t("states.blocked.label"),
                detail: t("states.blocked.detail")
            },
            expired: {
                label: t("states.expired.label"),
                detail: t("states.expired.detail")
            },
            disconnected: {
                label: t("states.disconnected.label"),
                detail: t("states.disconnected.detail")
            }
        }
    };
    const detail = launchState === "connected" && expiresAt !== undefined ? t("expiresAt", {
        time: format.dateTime(new Date(expiresAt), {
            timeStyle: "medium"
        })
    }) : undefined;
    return <AgentOSOpenClawLaunchBase launchState={launchState} workspaceId={workspaceId} detail={detail} labels={labels} isRetryPending={retry > 0 && launchState === "issuing"} onRetry={() => {
            started.current = false;
            setLaunchState("issuing");
            setRetry(value => value + 1);
        }} onReturn={() => router.push(`/agentos/workspaces/${workspaceId}`)}/>;
};
