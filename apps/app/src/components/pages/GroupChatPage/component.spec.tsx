import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type {
  CollabApprovalView,
  CollabBindingView,
  CollabMessageView,
  CollabOfficeParticipant,
  CollabOfficeViewer,
  CollabTaskQuestionView,
  CollabTaskView,
  CollabTurnNoticeItem,
} from "@/modules/api/collab";
import {
  buildConversationItems,
  GroupChatPageBase,
  invalidTasksFilter,
  mayPresentDecision,
  mayPresentInvite,
  parseAddressedModule,
  shortTaskRef,
  type GroupChatPageActions,
  type GroupChatPageLabels,
  type GroupChatPageView,
} from "./component";

const OWNER: CollabOfficeViewer = { memberId: "mem-an", role: "owner" };
const STAFF: CollabOfficeViewer = { memberId: "mem-huy", role: "staff" };

const PARTICIPANTS: ReadonlyArray<CollabOfficeParticipant> = [
  { memberId: "mem-an", kind: "human", displayName: "An Nguyen", role: "owner", status: "active", moduleInstallationId: null },
  { memberId: "mem-minh", kind: "human", displayName: "Minh", role: "manager", status: "active", moduleInstallationId: null },
  { memberId: "mem-huy", kind: "human", displayName: "Huy", role: "staff", status: "active", moduleInstallationId: null },
  { memberId: "mem-sales", kind: "module", displayName: "Sales", role: "module", status: "active", moduleInstallationId: "mi-sales" },
  { memberId: "mem-acc", kind: "module", displayName: "Accounting", role: "module", status: "active", moduleInstallationId: "mi-acc" },
  { memberId: "mem-bot", kind: "module", displayName: "Chatbot", role: "module", status: "active", moduleInstallationId: "mi-bot" },
];

const MESSAGE: CollabMessageView = {
  messageId: "msg-1",
  workspaceId: "ws-1",
  groupId: "grp-1",
  authorKind: "human",
  authorMemberId: "mem-an",
  authorModuleInstallationId: null,
  body: "@Sales Bạn có thể gửi giúp mình báo cáo doanh số tháng này không?",
  intentId: "intent-1",
  addressedModuleInstallationId: "mi-sales",
  addressedModuleKey: "sales",
  answersQuestionId: null,
  occurredAt: "2026-09-24T09:14:00Z",
};

const MODULE_MESSAGE: CollabMessageView = {
  ...MESSAGE,
  messageId: "msg-2",
  authorKind: "module",
  authorMemberId: null,
  authorModuleInstallationId: "mi-sales",
  body: "Đã giữ một hành động trong nhiệm vụ T-104 và cần phê duyệt.",
  intentId: "intent-2",
  addressedModuleInstallationId: null,
  addressedModuleKey: null,
  occurredAt: "2026-09-24T10:24:00Z",
};

const BINDING: CollabBindingView = {
  bindingId: "bind-1",
  workspaceId: "ws-1",
  groupId: "grp-1",
  sourceMessageId: "msg-1",
  intentId: "intent-1",
  receiverModuleInstallationId: "mi-sales",
  receiverModuleKey: "sales",
  commandName: "build-sales-report",
  commandVersion: "1",
  askerMemberId: "mem-an",
  routingRuleId: null,
  status: "admitted",
  receipt: { disposition: "not-yet-reported" },
};

const WAITING_APPROVAL: CollabApprovalView = {
  approvalId: "appr-1",
  workspaceId: "ws-1",
  groupId: "grp-1",
  taskId: "550e8400-e29b-41d4-a716-446655440000",
  action: "Gửi báo cáo doanh số cho đối tác",
  consequence: "Báo cáo sẽ rời khỏi công ty. Kiểm tra người nhận và nội dung trước khi quyết định.",
  heldActionKey: "sales.send-report",
  requiredRole: "manager-or-owner",
  status: "waiting",
  decidedByMemberId: null,
  decision: null,
  decidedAt: null,
  releaseIntentId: null,
  cardMessageId: "msg-2",
};

