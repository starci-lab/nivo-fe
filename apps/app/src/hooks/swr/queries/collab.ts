"use client";

import {
    listCollabTasks,
    openCollabNotice,
    openCollabOffice,
    readCollabAvailableCommands,
    readCollabGroup,
    readCollabNotices,
    readCollabTask,
    reconcileCollabRequest,
    type CollabTaskStatus,
} from "@/modules/api/collab";
import { useSession } from "@/modules/auth/session";
import { useNivoQuery, type NivoQueryKey } from "../useNivoQuery";

/**
 * Collab Office query ownership (`sds.collab.workspace-chat`, `sds.collab.tasks-tab`,
 * `contract.collab.task-read`, `contract.collab.turn-notice`).
 *
 * Every key is workspace-scoped: a member of two workspaces can never see one
 * workspace's Office under another's cache entry, and a signed-out viewer mounts no
 * key at all. Reads are authorized by the backend on every call - these keys own
 * caching only, never a second grant.
 *
 * LIVE CONVERGENCE. The accepted design keeps push delivery a hint and the
 * authoritative read the truth (`contract.collab.chat` live-delivery,
 * `decision.collab.reconnect-authority`). Until the live channel is published the
 * conversation and notice reads poll at a conservative interval and every query
 * revalidates on focus, so a push that never arrives still converges the view and a
 * push that does arrive is confirmed against the same authoritative reads.
 */

/** Cache identity for the one Office landing bundle of a workspace. */
export const collabOfficeQueryKey = (workspaceId: string): NivoQueryKey => ["collab", "office", workspaceId];

/** Cache identity for one authorized conversation page of a workspace. */
export const collabGroupQueryKey = (workspaceId: string, cursor?: string | null): NivoQueryKey => ["collab", "group", workspaceId, cursor ?? null];

/** The Tasks-tab read filters; all are presentation, never authority. */
export type CollabTasksFilter = {
    readonly personMemberId?: string;
    readonly moduleInstallationId?: string;
    readonly status?: CollabTaskStatus;
    readonly cursor?: string;
    readonly limit?: number;
};

/** Cache identity for one authorized Tasks page; every filter variant caches apart. */
export const collabTasksQueryKey = (workspaceId: string, filters?: CollabTasksFilter): NivoQueryKey => [
    "collab",
    "tasks",
    workspaceId,
    filters?.personMemberId ?? null,
    filters?.moduleInstallationId ?? null,
    filters?.status ?? null,
    filters?.cursor ?? null,
    filters?.limit ?? null,
];

/** Cache identity for one authoritative task row and its card target. */
export const collabTaskQueryKey = (workspaceId: string, taskId: string): NivoQueryKey => ["collab", "task", workspaceId, taskId];

/** Cache identity for one resolved `@` name's published commands. */
export const collabCommandsQueryKey = (workspaceId: string, moduleName: string): NivoQueryKey => ["collab", "commands", workspaceId, moduleName];

/** Cache identity for the member's outstanding notice page. */
export const collabNoticesQueryKey = (workspaceId: string, cursor?: string | null): NivoQueryKey => ["collab", "notices", workspaceId, cursor ?? null];

/** Cache identity for one notice followed to its live target. */
export const collabNoticeQueryKey = (workspaceId: string, noticeId: string): NivoQueryKey => ["collab", "notice", workspaceId, noticeId];

/** Cache identity for one same-intent reconciliation read. */
export const collabReconcileQueryKey = (workspaceId: string, intentId: string): NivoQueryKey => ["collab", "reconcile", workspaceId, intentId];

const useCollabAccessToken = (): string | null => {
    const session = useSession();
    return session.state.status === "signed-in" ? session.state.accessToken : null;
};

const scoped = (accessToken: string | null, workspaceId: string | null): { accessToken: string; workspaceId: string } | null =>
    accessToken !== null && workspaceId !== null && workspaceId !== "" ? { accessToken, workspaceId } : null;

/** Read the one Office landing bundle: group plus current humans and hired modules. */
export const useQueryCollabOfficeSwr = (workspaceId: string | null) => {
    const accessToken = useCollabAccessToken();
    const scope = scoped(accessToken, workspaceId);
    return useNivoQuery(scope === null ? null : collabOfficeQueryKey(scope.workspaceId), () => openCollabOffice({ workspaceId: scope?.workspaceId ?? "", accessToken: accessToken ?? "" }));
};

