import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as ComponentModule from "./component";
import type { GroupChatPageActions, GroupChatPageLabels, GroupChatPageView } from "./component";

/*
 * The connected page is proven through the props it hands the presentational
 * base: the base itself is covered by component.spec.tsx, so here it is a probe
 * that records the last view, labels and actions while the pure helpers
 * (conversation assembly, @module and role parsing) stay real.
 */
type ProbeProps = {
  readonly isRailOpen: boolean;
  readonly isCompactMembers: boolean;
  readonly view: GroupChatPageView;
  readonly labels: GroupChatPageLabels;
  readonly on: GroupChatPageActions;
};

type Answer = { readonly ok: true; readonly data: unknown } | {
  readonly ok: false;
  readonly code: string;
  readonly reason: string;
  readonly kind: string | null;
  readonly retryable: boolean;
};

type Query = { data: Answer | undefined; error: unknown; mutate: ReturnType<typeof vi.fn> };
type Mutation = { trigger: ReturnType<typeof vi.fn>; isMutating: boolean };

const probe = vi.hoisted(() => ({ last: null as unknown }));
const world = vi.hoisted(() => ({
  search: "",
  session: { status: "signed-in", accessToken: "token-1" } as { status: string; accessToken?: string },
  compact: false,
}));
const router = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }));
const hooks = vi.hoisted(() => ({
  workspaces: vi.fn(),
  office: vi.fn(),
  group: vi.fn(),
  tasks: vi.fn(),
  notices: vi.fn(),
  notice: vi.fn(),
  live: vi.fn(),
  post: vi.fn(),
  press: vi.fn(),
  invite: vi.fn(),
  accept: vi.fn(),
  reconcile: vi.fn(),
}));

vi.mock("./component", async () => {
  const actual = await vi.importActual<typeof ComponentModule>("./component");
  return {
    ...actual,
    GroupChatPageBase: (props: ProbeProps) => {
      probe.last = props;
      return <div data-testid="group-chat-probe">{props.view.officeState}</div>;
    },
  };
});

const translate = (key: string, values?: Record<string, unknown>): string =>
  values === undefined ? key : `${key}|${JSON.stringify(values)}`;

vi.mock("next-intl", () => ({
  useTranslations: () => translate,
  useLocale: () => "vi",
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(world.search),
}));
vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/chat",
  useRouter: () => router,
}));
vi.mock("@/modules/auth/session", () => ({
  useSession: () => ({ state: world.session }),
}));
vi.mock("@/hooks", () => ({
  useCollabLive: hooks.live,
  useCollabOfficeTransport: () => ({ reconcileRequest: hooks.reconcile }),
  useMutateCollabAcceptInvitationSwr: hooks.accept,
  useMutateCollabInviteByEmailSwr: hooks.invite,
  useMutateCollabPostMessageSwr: hooks.post,
  useMutateCollabPressApprovalSwr: hooks.press,
  useQueryCollabGroupSwr: hooks.group,
  useQueryCollabNoticeSwr: hooks.notice,
  useQueryCollabNoticesSwr: hooks.notices,
  useQueryCollabOfficeSwr: hooks.office,
  useQueryCollabTasksSwr: hooks.tasks,
  useQueryMyAgentWorkspacesSwr: hooks.workspaces,
}));

import { GroupChatPage } from ".";

const ok = (data: unknown): Answer => ({ ok: true, data });
const fail = (kind: string | null, retryable = false): Answer => ({ ok: false, code: "E", reason: "r", kind, retryable });
const query = (data?: Answer, error?: unknown): Query => ({ data, error, mutate: vi.fn() });
const mutation = (answer: Answer = ok({})): Mutation => ({ trigger: vi.fn().mockResolvedValue(answer), isMutating: false });

