import { beforeEach, describe, expect, it, vi } from "vitest";

const { useNivoQuery, useSession } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((_key: unknown, query: unknown, options?: unknown) => ({ key: _key, query, options })),
    useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "tok" } })),
}));
vi.mock("../useNivoQuery", () => ({ useNivoQuery }));
vi.mock("@/hooks/auth/useSession", () => ({ useSession }));
vi.mock("@/modules/api/collab", () => ({
    listCollabTasks: vi.fn(),
    openCollabNotice: vi.fn(),
    openCollabOffice: vi.fn(),
    readCollabAvailableCommands: vi.fn(),
    readCollabGroup: vi.fn(),
    readCollabNotices: vi.fn(),
    readCollabTask: vi.fn(),
    reconcileCollabRequest: vi.fn(),
}));

import {
    collabCommandsQueryKey,
    collabGroupQueryKey,
    collabNoticeQueryKey,
    collabNoticesQueryKey,
    collabOfficeQueryKey,
    collabReconcileQueryKey,
    collabTaskQueryKey,
    collabTasksQueryKey,
    useQueryCollabCommandsSwr,
    useQueryCollabGroupSwr,
    useQueryCollabNoticeSwr,
    useQueryCollabNoticesSwr,
    useQueryCollabOfficeSwr,
    useQueryCollabReconcileSwr,
    useQueryCollabTaskSwr,
    useQueryCollabTasksSwr,
} from "./collab";
import {
    listCollabTasks,
    openCollabOffice,
    readCollabAvailableCommands,
    readCollabGroup,
    readCollabTask,
    reconcileCollabRequest,
} from "@/modules/api/collab";