const QUESTION: CollabTaskQuestionView = {
  questionId: "q-1",
  workspaceId: "ws-1",
  taskId: "task-q",
  moduleInstallationId: "mi-sales",
  body: "Bạn muốn báo cáo theo tuần hay theo tháng?",
  status: "open",
  answerMessageId: null,
  askedAt: "2026-09-24T10:20:00Z",
  answeredAt: null,
};

const TASK_WAITING_APPROVAL: CollabTaskView = {
  taskId: "550e8400-e29b-41d4-a716-446655440000",
  workspaceId: "ws-1",
  groupId: "grp-1",
  bindingId: "bind-1",
  cardMessageId: "msg-2",
  intentId: "intent-1",
  statement: "Tổng hợp doanh số tuần này",
  owningModuleInstallationId: "mi-sales",
  owningModuleKey: "sales",
  owningModuleDisplayName: "Sales",
  askedByMemberId: "mem-an",
  askedByDisplayName: "An Nguyen",
  assignedToMemberId: "mem-minh",
  assignedToDisplayName: "Minh",
  routingRuleId: null,
  status: "waiting-on-approval",
  version: 3,
  waiting: { kind: "approval", approval: WAITING_APPROVAL },
  outcome: null,
  createdAt: "2026-09-24T09:15:00Z",
  updatedAt: "2026-09-24T10:24:00Z",
};

const TASK_WAITING_ANSWER: CollabTaskView = {
  ...TASK_WAITING_APPROVAL,
  taskId: "task-q",
  cardMessageId: "msg-1",
  status: "waiting-on-answer",
  waiting: { kind: "answer", question: QUESTION },
};

const NOTICE: CollabTurnNoticeItem = {
  notice: {
    noticeId: "ntc-1",
    workspaceId: "ws-1",
    groupId: "grp-1",
    recipientMemberId: "mem-an",
    turnKind: "approval",
    taskId: TASK_WAITING_APPROVAL.taskId,
    approvalId: "appr-1",
    turnIdentity: "turn-1",
    status: "delivered",
    intentKey: "key-1",
    raisedAt: "2026-09-24T10:24:00Z",
    deliveredAt: "2026-09-24T10:24:30Z",
    resolvedAt: null,
    retiredAt: null,
  },
  turn: { state: "open", handledByMemberId: null, decision: null, handledAt: null },
  target: { groupId: "grp-1", taskId: TASK_WAITING_APPROVAL.taskId, approvalId: "appr-1", cardMessageId: "msg-2" },
};