const OFFICE = {
  group: { name: "Văn phòng An" },
  viewer: { memberId: "mem-an", role: "owner" },
  participants: [
    { memberId: "mem-an", kind: "human", displayName: "An Nguyen", role: "owner", status: "active", moduleInstallationId: null },
    { memberId: "mem-sales", kind: "module", displayName: "Sales", role: "module", status: "active", moduleInstallationId: "mi-sales" },
  ],
};
const MESSAGE = {
  messageId: "msg-1",
  workspaceId: "ws-1",
  groupId: "grp-1",
  authorKind: "human",
  authorMemberId: "mem-an",
  authorModuleInstallationId: null,
  body: "@Sales Gửi giúp mình báo cáo tháng này",
  intentId: "intent-1",
  addressedModuleInstallationId: "mi-sales",
  addressedModuleKey: "sales",
  answersQuestionId: null,
  occurredAt: "2026-09-24T09:14:00Z",
};

let state: {
  workspaces: Query;
  office: Query;
  group: Query;
  tasks: Query;
  notices: Query;
  notice: Query;
  post: Mutation;
  press: Mutation;
  invite: Mutation;
  accept: Mutation;
};

const last = (): ProbeProps => probe.last as ProbeProps;
const flush = async (): Promise<void> => {
  await act(async () => {
    await Promise.resolve();
  });
};