describe("Collab query cache identities", () => {
    beforeEach(() => vi.clearAllMocks());

    it("scopes every read to its workspace so two workspaces never share a cache entry", () => {
        expect(collabOfficeQueryKey("ws-1")).toEqual(["collab", "office", "ws-1"]);
        expect(collabOfficeQueryKey("ws-1")).not.toEqual(collabOfficeQueryKey("ws-2"));
        expect(collabGroupQueryKey("ws-1")).toEqual(["collab", "group", "ws-1", null]);
        expect(collabGroupQueryKey("ws-1", "c-1")).toEqual(["collab", "group", "ws-1", "c-1"]);
        expect(collabTasksQueryKey("ws-1")).toEqual(["collab", "tasks", "ws-1", null, null, null, null, null]);
        expect(collabTaskQueryKey("ws-1", "t-1")).toEqual(["collab", "task", "ws-1", "t-1"]);
        expect(collabCommandsQueryKey("ws-1", "Sales")).toEqual(["collab", "commands", "ws-1", "Sales"]);
        expect(collabNoticesQueryKey("ws-1")).toEqual(["collab", "notices", "ws-1", null]);
        expect(collabNoticeQueryKey("ws-1", "n-1")).toEqual(["collab", "notice", "ws-1", "n-1"]);
        expect(collabReconcileQueryKey("ws-1", "i-1")).toEqual(["collab", "reconcile", "ws-1", "i-1"]);
    });

    it("keeps every Tasks filter variant in its own cache entry", () => {
        const unfiltered = collabTasksQueryKey("ws-1");
        const byPerson = collabTasksQueryKey("ws-1", { personMemberId: "m-1" });
        const byStatus = collabTasksQueryKey("ws-1", { status: "working" });
        const byPage = collabTasksQueryKey("ws-1", { cursor: "c-2" });
        expect(byPerson).not.toEqual(unfiltered);
        expect(byStatus).not.toEqual(unfiltered);
        expect(byPage).not.toEqual(unfiltered);
        expect(byPerson).not.toEqual(byStatus);
    });

    it("connects each read through the viewer-scoped query owner", () => {
        const office = useQueryCollabOfficeSwr("ws-1") as unknown as { readonly key: unknown };
        expect(office.key).toEqual(collabOfficeQueryKey("ws-1"));
        const group = useQueryCollabGroupSwr("ws-1", "c-1") as unknown as { readonly key: unknown; readonly options: { readonly refreshInterval: number } };
        expect(group.key).toEqual(collabGroupQueryKey("ws-1", "c-1"));
        expect(group.options.refreshInterval).toBeGreaterThan(0);
        const notices = useQueryCollabNoticesSwr("ws-1") as unknown as { readonly key: unknown; readonly options: { readonly refreshInterval: number } };
        expect(notices.key).toEqual(collabNoticesQueryKey("ws-1"));
        expect(notices.options.refreshInterval).toBeGreaterThan(0);
        expect(useNivoQuery).toHaveBeenCalledTimes(3);
    });

    it("calls the api with the signed-in access token, workspace scope and exact input", async () => {
        vi.mocked(listCollabTasks).mockResolvedValue({ ok: true, data: { tasks: [] } } as never);
        const hook = useQueryCollabTasksSwr("ws-1", { personMemberId: "m-1", status: "working" }) as unknown as { query: () => Promise<unknown> };
        await hook.query();
        expect(listCollabTasks).toHaveBeenCalledWith({ workspaceId: "ws-1", accessToken: "tok", personMemberId: "m-1", status: "working" });

        vi.mocked(readCollabGroup).mockResolvedValue({ ok: true, data: { messages: [] } } as never);
        const group = useQueryCollabGroupSwr("ws-1") as unknown as { query: () => Promise<unknown> };
        await group.query();
        expect(readCollabGroup).toHaveBeenCalledWith({ workspaceId: "ws-1", accessToken: "tok" });

        vi.mocked(readCollabTask).mockResolvedValue({ ok: true, data: { outcome: "found" } } as never);
        const task = useQueryCollabTaskSwr("ws-1", "t-1") as unknown as { query: () => Promise<unknown> };
        await task.query();
        expect(readCollabTask).toHaveBeenCalledWith({ workspaceId: "ws-1", accessToken: "tok", taskId: "t-1" });

        vi.mocked(readCollabAvailableCommands).mockResolvedValue({ ok: true, data: { status: "unresolved" } } as never);
        const commands = useQueryCollabCommandsSwr("ws-1", "Sales") as unknown as { query: () => Promise<unknown> };
        await commands.query();
        expect(readCollabAvailableCommands).toHaveBeenCalledWith({ workspaceId: "ws-1", accessToken: "tok", moduleName: "Sales" });

        vi.mocked(reconcileCollabRequest).mockResolvedValue({ ok: true, data: { outcome: "none" } } as never);
        const reconcile = useQueryCollabReconcileSwr("ws-1", "i-1") as unknown as { query: () => Promise<unknown> };
        await reconcile.query();
        expect(reconcileCollabRequest).toHaveBeenCalledWith({ workspaceId: "ws-1", accessToken: "tok", intentId: "i-1" });

        vi.mocked(openCollabOffice).mockResolvedValue({
            ok: true,
            data: { group: { groupId: "g-1" }, participants: [{ memberId: "mem-1", moduleInstallationId: null }], viewer: { memberId: "mem-1", role: "staff" } },
        } as never);
        const office = useQueryCollabOfficeSwr("ws-1") as unknown as { query: () => Promise<unknown> };
        await office.query();
        expect(openCollabOffice).toHaveBeenCalledWith({ workspaceId: "ws-1", accessToken: "tok" });
    });

    it("mounts no read for a missing workspace, task, notice, intent, module name or session", () => {
        useSession.mockReturnValueOnce({ state: { status: "anonymous" } } as never);
        const unsigned = useQueryCollabOfficeSwr("ws-1") as unknown as { readonly key: unknown };
        expect(unsigned.key).toBeNull();

        expect((useQueryCollabOfficeSwr(null) as unknown as { readonly key: unknown }).key).toBeNull();
        expect((useQueryCollabTaskSwr("ws-1", null) as unknown as { readonly key: unknown }).key).toBeNull();
        expect((useQueryCollabCommandsSwr("ws-1", null) as unknown as { readonly key: unknown }).key).toBeNull();
        expect((useQueryCollabNoticeSwr("ws-1", null) as unknown as { readonly key: unknown }).key).toBeNull();
        expect((useQueryCollabReconcileSwr("ws-1", null) as unknown as { readonly key: unknown }).key).toBeNull();
        expect((useQueryCollabGroupSwr(null) as unknown as { readonly key: unknown }).key).toBeNull();
        expect(openCollabOffice).not.toHaveBeenCalled();
    });
});