const labels: GroupChatPageLabels = {
  title: "Office",
  description: "Trao đổi, phối hợp và cập nhật công việc của Workspace.",
  tabListLabel: "Chuyển giữa Office và Tasks",
  tabs: { office: "Office", tasks: "Tasks" },
  roles: { owner: "Owner", manager: "Manager", staff: "Staff" },
  statuses: {
    created: "Mới tạo",
    working: "Đang làm",
    "waiting-on-answer": "Chờ thông tin",
    "waiting-on-approval": "Chờ phê duyệt",
    done: "Hoàn thành",
    rejected: "Bị từ chối",
    cancelled: "Đã hủy",
  },
  state: {
    loading: "Đang tải Office…",
    retry: "Thử lại",
    readFailedTitle: "Không đọc được Office. Thử lại.",
    deniedTitle: "Office không khả dụng",
    deniedBody: "Bạn không phải thành viên hiện tại của Workspace này.",
    backOverview: "Về Tổng quan",
  },
  members: {
    title: "Thành viên trong Workspace",
    humans: (count) => `Con người (${count})`,
    modules: (count) => `Module đã thuê (${count})`,
    empty: "Chưa có thành viên nào.",
    pending: "Lời mời đang chờ",
    noModules: "Chưa có module nào được thuê.",
    moduleRole: "Module",
    openRail: (count) => `${count} thành viên`,
    closeRail: "Đóng danh sách thành viên",
  },
  invite: {
    title: "Mời thành viên",
    email: "Email",
    emailPlaceholder: "ten@congty.vn",
    role: "Vai trò",
    hint: "Người được mời chỉ tham gia sau khi đăng nhập bằng email đã xác minh.",
    submit: "Gửi lời mời",
    sent: (email) => `Đã ghi nhận lời mời tới ${email}.`,
    existing: "Email này đã có lời mời hoặc đã là thành viên.",
    refused: "Không gửi được lời mời.",
  },
  conversation: {
    label: "Nội dung cuộc trò chuyện",
    empty: "Chưa có tin nhắn nào.",
    unknownAuthor: "Thành viên",
  },
  composer: {
    label: "Tin nhắn",
    placeholder: "Nhập tin nhắn…",
    send: "Gửi",
    failed: "Tin nhắn chưa chắc đã được ghi. Kiểm tra rồi gửi lại.",
    retry: "Kiểm tra và gửi lại",
    denied: "Bạn không còn quyền gửi trong Office này.",
    answering: (moduleName, excerpt) => `Đang trả lời ${moduleName}: ${excerpt}`,
    cancelAnswer: "Hủy trả lời",
  },
  card: {
    receiptReported: "Module đã báo cáo",
    receiptPending: "Chưa có báo cáo",
    receiptRefused: "Module từ chối",
    reference: (ref, moduleName) => `${ref} • ${moduleName}`,
    requestedBy: (name) => `Người yêu cầu: ${name}`,
    assignedTo: (name) => `Người được giao: ${name}`,
  },
  approval: {
    needed: "Cần phê duyệt",
    waiting: "Đang chờ quyết định",
    deciderHint: "Chỉ Owner hoặc Manager được quyết định",
    approve: "Phê duyệt",
    reject: "Từ chối",
    decidedBy: (name, at) => `${name} đã quyết định lúc ${at}`,
    withdrawn: "Hành động đã được rút lại",
    uncertain: "Chưa xác nhận được quyết định — giữ nguyên trạng thái chờ.",
    denied: "Quyết định này cần quyền Owner hoặc Manager.",
  },
  question: {
    waiting: (name) => `Đang chờ ${name} trả lời`,
    answer: "Trả lời",
  },
  notice: {
    title: "Cần bạn xử lý",
    taskAssign: () => "Một việc mới được giao cho bạn",
    approval: "Một hành động đang chờ bạn quyết định",
    open: "Mở",
    handled: "Đã xử lý",
    unavailable: "Không còn khả dụng",
  },
  tasks: {
    title: "Công việc trong Office",
    count: (count) => `${count} công việc`,
    filterPerson: "Người",
    filterModule: "Mô-đun",
    filterStatus: "Trạng thái",
    filterAll: "Tất cả",
    filterHint: "Bộ lọc chỉ thay đổi danh sách hiển thị.",
    empty: "Không có công việc nào khớp bộ lọc.",
    invalidFilter: "Giá trị lọc không còn hợp lệ trong Workspace này.",
    failed: "Chưa đọc được danh sách công việc.",
    denied: "Bạn không còn quyền xem công việc của Workspace này.",
    openInOffice: "Mở trong Office",
    asker: (name) => `Người yêu cầu: ${name}`,
    assignee: (name) => `Người được giao: ${name}`,
    module: (name) => `Mô-đun: ${name}`,
  },
  accept: {
    title: "Lời mời vào Workspace",
    body: "Bạn được mời tham gia Office của Workspace này.",
    roleLine: (role) => `Vai trò được mời: ${role}`,
    action: "Chấp nhận lời mời",
    refused: "Lời mời không còn hiệu lực hoặc email đăng nhập chưa khớp.",
    invalidLink: "Liên kết lời mời thiếu thông tin workspace.",
  },
  formatTime: () => "09:14",
};

const baseView = (patch: Partial<GroupChatPageView> = {}): GroupChatPageView => ({
  screen: "office",
  officeState: "ready",
  tab: "office",
  workspaceName: "Workspace Support",
  viewer: OWNER,
  participants: PARTICIPANTS,
  items: [],
  composer: { value: "", pending: false, failure: null, answering: null },
  invite: { email: "", role: "staff", pending: false, outcome: null, invitedEmail: null },
  tasks: { state: "ready", rows: [], filter: {} },
  notices: [],
  noticeOutcomes: {},
  pressingApprovalId: null,
  settledApprovals: {},
  approvalNotices: {},
  acceptance: null,
  ...patch,
});