beforeEach(() => {
  world.search = "";
  world.session = { status: "signed-in", accessToken: "token-1" };
  world.compact = false;
  probe.last = null;
  state = {
    workspaces: query(ok([{ id: "ws-1", name: "Công ty An" }])),
    office: query(ok(OFFICE)),
    group: query(ok({ messages: [MESSAGE], cards: [] })),
    tasks: query(ok({ tasks: [] })),
    notices: query(ok({ notices: [
      { notice: { noticeId: "n-open" }, turn: { state: "open" }, target: {} },
      { notice: { noticeId: "n-done" }, turn: { state: "resolved" }, target: {} },
    ] })),
    notice: query(),
    post: mutation(),
    press: mutation(),
    invite: mutation(ok({ outcome: "created" })),
    accept: mutation(),
  };
  hooks.workspaces.mockImplementation((enabled: boolean) => (enabled ? state.workspaces : query()));
  hooks.office.mockImplementation(() => state.office);
  hooks.group.mockImplementation(() => state.group);
  hooks.tasks.mockImplementation(() => state.tasks);
  hooks.notices.mockImplementation(() => state.notices);
  hooks.notice.mockImplementation(() => state.notice);
  hooks.post.mockImplementation(() => state.post);
  hooks.press.mockImplementation(() => state.press);
  hooks.invite.mockImplementation(() => state.invite);
  hooks.accept.mockImplementation(() => state.accept);
  hooks.reconcile.mockResolvedValue(ok({ outcome: "unmatched" }));
  window.matchMedia = vi.fn().mockImplementation(() => ({
    matches: world.compact,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("GroupChatPage workspace resolution", () => {
  it("opens the first owned workspace and mounts every Office read on it", () => {
    render(<GroupChatPage />);
    const { view } = last();
    expect(view.screen).toBe("office");
    expect(view.officeState).toBe("ready");
    expect(view.workspaceName).toBe("Công ty An");
    expect(view.viewer).toEqual({ memberId: "mem-an", role: "owner" });
    expect(hooks.office).toHaveBeenLastCalledWith("ws-1");
    expect(hooks.group).toHaveBeenLastCalledWith("ws-1");
    expect(hooks.tasks).toHaveBeenLastCalledWith("ws-1", undefined);
    expect(hooks.live).toHaveBeenLastCalledWith("ws-1");
    expect(view.items.length).toBeGreaterThan(0);
    expect(view.notices.map((item) => item.notice.noticeId)).toEqual(["n-open"]);
  });

  it("prefers the workspace named by the route and falls back to the group name", () => {
    world.search = "workspace=ws-9";
    render(<GroupChatPage />);
    expect(hooks.office).toHaveBeenLastCalledWith("ws-9");
    expect(last().view.workspaceName).toBe("Văn phòng An");
  });

  it("holds the dependent reads until Office answers", () => {
    state.office = query();
    render(<GroupChatPage />);
    expect(last().view.officeState).toBe("loading");
    expect(hooks.group).toHaveBeenLastCalledWith(null);
    expect(hooks.notices).toHaveBeenLastCalledWith(null);
    expect(last().view.workspaceName).toBe("Công ty An");
  });

  it.each([
    ["restoring", "loading"],
    ["signed-out", "denied"],
  ])("presents a %s session as %s without reading Office", (status, expected) => {
    world.session = { status };
    state.workspaces = query();
    render(<GroupChatPage />);
    expect(last().view.officeState).toBe(expected);
    expect(hooks.workspaces).toHaveBeenLastCalledWith(false);
  });

  it("waits for the workspace list and denies a viewer who owns none", () => {
    state.workspaces = query();
    const { rerender } = render(<GroupChatPage />);
    expect(last().view.officeState).toBe("loading");
    state.workspaces = query(ok([]));
    rerender(<GroupChatPage />);
    expect(last().view.officeState).toBe("denied");
    expect(hooks.office).toHaveBeenLastCalledWith(null);
  });

  it.each([
    ["an Office denial", "denied", () => { state.office = query(fail("denied")); }],
    ["a group denial", "denied", () => { state.group = query(fail("denied")); }],
    ["a tasks denial", "denied", () => { state.tasks = query(fail("denied")); }],
    ["a transport error", "failed", () => { state.office = query(undefined, new Error("offline")); }],
    ["a refused Office read", "failed", () => { state.office = query(fail("unavailable", true)); }],
    ["a stale error beside data", "failed", () => { state.office = query(ok(OFFICE), new Error("stale")); }],
  ])("maps %s to the %s Office state", (_label, expected, arrange) => {
    arrange();
    render(<GroupChatPage />);
    expect(last().view.officeState).toBe(expected);
  });

  it("retries the Office and Tasks reads through their own caches", () => {
    render(<GroupChatPage />);
    last().on.retryOffice();
    last().on.retryTasks();
    expect(state.office.mutate).toHaveBeenCalledTimes(1);
    expect(state.tasks.mutate).toHaveBeenCalledTimes(1);
  });

  it("leaves Office for the overview", () => {
    render(<GroupChatPage />);
    last().on.leaveOffice();
    expect(router.push).toHaveBeenCalledWith("/overview");
  });
});

describe("GroupChatPage tabs and tasks", () => {
  it("restores the Tasks tab from the route and reads with the current filter", () => {
    world.search = "view=tasks";
    render(<GroupChatPage />);
    expect(last().view.tab).toBe("tasks");
    expect(hooks.tasks).toHaveBeenLastCalledWith("ws-1", {});
    act(() => last().on.changeTasksFilter({ status: "working" }));
    expect(hooks.tasks).toHaveBeenLastCalledWith("ws-1", { status: "working" });
    expect(last().view.tasks.filter).toEqual({ status: "working" });
  });

  it("writes the tab into the route and drops it again for Office", () => {
    world.search = "workspace=ws-1";
    render(<GroupChatPage />);
    last().on.selectTab("tasks");
    expect(router.replace).toHaveBeenLastCalledWith("/chat?workspace=ws-1&view=tasks");
    last().on.selectTab("office");
    expect(router.replace).toHaveBeenLastCalledWith("/chat?workspace=ws-1");
  });

  it("returns to the bare path when Office is the only query", () => {
    world.search = "view=tasks";
    render(<GroupChatPage />);
    last().on.selectTab("office");
    expect(router.replace).toHaveBeenLastCalledWith("/chat");
  });

  it.each([
    ["loading", "loading", query()],
    ["denied", "denied", query(fail("denied"))],
    ["refused", "failed", query(fail("invalid"))],
    ["errored", "failed", query(undefined, new Error("offline"))],
    ["answered", "ready", query(ok({ tasks: [] }))],
  ])("presents a %s Tasks read as %s", (_label, expected, tasksQuery) => {
    state.tasks = tasksQuery;
    render(<GroupChatPage />);
    expect(last().view.tasks.state).toBe(expected);
  });

  it("opens a task card in Office and scrolls it into view", () => {
    vi.useFakeTimers();
    world.search = "view=tasks";
    const card = document.createElement("div");
    card.id = "collab-task-t-1";
    card.scrollIntoView = vi.fn();
    document.body.appendChild(card);
    render(<GroupChatPage />);
    last().on.openTaskCard("t-1");
    expect(router.replace).toHaveBeenLastCalledWith("/chat");
    vi.advanceTimersByTime(60);
    expect(card.scrollIntoView).toHaveBeenCalledWith({ block: "center" });
    card.remove();
  });

  it("scrolls in place when the card opens from Office", () => {
    vi.useFakeTimers();
    render(<GroupChatPage />);
    last().on.openTaskCard("t-missing");
    vi.advanceTimersByTime(60);
    expect(router.replace).not.toHaveBeenCalled();
  });
});

describe("GroupChatPage composer", () => {
  it("ignores a blank message", async () => {
    render(<GroupChatPage />);
    act(() => last().on.changeComposer("   "));
    last().on.sendMessage();
    await flush();
    expect(state.post.trigger).not.toHaveBeenCalled();
  });

  it("addresses the named module, answers the open question and clears on success", async () => {
    render(<GroupChatPage />);
    act(() => last().on.answerQuestion(
      { owningModuleDisplayName: null, owningModuleKey: "sales" } as never,
      { questionId: "q-1", body: "Tháng nào?".padEnd(120, ".") } as never,
    ));
    expect(last().view.composer.answering).toEqual({ questionId: "q-1", moduleName: "sales", excerpt: "Tháng nào?".padEnd(80, ".") });
    act(() => last().on.changeComposer("@Sales tháng 9"));
    last().on.sendMessage();
    await waitFor(() => expect(last().view.composer.value).toBe(""));
    const sent = state.post.trigger.mock.calls[0][0];
    expect(sent).toMatchObject({ body: "@Sales tháng 9", moduleName: "Sales", answersQuestionId: "q-1" });
    expect(typeof sent.intentId).toBe("string");
    expect(last().view.composer.answering).toBeNull();
  });

  it("sends plain text without a module or question and keeps a fresh intent per message", async () => {
    render(<GroupChatPage />);
    act(() => last().on.changeComposer("Chào cả nhà"));
    last().on.sendMessage();
    await waitFor(() => expect(last().view.composer.value).toBe(""));
    act(() => last().on.changeComposer("Tin thứ hai"));
    last().on.sendMessage();
    await waitFor(() => expect(state.post.trigger).toHaveBeenCalledTimes(2));
    const [first, second] = state.post.trigger.mock.calls.map((call) => call[0]);
    expect(first).not.toHaveProperty("moduleName");
    expect(first).not.toHaveProperty("answersQuestionId");
    expect(first.intentId).not.toBe(second.intentId);
  });

  it("keeps the draft and marks a lost answer retryable or a refusal denied", async () => {
    state.post = mutation(fail("unavailable", true));
    const { rerender } = render(<GroupChatPage />);
    act(() => last().on.changeComposer("Chào"));
    last().on.sendMessage();
    await waitFor(() => expect(last().view.composer.failure).toBe("retry"));
    expect(last().view.composer.value).toBe("Chào");
    state.post = mutation(fail("denied"));
    rerender(<GroupChatPage />);
    last().on.sendMessage();
    await waitFor(() => expect(last().view.composer.failure).toBe("denied"));
  });

  it("reconciles the same intent before resending and never resends a matched one", async () => {
    state.post = mutation(fail("unavailable", true));
    const { rerender } = render(<GroupChatPage />);
    act(() => last().on.changeComposer("Chào"));
    last().on.sendMessage();
    await waitFor(() => expect(last().view.composer.failure).toBe("retry"));
    const intentId = state.post.trigger.mock.calls[0][0].intentId;
    hooks.reconcile.mockResolvedValueOnce(ok({ outcome: "matched" }));
    last().on.retrySend();
    await waitFor(() => expect(last().view.composer.failure).toBeNull());
    expect(hooks.reconcile).toHaveBeenCalledWith({ workspaceId: "ws-1", accessToken: "token-1", intentId });
    expect(state.post.trigger).toHaveBeenCalledTimes(1);
    expect(last().view.composer.value).toBe("");

    state.post = mutation();
    rerender(<GroupChatPage />);
    act(() => last().on.changeComposer("Lần nữa"));
    last().on.retrySend();
    await waitFor(() => expect(state.post.trigger).toHaveBeenCalledTimes(1));
    expect(state.post.trigger.mock.calls[0][0].body).toBe("Lần nữa");
  });

  it("does not reconcile without a session token", async () => {
    world.session = { status: "signed-out" };
    world.search = "workspace=ws-1";
    render(<GroupChatPage />);
    last().on.retrySend();
    await flush();
    expect(hooks.reconcile).not.toHaveBeenCalled();
  });

  it("cancels an answer in progress", () => {
    render(<GroupChatPage />);
    act(() => last().on.answerQuestion(
      { owningModuleDisplayName: "Kế toán", owningModuleKey: "accounting" } as never,
      { questionId: "q-2", body: "Mã số thuế?" } as never,
    ));
    expect(last().view.composer.answering?.moduleName).toBe("Kế toán");
    act(() => last().on.cancelAnswer());
    expect(last().view.composer.answering).toBeNull();
  });

  it("falls back to a time based intent when randomUUID is unavailable", async () => {
    vi.stubGlobal("crypto", {});
    render(<GroupChatPage />);
    act(() => last().on.changeComposer("Chào"));
    last().on.sendMessage();
    await waitFor(() => expect(state.post.trigger).toHaveBeenCalled());
    expect(state.post.trigger.mock.calls[0][0].intentId).toMatch(/^intent-\d+-/);
    vi.unstubAllGlobals();
  });
});

describe("GroupChatPage invite", () => {
  it("ignores an empty email", async () => {
    render(<GroupChatPage />);
    last().on.submitInvite();
    await flush();
    expect(state.invite.trigger).not.toHaveBeenCalled();
  });

  it("confirms a created invitation and clears the field", async () => {
    render(<GroupChatPage />);
    act(() => {
      last().on.changeInviteEmail("minh@nivo.vn");
      last().on.changeInviteRole("manager");
    });
    last().on.submitInvite();
    await waitFor(() => expect(last().view.invite.outcome).toBe("created"));
    expect(state.invite.trigger).toHaveBeenCalledWith({ email: "minh@nivo.vn", role: "manager" });
    expect(last().view.invite).toMatchObject({ email: "", invitedEmail: "minh@nivo.vn", role: "manager" });
  });

  it("keeps the email for an existing invitation", async () => {
    state.invite = mutation(ok({ outcome: "existing" }));
    render(<GroupChatPage />);
    act(() => last().on.changeInviteEmail("huy@nivo.vn"));
    last().on.submitInvite();
    await waitFor(() => expect(last().view.invite.outcome).toBe("existing"));
    expect(last().view.invite.email).toBe("huy@nivo.vn");
  });

  it.each([
    ["a refusal", fail("denied")],
    ["an unknown outcome", ok({ outcome: "queued" })],
    ["an empty answer", ok(undefined)],
  ])("reports %s as refused", async (_label, answer) => {
    state.invite = mutation(answer);
    render(<GroupChatPage />);
    act(() => last().on.changeInviteEmail("x@nivo.vn"));
    last().on.submitInvite();
    await waitFor(() => expect(last().view.invite.outcome).toBe("refused"));
    expect(last().view.invite.invitedEmail).toBeNull();
  });
});

describe("GroupChatPage approvals", () => {
  it("settles the card the press answered with", async () => {
    const card = { approvalId: "ap-1", state: "approved" };
    let release: (value: Answer) => void = () => undefined;
    state.press.trigger.mockReturnValueOnce(new Promise<Answer>((resolve) => { release = resolve; }));
    render(<GroupChatPage />);
    last().on.pressApproval("ap-1", "approve");
    await waitFor(() => expect(last().view.pressingApprovalId).toBe("ap-1"));
    await act(async () => release(ok({ card })));
    await waitFor(() => expect(last().view.pressingApprovalId).toBeNull());
    expect(state.press.trigger).toHaveBeenCalledWith({ approvalId: "ap-1", button: "approve" });
    expect(last().view.settledApprovals).toEqual({ "ap-1": card });
  });

  it("leaves the card to the revalidated read when the answer carries none", async () => {
    render(<GroupChatPage />);
    last().on.pressApproval("ap-1", "reject");
    await waitFor(() => expect(state.press.trigger).toHaveBeenCalled());
    await flush();
    expect(last().view.settledApprovals).toEqual({});
    expect(last().view.approvalNotices).toEqual({});
  });

  it("says denied for a refused press and uncertain for a lost one, clearing on the next press", async () => {
    state.press = mutation(fail("denied"));
    const { rerender } = render(<GroupChatPage />);
    last().on.pressApproval("ap-1", "approve");
    await waitFor(() => expect(last().view.approvalNotices).toEqual({ "ap-1": "denied" }));
    state.press = mutation(fail(null, true));
    rerender(<GroupChatPage />);
    last().on.pressApproval("ap-1", "approve");
    await waitFor(() => expect(last().view.approvalNotices).toEqual({ "ap-1": "uncertain" }));
    expect(last().view.settledApprovals).toEqual({});
  });
});

describe("GroupChatPage invitation acceptance", () => {
  it("withholds Office and presents the acceptance screen with the role hint", () => {
    world.search = "invitation=inv-1&workspace=ws-1&role=manager";
    render(<GroupChatPage />);
    const { view } = last();
    expect(view.screen).toBe("acceptance");
    expect(view.officeState).toBe("ready");
    expect(view.acceptance).toEqual({ state: "ready", roleHint: "manager", invalidLink: false });
    expect(hooks.office).toHaveBeenLastCalledWith(null);
    expect(hooks.workspaces).toHaveBeenLastCalledWith(false);
  });

  it("marks a link without a workspace invalid and never accepts it", async () => {
    world.search = "invitation=inv-1";
    render(<GroupChatPage />);
    expect(last().view.acceptance?.invalidLink).toBe(true);
    last().on.acceptInvitation();
    await flush();
    expect(state.accept.trigger).not.toHaveBeenCalled();
  });

  it("re-opens Office on the workspace after acceptance", async () => {
    world.search = "invitation=inv-1&workspace=ws-1&role=staff";
    render(<GroupChatPage />);
    last().on.acceptInvitation();
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/chat?workspace=ws-1"));
    expect(state.accept.trigger).toHaveBeenCalledWith({ invitationId: "inv-1" });
    expect(last().view.acceptance?.state).toBe("ready");
  });

  it("shows a refused acceptance", async () => {
    world.search = "invitation=inv-1&workspace=ws-1";
    state.accept = mutation(fail("denied"));
    render(<GroupChatPage />);
    last().on.acceptInvitation();
    await waitFor(() => expect(last().view.acceptance?.state).toBe("refused"));
    expect(router.replace).not.toHaveBeenCalled();
  });
});

describe("GroupChatPage notices", () => {
  const openNotice = (answer: Answer) => {
    const { rerender } = render(<GroupChatPage />);
    act(() => last().on.openNotice("n-1"));
    expect(hooks.notice).toHaveBeenLastCalledWith("ws-1", "n-1");
    state.notice = query(answer);
    rerender(<GroupChatPage />);
    return rerender;
  };

  it.each([
    ["an unreadable notice", "unavailable", fail("denied")],
    ["a handled turn", "handled", ok({ outcome: "handled" })],
    ["an ended turn", "ended", ok({ outcome: "ended" })],
    ["an unknown outcome", "unavailable", ok({ outcome: "unavailable" })],
  ])("records %s as %s", async (_label, expected, answer) => {
    openNotice(answer);
    await waitFor(() => expect(last().view.noticeOutcomes).toEqual({ "n-1": expected }));
    expect(hooks.notice).toHaveBeenLastCalledWith("ws-1", null);
  });

  it.each([
    ["approval", { approvalId: "ap-1", taskId: null, cardMessageId: null }, "collab-approval-ap-1"],
    ["task", { approvalId: null, taskId: "t-1", cardMessageId: null }, "collab-task-t-1"],
    ["card", { approvalId: null, taskId: null, cardMessageId: "m-1" }, "collab-msg-m-1"],
  ])("scrolls an open %s notice to its target", async (_label, target, elementId) => {
    const node = document.createElement("div");
    node.id = elementId;
    node.scrollIntoView = vi.fn();
    document.body.appendChild(node);
    openNotice(ok({ outcome: "open", target }));
    await waitFor(() => expect(node.scrollIntoView).toHaveBeenCalledWith({ block: "center" }));
    expect(last().view.noticeOutcomes).toEqual({});
    node.remove();
  });

  it("returns to Office for an open notice raised from Tasks", async () => {
    world.search = "view=tasks";
    openNotice(ok({ outcome: "open", target: { approvalId: "ap-1", taskId: null, cardMessageId: null } }));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/chat"));
  });

  it("closes an open notice without a target and without scrolling", async () => {
    openNotice(ok({ outcome: "open", target: { approvalId: null, taskId: null, cardMessageId: null } }));
    await waitFor(() => expect(hooks.notice).toHaveBeenLastCalledWith("ws-1", null));
    expect(router.replace).not.toHaveBeenCalled();
    expect(last().view.noticeOutcomes).toEqual({});
  });
});

describe("GroupChatPage member sheet", () => {
  it("closes the member sheet at desktop width", () => {
    render(<GroupChatPage />);
    act(() => last().on.changeRailOpen(true));
    expect(last().isCompactMembers).toBe(false);
    expect(last().isRailOpen).toBe(false);
  });

  it("keeps the member sheet open at compact width while Office is ready", () => {
    world.compact = true;
    render(<GroupChatPage />);
    act(() => last().on.changeRailOpen(true));
    expect(last().isCompactMembers).toBe(true);
    expect(last().isRailOpen).toBe(true);
  });
});

describe("GroupChatPage labels", () => {
  it("resolves every catalog entry, passing its values", () => {
    render(<GroupChatPage />);
    const { labels } = last();
    expect(labels.title).toBe("title");
    expect(labels.statuses["waiting-on-answer"]).toBe("statuses.waitingOnAnswer");
    expect(labels.members.humans(2)).toBe('members.humans|{"count":2}');
    expect(labels.members.modules(3)).toBe('members.modules|{"count":3}');
    expect(labels.members.countLabel(5)).toBe('members.countLabel|{"count":5}');
    expect(labels.members.openRail(5)).toBe('members.openRail|{"count":5}');
    expect(labels.invite.sent("a@b.vn")).toBe('invite.sent|{"email":"a@b.vn"}');
    expect(labels.composer.answering("Sales", "Tháng nào?")).toBe('composer.answering|{"moduleName":"Sales","excerpt":"Tháng nào?"}');
    expect(labels.card.reference("T-1", "Sales")).toBe('card.reference|{"ref":"T-1","moduleName":"Sales"}');
    expect(labels.card.requestedBy("An")).toBe('card.requestedBy|{"name":"An"}');
    expect(labels.card.assignedTo("Huy")).toBe('card.assignedTo|{"name":"Huy"}');
    expect(labels.approval.decidedBy("Minh", "09:14")).toBe('approval.decidedBy|{"name":"Minh","at":"09:14"}');
    expect(labels.question.waiting("Sales")).toBe('question.waiting|{"name":"Sales"}');
    expect(labels.notice.taskAssign()).toBe("notice.taskAssign");
    expect(labels.tasks.count(4)).toBe('tasks.count|{"count":4}');
    expect(labels.tasks.asker("An")).toBe('tasks.asker|{"name":"An"}');
    expect(labels.tasks.assignee("Huy")).toBe('tasks.assignee|{"name":"Huy"}');
    expect(labels.tasks.module("Sales")).toBe('tasks.module|{"name":"Sales"}');
    expect(labels.accept.roleLine("Quản lý")).toBe('accept.roleLine|{"role":"Quản lý"}');
  });

  it("formats times in the page locale and passes an unreadable instant through", () => {
    render(<GroupChatPage />);
    const { formatTime } = last().labels;
    expect(formatTime("not-a-time")).toBe("not-a-time");
    const at = "2026-09-24T09:14:00Z";
    expect(formatTime(at)).toBe(new Intl.DateTimeFormat("vi", { hour: "2-digit", minute: "2-digit" }).format(new Date(at)));
  });
});