/**
 * Read one authorized conversation page. Polls on a conservative interval - the live
 * channel is a hint, this authoritative page is the truth (`br.collab.reads-cheap`).
 */
export const useQueryCollabGroupSwr = (workspaceId: string | null, cursor?: string | null, refreshInterval = 5_000) => {
    const accessToken = useCollabAccessToken();
    const scope = scoped(accessToken, workspaceId);
    return useNivoQuery(scope === null ? null : collabGroupQueryKey(scope.workspaceId, cursor), () => readCollabGroup({ workspaceId: scope?.workspaceId ?? "", accessToken: accessToken ?? "", ...(cursor == null ? {} : { cursor }) }), { refreshInterval });
};

/** Read one authorized Tasks page; filters select presentation, never a second grant. */
export const useQueryCollabTasksSwr = (workspaceId: string | null, filters?: CollabTasksFilter) => {
    const accessToken = useCollabAccessToken();
    const scope = scoped(accessToken, workspaceId);
    return useNivoQuery(scope === null ? null : collabTasksQueryKey(scope.workspaceId, filters), () => listCollabTasks({ workspaceId: scope?.workspaceId ?? "", accessToken: accessToken ?? "", ...(filters ?? {}) }));
};

/** Read one task the Tasks row and the Office card share - the same authoritative row. */
export const useQueryCollabTaskSwr = (workspaceId: string | null, taskId: string | null) => {
    const accessToken = useCollabAccessToken();
    const scope = scoped(accessToken, workspaceId);
    return useNivoQuery(scope === null || taskId === null ? null : collabTaskQueryKey(scope.workspaceId, taskId), () => readCollabTask({ workspaceId: scope?.workspaceId ?? "", accessToken: accessToken ?? "", taskId: taskId ?? "" }));
};

/** Resolve one typed `@` name to its published commands; null name mounts no read. */
export const useQueryCollabCommandsSwr = (workspaceId: string | null, moduleName: string | null) => {
    const accessToken = useCollabAccessToken();
    const scope = scoped(accessToken, workspaceId);
    return useNivoQuery(scope === null || moduleName === null || moduleName === "" ? null : collabCommandsQueryKey(scope.workspaceId, moduleName), () => readCollabAvailableCommands({ workspaceId: scope?.workspaceId ?? "", accessToken: accessToken ?? "", moduleName: moduleName ?? "" }));
};

/** Read the member's outstanding turn notices; polls while outstanding turns may exist. */
export const useQueryCollabNoticesSwr = (workspaceId: string | null, cursor?: string | null, refreshInterval = 15_000) => {
    const accessToken = useCollabAccessToken();
    const scope = scoped(accessToken, workspaceId);
    return useNivoQuery(scope === null ? null : collabNoticesQueryKey(scope.workspaceId, cursor), () => readCollabNotices({ workspaceId: scope?.workspaceId ?? "", accessToken: accessToken ?? "", ...(cursor == null ? {} : { cursor }) }), { refreshInterval });
};

/** Follow one named notice to its live authoritative target; null notice mounts no read. */
export const useQueryCollabNoticeSwr = (workspaceId: string | null, noticeId: string | null) => {
    const accessToken = useCollabAccessToken();
    const scope = scoped(accessToken, workspaceId);
    return useNivoQuery(scope === null || noticeId === null ? null : collabNoticeQueryKey(scope.workspaceId, noticeId), () => openCollabNotice({ workspaceId: scope?.workspaceId ?? "", accessToken: accessToken ?? "", noticeId: noticeId ?? "" }));
};

/**
 * Read the durable state of one intent before any resend (`contract.collab.chat`
 * consumer obligation): an intent that already matched is never resent. Null intent
 * mounts no read.
 */
export const useQueryCollabReconcileSwr = (workspaceId: string | null, intentId: string | null) => {
    const accessToken = useCollabAccessToken();
    const scope = scoped(accessToken, workspaceId);
    return useNivoQuery(scope === null || intentId === null ? null : collabReconcileQueryKey(scope.workspaceId, intentId), () => reconcileCollabRequest({ workspaceId: scope?.workspaceId ?? "", accessToken: accessToken ?? "", intentId: intentId ?? "" }));
};