const actions = (): GroupChatPageActions & Record<keyof GroupChatPageActions, ReturnType<typeof vi.fn>> => {
  const calls = {
    changeRailOpen: vi.fn(),
    selectTab: vi.fn(),
    changeComposer: vi.fn(),
    sendMessage: vi.fn(),
    retrySend: vi.fn(),
    retryOffice: vi.fn(),
    retryTasks: vi.fn(),
    changeInviteEmail: vi.fn(),
    changeInviteRole: vi.fn(),
    submitInvite: vi.fn(),
    acceptInvitation: vi.fn(),
    pressApproval: vi.fn(),
    answerQuestion: vi.fn(),
    cancelAnswer: vi.fn(),
    changeTasksFilter: vi.fn(),
    openNotice: vi.fn(),
    openTaskCard: vi.fn(),
    leaveOffice: vi.fn(),
  };
  return calls as GroupChatPageActions & Record<keyof GroupChatPageActions, ReturnType<typeof vi.fn>>;
};

describe("GroupChatPageBase", () => {
  beforeAll(() => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia;
  });

  it("renders the authorized Office snapshot: roster, modules, conversation and a working composer", () => {
    const on = actions();
    const view = baseView({
      items: buildConversationItems({
        messages: [MESSAGE, MODULE_MESSAGE],
        cards: [],
        tasks: [],
        participants: PARTICIPANTS,
        viewerMemberId: OWNER.memberId,
        unknownAuthor: labels.conversation.unknownAuthor,
      }),
    });
    render(<GroupChatPageBase isRailOpen={false} view={view} on={on} labels={labels} />);
    expect(screen.getByRole("tab", { name: "Office" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Tasks" })).toBeInTheDocument();
    expect(screen.getAllByText("An Nguyen").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sales").length).toBeGreaterThan(0);
    expect(screen.getByText("Bạn có thể gửi giúp mình báo cáo doanh số tháng này không?")).toBeInTheDocument();
    expect(screen.getByText("@sales")).toBeInTheDocument();
    const composer = screen.getByRole("textbox", { name: "Tin nhắn" });
    expect(composer).toBeEnabled();
    fireEvent.change(composer, { target: { value: "Chào cả nhóm" } });
    expect(on.changeComposer).toHaveBeenCalledWith("Chào cả nhóm");
  });

  it("gates the invite form on the server-derived viewer role", () => {
    const on = actions();
    const ownerView = baseView();
    const { rerender } = render(<GroupChatPageBase isRailOpen={false} view={ownerView} on={on} labels={labels} />);
    const email = screen.getByRole("textbox", { name: "Email" });
    fireEvent.change(email, { target: { value: "mai@congty.vn" } });
    expect(on.changeInviteEmail).toHaveBeenCalledWith("mai@congty.vn");
    fireEvent.click(screen.getByRole("radio", { name: "Manager" }));
    expect(on.changeInviteRole).toHaveBeenCalledWith("manager");

    rerender(<GroupChatPageBase isRailOpen={false} view={baseView({ viewer: STAFF })} on={on} labels={labels} />);
    expect(screen.queryByRole("textbox", { name: "Email" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Gửi lời mời" })).toBeNull();
  });

  it("shows invite outcomes without disclosing beyond the authorized answer", () => {
    const on = actions();
    render(
      <GroupChatPageBase
        isRailOpen={false}
        view={baseView({ invite: { email: "", role: "staff", pending: false, outcome: "created", invitedEmail: "mai@congty.vn" } })}
        on={on}
        labels={labels}
      />,
    );
    expect(screen.getByText("Đã ghi nhận lời mời tới mai@congty.vn.")).toBeInTheDocument();
  });

  it("renders a waiting approval card with exactly two eligible actions for an Owner", () => {
    const on = actions();
    const view = baseView({
      items: buildConversationItems({
        messages: [MESSAGE, MODULE_MESSAGE],
        cards: [BINDING],
        tasks: [TASK_WAITING_APPROVAL],
        participants: PARTICIPANTS,
        viewerMemberId: OWNER.memberId,
        unknownAuthor: labels.conversation.unknownAuthor,
      }),
    });
    render(<GroupChatPageBase isRailOpen={false} view={view} on={on} labels={labels} />);
    expect(screen.getByText("Cần phê duyệt")).toBeInTheDocument();
    expect(screen.getByText("Đang chờ quyết định")).toBeInTheDocument();
    expect(screen.getByText("Gửi báo cáo doanh số cho đối tác")).toBeInTheDocument();
    const approve = screen.getByRole("button", { name: "Phê duyệt" });
    const reject = screen.getByRole("button", { name: "Từ chối" });
    expect(approve).toBeEnabled();
    expect(reject).toBeEnabled();
    fireEvent.click(approve);
    expect(on.pressApproval).toHaveBeenCalledWith("appr-1", "approve");
  });

  it("keeps a waiting card readable but inactive for Staff with the decider statement", () => {
    const on = actions();
    const view = baseView({
      viewer: STAFF,
      items: buildConversationItems({
        messages: [MODULE_MESSAGE],
        cards: [],
        tasks: [TASK_WAITING_APPROVAL],
        participants: PARTICIPANTS,
        viewerMemberId: STAFF.memberId,
        unknownAuthor: labels.conversation.unknownAuthor,
      }),
    });
    render(<GroupChatPageBase isRailOpen={false} view={view} on={on} labels={labels} />);
    expect(screen.getByText("Chỉ Owner hoặc Manager được quyết định")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Phê duyệt" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Từ chối" })).toBeDisabled();
  });

  it("renders a settled decision and removes the actions", () => {
    const on = actions();
    const view = baseView({
      settledApprovals: {
        "appr-1": { ...WAITING_APPROVAL, status: "approved", decision: "approve", decidedByMemberId: "mem-an", decidedByDisplayName: "An Nguyen", decidedByRole: "owner", decidedAt: "2026-09-24T10:31:00Z", buttons: ["approve", "reject"] },
      },
      items: buildConversationItems({
        messages: [MODULE_MESSAGE],
        cards: [],
        tasks: [{ ...TASK_WAITING_APPROVAL, waiting: { kind: "approval", approval: { ...WAITING_APPROVAL, status: "approved" } } }],
        participants: PARTICIPANTS,
        viewerMemberId: OWNER.memberId,
        unknownAuthor: labels.conversation.unknownAuthor,
      }),
    });
    render(<GroupChatPageBase isRailOpen={false} view={view} on={on} labels={labels} />);
    expect(screen.getByText("An Nguyen đã quyết định lúc 09:14")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Phê duyệt" })).toBeNull();
  });

  it("shows a waiting question with the assignee's answer affordance only", () => {
    const on = actions();
    const items = buildConversationItems({
      messages: [MESSAGE],
      cards: [],
      tasks: [TASK_WAITING_ANSWER],
      participants: PARTICIPANTS,
      viewerMemberId: OWNER.memberId,
      unknownAuthor: labels.conversation.unknownAuthor,
    });
    const { rerender } = render(<GroupChatPageBase isRailOpen={false} view={baseView({ items })} on={on} labels={labels} />);
    expect(screen.getByText("Bạn muốn báo cáo theo tuần hay theo tháng?")).toBeInTheDocument();
    expect(screen.getByText("Đang chờ Minh trả lời")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Trả lời" })).toBeNull();

    const managerViewer: CollabOfficeViewer = { memberId: "mem-minh", role: "manager" };
    rerender(<GroupChatPageBase isRailOpen={false} view={baseView({ viewer: managerViewer, items })} on={on} labels={labels} />);
    const answer = screen.getByRole("button", { name: "Trả lời" });
    fireEvent.click(answer);
    expect(on.answerQuestion).toHaveBeenCalledWith(TASK_WAITING_ANSWER, QUESTION);
  });

  it("lists outstanding notices and follows one to its card", () => {
    const on = actions();
    render(<GroupChatPageBase isRailOpen={false} view={baseView({ notices: [NOTICE] })} on={on} labels={labels} />);
    fireEvent.click(screen.getByRole("button", { name: "Mở" }));
    expect(on.openNotice).toHaveBeenCalledWith("ntc-1");
  });

  it("marks a handled notice without offering a stale action", () => {
    const on = actions();
    render(
      <GroupChatPageBase
        isRailOpen={false}
        view={baseView({ notices: [NOTICE], noticeOutcomes: { "ntc-1": "handled" } })}
        on={on}
        labels={labels} />,
    );
    expect(screen.getByText("Đã xử lý")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mở" })).toBeNull();
  });

  it("renders the Tasks tab with roster-keyed filters and Office-bound rows", () => {
    const on = actions();
    const view = baseView({ tab: "tasks", tasks: { state: "ready", rows: [TASK_WAITING_APPROVAL], filter: {} } });
    render(<GroupChatPageBase isRailOpen={false} view={view} on={on} labels={labels} />);
    const person = screen.getByRole("combobox", { name: "Người" });
    const moduleSelect = screen.getByRole("combobox", { name: "Mô-đun" });
    expect(person).toBeInTheDocument();
    fireEvent.change(person, { target: { value: "mem-minh" } });
    expect(on.changeTasksFilter).toHaveBeenCalledWith({ personMemberId: "mem-minh" });
    fireEvent.change(moduleSelect, { target: { value: "mi-sales" } });
    expect(on.changeTasksFilter).toHaveBeenCalledWith({ moduleInstallationId: "mi-sales" });
    expect(screen.getByText("T-550E")).toBeInTheDocument();
    expect(screen.getByText("Tổng hợp doanh số tuần này")).toBeInTheDocument();
    expect(screen.getAllByText("Chờ phê duyệt").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Mở trong Office" }));
    expect(on.openTaskCard).toHaveBeenCalledWith(TASK_WAITING_APPROVAL.taskId);
  });

  it("explains an invalid filter against the current roster instead of leaking another workspace", () => {
    const on = actions();
    const view = baseView({ tab: "tasks", tasks: { state: "ready", rows: [], filter: { personMemberId: "mem-gone" } } });
    render(<GroupChatPageBase isRailOpen={false} view={view} on={on} labels={labels} />);
    expect(screen.getByText("Giá trị lọc không còn hợp lệ trong Workspace này.")).toBeInTheDocument();
  });

  it("withholds every Office fact on denial and offers a safe return", () => {
    const on = actions();
    render(<GroupChatPageBase isRailOpen={false} view={baseView({ officeState: "denied" })} on={on} labels={labels} />);
    expect(screen.getByText("Office không khả dụng")).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Tin nhắn" })).toBeNull();
    expect(screen.queryByText("An Nguyen")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Về Tổng quan" }));
    expect(on.leaveOffice).toHaveBeenCalled();
  });

  it("marks read failure as stale with an explicit retry", () => {
    const on = actions();
    render(<GroupChatPageBase isRailOpen={false} view={baseView({ officeState: "failed" })} on={on} labels={labels} />);
    fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(on.retryOffice).toHaveBeenCalled();
  });

  it("keeps a failed send's draft and offers the reconcile-and-retry path", () => {
    const on = actions();
    render(
      <GroupChatPageBase
        isRailOpen={false}
        view={baseView({ composer: { value: "@Sales báo cáo", pending: false, failure: "retry", answering: null } })}
        on={on}
        labels={labels} />,
    );
    expect(screen.getByText("Tin nhắn chưa chắc đã được ghi. Kiểm tra rồi gửi lại.")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Tin nhắn" })).toHaveValue("@Sales báo cáo");
    fireEvent.click(screen.getByRole("button", { name: "Kiểm tra và gửi lại" }));
    expect(on.retrySend).toHaveBeenCalled();
  });

  it("renders the invitation acceptance surface without Office content", () => {
    const on = actions();
    const view = baseView({
      screen: "acceptance",
      acceptance: { state: "ready", roleHint: "staff", invalidLink: false },
    });
    render(<GroupChatPageBase isRailOpen={false} view={view} on={on} labels={labels} />);
    expect(screen.getByText("Lời mời vào Workspace")).toBeInTheDocument();
    expect(screen.getByText("Vai trò được mời: Staff")).toBeInTheDocument();
    expect(screen.queryByRole("tab")).toBeNull();
    expect(screen.queryByRole("textbox", { name: "Tin nhắn" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Chấp nhận lời mời" }));
    expect(on.acceptInvitation).toHaveBeenCalled();
  });

  it("shows a non-disclosing refusal for an unentitled acceptance", () => {
    const on = actions();
    render(
      <GroupChatPageBase
        isRailOpen={false}
        view={baseView({ screen: "acceptance", acceptance: { state: "refused", roleHint: null, invalidLink: false } })}
        on={on}
        labels={labels} />,
    );
    expect(screen.getByText("Lời mời không còn hiệu lực hoặc email đăng nhập chưa khớp.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Chấp nhận lời mời" })).toBeDisabled();
  });

  it("says plainly when no module is hired while human chat stays usable", () => {
    const on = actions();
    render(
      <GroupChatPageBase
        isRailOpen={false}
        view={baseView({ participants: PARTICIPANTS.filter((p) => p.kind === "human") })}
        on={on}
        labels={labels} />,
    );
    expect(screen.getByText("Chưa có module nào được thuê.")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Tin nhắn" })).toBeEnabled();
  });
});

describe("component", () => {
  it("parses a leading @address for routing without touching the body", () => {
    expect(parseAddressedModule("@Sales gửi báo cáo")).toBe("Sales");
    expect(parseAddressedModule("  @Accounting xong chưa")).toBe("Accounting");
    expect(parseAddressedModule("Chào cả nhóm")).toBeNull();
    expect(parseAddressedModule("")).toBeNull();
  });

  it("gates invite and decision on the server-derived role only", () => {
    expect(mayPresentInvite(OWNER)).toBe(true);
    expect(mayPresentInvite({ memberId: "m", role: "manager" })).toBe(true);
    expect(mayPresentInvite(STAFF)).toBe(false);
    expect(mayPresentInvite(null)).toBe(false);
    expect(mayPresentDecision(OWNER)).toBe(true);
    expect(mayPresentDecision(STAFF)).toBe(false);
    expect(mayPresentDecision(null)).toBe(false);
  });

  it("keeps the task's deterministic short ref identical between card and row", () => {
    expect(shortTaskRef("550e8400-e29b-41d4-a716-446655440000")).toBe("T-550E");
  });

  it("anchors a waiting approval to its card message and appends loose ones last", () => {
    const loose = { ...WAITING_APPROVAL, approvalId: "appr-loose", cardMessageId: "msg-absent" };
    const items = buildConversationItems({
      messages: [MESSAGE, MODULE_MESSAGE],
      cards: [BINDING],
      tasks: [TASK_WAITING_APPROVAL, { ...TASK_WAITING_APPROVAL, taskId: "task-loose", waiting: { kind: "approval", approval: loose } }],
      participants: PARTICIPANTS,
      viewerMemberId: null,
      unknownAuthor: "?",
    });
    const kinds = items.map((item) => item.kind);
    expect(kinds).toEqual(["message", "task-card", "message", "approval-card", "approval-card"]);
    const last = items[items.length - 1];
    expect(last.kind === "approval-card" && last.approval.approvalId === "appr-loose").toBe(true);
  });

  it("flags only filters whose identity left the current roster", () => {
    expect(invalidTasksFilter({}, PARTICIPANTS)).toBeNull();
    expect(invalidTasksFilter({ personMemberId: "mem-minh" }, PARTICIPANTS)).toBeNull();
    expect(invalidTasksFilter({ personMemberId: "mem-gone" }, PARTICIPANTS)).toBe("person");
    expect(invalidTasksFilter({ moduleInstallationId: "mi-sales" }, PARTICIPANTS)).toBeNull();
    expect(invalidTasksFilter({ moduleInstallationId: "mi-gone" }, PARTICIPANTS)).toBe("module");
  });
});
