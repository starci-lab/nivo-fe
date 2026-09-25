"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSession } from "@/modules/auth/session";
import type {
  CollabApprovalCardView,
  CollabApprovalDecision,
  CollabHumanRole,
} from "@/modules/api/collab";
import {
  useCollabLive,
  useCollabOfficeTransport,
  useMutateCollabAcceptInvitationSwr,
  useMutateCollabInviteByEmailSwr,
  useMutateCollabPostMessageSwr,
  useMutateCollabPressApprovalSwr,
  useQueryCollabGroupSwr,
  useQueryCollabNoticeSwr,
  useQueryCollabNoticesSwr,
  useQueryCollabOfficeSwr,
  useQueryCollabTasksSwr,
  useQueryMyAgentWorkspacesSwr,
  type CollabTasksFilter,
} from "@/hooks";
import {
  buildConversationItems,
  GroupChatPageBase,
  parseAddressedModule,
  parseRoleHint,
  type GroupChatPageLabels,
  type GroupChatTab,
  type GroupChatPageView,
} from "./component";

/** This page resolves its workspace from the session, the route query, or an invitation link. */
export type GroupChatPageProps = Record<string, never>;

/**
 * The same 48rem edge ChatWorkspace's installed compact rail presentation reads
 * (`compactRailQuery` in @starci/grammar). Below it the surface keeps the peer
 * tabs and the member chip on one chrome row and presents the member content as
 * a bottom sheet instead of the right-edge drawer.
 */
const COMPACT_MEMBER_QUERY = "(max-width: 47.999rem)";

const subscribeToCompactMember = (onStoreChange: () => void): (() => void) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  const query = window.matchMedia(COMPACT_MEMBER_QUERY);
  query.addEventListener("change", onStoreChange);
  return () => query.removeEventListener("change", onStoreChange);
};
const getCompactMemberSnapshot = (): boolean =>
  typeof window !== "undefined" && window.matchMedia(COMPACT_MEMBER_QUERY).matches;
const getCompactMemberServerSnapshot = (): boolean => false;

const newIntentId = (): string =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `intent-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const scrollToElement = (id: string) => {
  if (typeof document === "undefined") {
    return;
  }
  const node = document.getElementById(id);
  node?.scrollIntoView({ block: "center" });
};

/**
 * Connect the Office/Tasks surface to the session, the workspace-scoped Collab
 * reads and commands, and the live hint channel. Nothing here invents
 * authority: reads are the only content source, the server-derived viewer only
 * gates presentation, and every command answer re-reads the cached domains.
 */
export const GroupChatPage = (props: GroupChatPageProps) => {
  void props;
  const t = useTranslations("console.groupChat");
  const locale = useLocale();
  const session = useSession();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  /*
   * The Collab refusal language follows the page locale; the transport seam binds
   * the reader here the same way session.tsx binds the shared transport's.
   */
  const { reconcileRequest } = useCollabOfficeTransport(locale);

  /* ---------------- Route inputs ---------------- */
  const invitationId = searchParams.get("invitation");
  const workspaceParam = searchParams.get("workspace");
  const roleHint = parseRoleHint(searchParams.get("role"));
  const viewParam = searchParams.get("view");
  const tab: GroupChatTab = viewParam === "tasks" ? "tasks" : "office";

  /* ---------------- Workspace resolution ---------------- */
  const signedIn = session.state.status === "signed-in";
  const accessToken = signedIn ? session.state.accessToken : null;
  const workspaces = useQueryMyAgentWorkspacesSwr(signedIn && invitationId === null);
  const ownedWorkspaceId =
    workspaces.data?.ok === true ? (workspaces.data.data[0]?.id ?? null) : null;
  const workspaceId = workspaceParam ?? ownedWorkspaceId;
  const workspaceListed =
    workspaces.data?.ok === true
      ? (workspaces.data.data.find((workspace) => workspace.id === workspaceId)?.name ?? null)
      : null;

  /*
   * INVITATION MODE WITHHOLDS OFFICE. While `?invitation=` is present the page
   * mounts no Office read at all: a non-member's read would be denied anyway,
   * and a member who followed an invite link re-opens Office through a fresh
   * authorized read after acceptance (`ui.collab.office` invite-accept-*).
   */
  const acceptanceMode = invitationId !== null;
  const officeScope = acceptanceMode ? null : workspaceId;

  /* ---------------- Local UI state ---------------- */
  const [isRailOpen, setRailOpen] = useState(false);
  const [composerValue, setComposerValue] = useState("");
  const [answering, setAnswering] = useState<GroupChatPageView["composer"]["answering"]>(null);
  const [sendFailure, setSendFailure] = useState<"retry" | "denied" | null>(null);
  const intentRef = useRef<string>(newIntentId());
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<CollabHumanRole>("staff");
  const [inviteOutcome, setInviteOutcome] = useState<{ kind: "created" | "existing" | "refused"; email: string | null } | null>(null);
  const [tasksFilter, setTasksFilter] = useState<CollabTasksFilter>({});
  const [pressingApprovalId, setPressingApprovalId] = useState<string | null>(null);
  const [settledApprovals, setSettledApprovals] = useState<Readonly<Record<string, CollabApprovalCardView>>>({});
  const [pendingNoticeId, setPendingNoticeId] = useState<string | null>(null);
  const [noticeOutcomes, setNoticeOutcomes] = useState<Readonly<Record<string, "handled" | "ended" | "unavailable">>>({});
  const handledNoticeRef = useRef<string | null>(null);
  const [acceptanceState, setAcceptanceState] = useState<"ready" | "pending" | "refused">("ready");
  const [approvalNotices, setApprovalNotices] = useState<Readonly<Record<string, "denied" | "uncertain">>>({});

  const office = useQueryCollabOfficeSwr(officeScope);
  const officeView = office.data?.ok === true ? office.data.data : null;
  const officeReady = officeView !== null;

  const group = useQueryCollabGroupSwr(officeReady ? workspaceId : null);
  const tasks = useQueryCollabTasksSwr(officeReady ? workspaceId : null, tab === "tasks" ? tasksFilter : undefined);
  const notices = useQueryCollabNoticesSwr(officeReady ? workspaceId : null);
  useCollabLive(officeReady ? workspaceId : null);

  const postMessage = useMutateCollabPostMessageSwr(workspaceId);
  const pressApproval = useMutateCollabPressApprovalSwr(workspaceId);
  const inviteByEmail = useMutateCollabInviteByEmailSwr(workspaceId);
  const acceptInvitation = useMutateCollabAcceptInvitationSwr(workspaceId);
  const notice = useQueryCollabNoticeSwr(workspaceId, pendingNoticeId);

  const selectTab = useCallback(
    (next: GroupChatTab) => {
      const query = new URLSearchParams(searchParams.toString());
      if (next === "office") {
        query.delete("view");
      } else {
        query.set("view", next);
      }
      const text = query.toString();
      router.replace(text.length === 0 ? pathname : `${pathname}?${text}`);
    },
    [searchParams, router, pathname],
  );

  /* ---------------- Notice follow ---------------- */
  useEffect(() => {
    if (pendingNoticeId === null || notice.data === undefined || handledNoticeRef.current === pendingNoticeId) {
      return;
    }
    const answer = notice.data;
    if (!answer.ok) {
      handledNoticeRef.current = pendingNoticeId;
      setNoticeOutcomes((current) => ({ ...current, [pendingNoticeId]: "unavailable" }));
      setPendingNoticeId(null);
      return;
    }
    const data = answer.data as { outcome?: string; target?: { approvalId: string | null; taskId: string | null; cardMessageId: string | null } };
    const outcome = data.outcome;
    handledNoticeRef.current = pendingNoticeId;
    if (outcome === "open" && data.target !== undefined) {
      const target = data.target;
      const elementId =
        target.approvalId !== null
          ? `collab-approval-${target.approvalId}`
          : target.taskId !== null
            ? `collab-task-${target.taskId}`
            : target.cardMessageId !== null
              ? `collab-msg-${target.cardMessageId}`
              : null;
      handledNoticeRef.current = pendingNoticeId;
      setPendingNoticeId(null);
      if (elementId !== null) {
        if (tab !== "office") {
          selectTab("office");
        }
        window.setTimeout(() => scrollToElement(elementId), 50);
      }
      return;
    }
    setNoticeOutcomes((current) => ({
      ...current,
      [pendingNoticeId]: outcome === "handled" || outcome === "ended" ? outcome : "unavailable",
    }));
    setPendingNoticeId(null);
  }, [pendingNoticeId, notice.data, selectTab, tab]);

  /* ---------------- Actions ---------------- */
  const sendMessage = async (): Promise<void> => {
    if (composerValue.trim().length === 0 || workspaceId === null) {
      return;
    }
    const moduleName = parseAddressedModule(composerValue);
    setSendFailure(null);
    // The mutation layer's revalidation wrapper types its answer as
    // CollabResult<unknown>; the wire value is still the op's own outcome.
    const answer = await postMessage.trigger({
      intentId: intentRef.current,
      body: composerValue,
      ...(moduleName !== null ? { moduleName } : {}),
      ...(answering !== null ? { answersQuestionId: answering.questionId } : {}),
    });
    if (answer.ok) {
      setComposerValue("");
      setAnswering(null);
      intentRef.current = newIntentId();
      return;
    }
    setSendFailure(answer.retryable ? "retry" : "denied");
  };

  /*
   * A retry of a lost answer reconciles the SAME intent first: a matched intent
   * proves the message committed and is never resent (`contract.collab.chat`).
   */
  const retrySend = async (): Promise<void> => {
    if (workspaceId === null || accessToken === null) {
      return;
    }
    const reconciliation = await reconcileRequest({
      workspaceId,
      accessToken,
      intentId: intentRef.current,
    });
    if (reconciliation.ok && reconciliation.data.outcome === "matched") {
      setComposerValue("");
      setAnswering(null);
      setSendFailure(null);
      intentRef.current = newIntentId();
      return;
    }
    await sendMessage();
  };

  const submitInvite = async (): Promise<void> => {
    if (inviteEmail.trim().length === 0) {
      return;
    }
    const answer = await inviteByEmail.trigger({ email: inviteEmail, role: inviteRole });
    const outcome = answer.ok ? (answer.data as { outcome?: string } | undefined)?.outcome : undefined;
    if (answer.ok && (outcome === "created" || outcome === "existing")) {
      setInviteOutcome({ kind: outcome === "created" ? "created" : "existing", email: inviteEmail });
      if (outcome === "created") {
        setInviteEmail("");
      }
      return;
    }
    setInviteOutcome({ kind: "refused", email: null });
  };

  const onPressApproval = async (approvalId: string, button: CollabApprovalDecision): Promise<void> => {
    setPressingApprovalId(approvalId);
    setApprovalNotices((current) => {
      const next = { ...current };
      delete next[approvalId];
      return next;
    });
    try {
      const answer = await pressApproval.trigger({ approvalId, button });
      const pressOutcome = answer.ok ? (answer.data as { card?: CollabApprovalCardView } | undefined) : undefined;
      if (pressOutcome?.card !== undefined) {
        setSettledApprovals((current) => ({ ...current, [approvalId]: pressOutcome.card as CollabApprovalCardView }));
        return;
      }
      if (answer.ok) {
        return;
      }
      /*
       * A denied press (stale role, wrong member) keeps the card waiting and says
       * so; a lost or malformed answer stays visibly uncertain until the
       * revalidated read proves the card's state - never a speculative approval.
       */
      if (!answer.ok) {
        setApprovalNotices((current) => ({
          ...current,
          [approvalId]: answer.kind === "denied" ? "denied" : "uncertain",
        }));
      }
    } finally {
      setPressingApprovalId(null);
    }
  };

  const acceptInvite = async (): Promise<void> => {
    if (invitationId === null || workspaceId === null) {
      return;
    }
    setAcceptanceState("pending");
    const answer = await acceptInvitation.trigger({ invitationId });
    if (answer.ok) {
      const query = new URLSearchParams(searchParams.toString());
      query.delete("invitation");
      query.delete("role");
      query.set("workspace", workspaceId);
      router.replace(`${pathname}?${query.toString()}`);
      setAcceptanceState("ready");
      return;
    }
    setAcceptanceState("refused");
  };

  const openTaskCard = (taskId: string) => {
    if (tab !== "office") {
      selectTab("office");
    }
    window.setTimeout(() => scrollToElement(`collab-task-${taskId}`), 50);
  };

  /* ---------------- View assembly ---------------- */
  const officeDenied =
    office.data?.ok === false && office.data.kind === "denied";
  const readsDenied =
    (group.data?.ok === false && group.data.kind === "denied") ||
    (tasks.data?.ok === false && tasks.data.kind === "denied");
  const officeState: GroupChatPageView["officeState"] = acceptanceMode
    ? "ready"
    : !signedIn
      ? session.state.status === "restoring"
        ? "loading"
        : "denied"
      : workspaceId === null
        ? workspaces.data === undefined
          ? "loading"
          : "denied"
        : officeDenied || readsDenied
          ? "denied"
          : office.data === undefined && office.error === undefined
            ? "loading"
            : office.data === undefined || office.error !== undefined
              ? "failed"
              : office.data.ok === false
                ? "failed"
                : "ready";

  /*
   * The compact member sheet exists only while the Office surface is ready at a
   * compact width; a wider viewport or a dropped read closes it so a stale open
   * flag never reopens it on the next compact pass.
   */
  const compactMembers = useSyncExternalStore(
    subscribeToCompactMember,
    getCompactMemberSnapshot,
    getCompactMemberServerSnapshot,
  );
  useEffect(() => {
    if (isRailOpen && (!compactMembers || officeState !== "ready")) {
      setRailOpen(false);
    }
  }, [compactMembers, isRailOpen, officeState]);

  const tasksState: GroupChatPageView["tasks"]["state"] =
    tasks.data === undefined && tasks.error === undefined
      ? "loading"
      : tasks.data?.ok === false
        ? tasks.data.kind === "denied"
          ? "denied"
          : "failed"
        : tasks.error !== undefined
          ? "failed"
          : "ready";

  const items = useMemo(
    () =>
      buildConversationItems({
        messages: group.data?.ok === true ? group.data.data.messages : [],
        cards: group.data?.ok === true ? group.data.data.cards : [],
        tasks: tasks.data?.ok === true ? tasks.data.data.tasks : [],
        participants: officeView?.participants ?? [],
        viewerMemberId: officeView?.viewer.memberId ?? null,
        unknownAuthor: t("conversation.unknownAuthor"),
      }),
    [group.data, tasks.data, officeView, t],
  );

  const outstandingNotices =
    notices.data?.ok === true
      ? notices.data.data.notices.filter((item) => item.turn.state === "open")
      : [];

  const formatTime = useCallback(
    (iso: string): string => {
      const at = new Date(iso);
      if (Number.isNaN(at.getTime())) {
        return iso;
      }
      return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(at);
    },
    [locale],
  );

  const labels: GroupChatPageLabels = useMemo(
    () => ({
      title: t("title"),
      description: t("description"),
      today: t("today"),
      tabListLabel: t("tabs.label"),
      tabs: { office: t("tabs.office"), tasks: t("tabs.tasks") },
      roles: {
        owner: t("roles.owner"),
        manager: t("roles.manager"),
        staff: t("roles.staff"),
      },
      statuses: {
        created: t("statuses.created"),
        working: t("statuses.working"),
        "waiting-on-answer": t("statuses.waitingOnAnswer"),
        "waiting-on-approval": t("statuses.waitingOnApproval"),
        done: t("statuses.done"),
        rejected: t("statuses.rejected"),
        cancelled: t("statuses.cancelled"),
      },
      state: {
        loading: t("state.loading"),
        retry: t("state.retry"),
        readFailedTitle: t("state.readFailed"),
        deniedTitle: t("state.deniedTitle"),
        deniedBody: t("state.deniedBody"),
        backOverview: t("state.backOverview"),
      },
      members: {
        title: t("members.title"),
        humans: (count) => t("members.humans", { count }),
        modules: (count) => t("members.modules", { count }),
        countLabel: (count) => t("members.countLabel", { count }),
        moduleDescriptions: {
          Sales: t("members.moduleDescriptions.Sales"),
          Accounting: t("members.moduleDescriptions.Accounting"),
          Chatbot: t("members.moduleDescriptions.Chatbot"),
        },
        empty: t("members.empty"),
        pending: t("members.pending"),
        noModules: t("members.noModules"),
        moduleRole: t("members.moduleRole"),
        openRail: (count) => t("members.openRail", { count }),
        closeRail: t("members.closeRail"),
      },
      invite: {
        title: t("invite.title"),
        email: t("invite.email"),
        emailPlaceholder: t("invite.emailPlaceholder"),
        role: t("invite.role"),
        hint: t("invite.hint"),
        submit: t("invite.submit"),
        sent: (email) => t("invite.sent", { email }),
        existing: t("invite.existing"),
        refused: t("invite.refused"),
      },
      conversation: {
        label: t("conversation.label"),
        empty: t("conversation.empty"),
        unknownAuthor: t("conversation.unknownAuthor"),
      },
      composer: {
        label: t("composer.label"),
        placeholder: t("composer.placeholder"),
        send: t("composer.send"),
        failed: t("composer.failed"),
        retry: t("composer.retry"),
        denied: t("composer.denied"),
        answering: (moduleName, excerpt) => t("composer.answering", { moduleName, excerpt }),
        cancelAnswer: t("composer.cancelAnswer"),
      },
      card: {
        receiptReported: t("card.receiptReported"),
        receiptPending: t("card.receiptPending"),
        receiptRefused: t("card.receiptRefused"),
        reference: (ref, moduleName) => t("card.reference", { ref, moduleName }),
        requestedBy: (name) => t("card.requestedBy", { name }),
        assignedTo: (name) => t("card.assignedTo", { name }),
      },
      approval: {
        needed: t("approval.needed"),
        waiting: t("approval.waiting"),
        deciderHint: t("approval.deciderHint"),
        approve: t("approval.approve"),
        reject: t("approval.reject"),
        decidedBy: (name, at) => t("approval.decidedBy", { name, at }),
        withdrawn: t("approval.withdrawn"),
        uncertain: t("approval.uncertain"),
        denied: t("approval.denied"),
      },
      question: {
        waiting: (name) => t("question.waiting", { name }),
        answer: t("question.answer"),
      },
      notice: {
        title: t("notice.title"),
        taskAssign: () => t("notice.taskAssign"),
        approval: t("notice.approval"),
        open: t("notice.open"),
        handled: t("notice.handled"),
        unavailable: t("notice.unavailable"),
      },
      tasks: {
        title: t("tasks.title"),
        count: (count) => t("tasks.count", { count }),
        filterPerson: t("tasks.filterPerson"),
        filterModule: t("tasks.filterModule"),
        filterStatus: t("tasks.filterStatus"),
        filterAll: t("tasks.filterAll"),
        filterHint: t("tasks.filterHint"),
        empty: t("tasks.empty"),
        invalidFilter: t("tasks.invalidFilter"),
        failed: t("tasks.failed"),
        denied: t("tasks.denied"),
        openInOffice: t("tasks.openInOffice"),
        asker: (name) => t("tasks.asker", { name }),
        assignee: (name) => t("tasks.assignee", { name }),
        module: (name) => t("tasks.module", { name }),
      },
      accept: {
        title: t("accept.title"),
        body: t("accept.body"),
        roleLine: (role) => t("accept.roleLine", { role }),
        action: t("accept.action"),
        refused: t("accept.refused"),
        invalidLink: t("accept.invalidLink"),
      },
      formatTime,
    }),
    [t, formatTime],
  );

  const view: GroupChatPageView = {
    screen: acceptanceMode ? "acceptance" : "office",
    officeState,
    tab,
    workspaceName: workspaceListed ?? officeView?.group.name ?? null,
    viewer: officeView?.viewer ?? null,
    participants: officeView?.participants ?? [],
    items,
    composer: {
      value: composerValue,
      pending: postMessage.isMutating,
      failure: sendFailure,
      answering,
    },
    invite: {
      email: inviteEmail,
      role: inviteRole,
      pending: inviteByEmail.isMutating,
      outcome: inviteOutcome?.kind ?? null,
      invitedEmail: inviteOutcome?.email ?? null,
    },
    tasks: {
      state: tasksState,
      rows: tasks.data?.ok === true ? tasks.data.data.tasks : [],
      filter: tasksFilter,
    },
    notices: outstandingNotices,
    noticeOutcomes,
    pressingApprovalId,
    settledApprovals,
    approvalNotices,
    acceptance: acceptanceMode
      ? {
          state: acceptanceState,
          roleHint,
          invalidLink: workspaceId === null,
        }
      : null,
  };

  return (
    <GroupChatPageBase
      isRailOpen={isRailOpen}
      isCompactMembers={compactMembers}
      view={view}
      labels={labels}
      on={{
        changeRailOpen: setRailOpen,
        selectTab,
        changeComposer: setComposerValue,
        sendMessage: () => void sendMessage(),
        retrySend: () => void retrySend(),
        retryOffice: () => void office.mutate(),
        retryTasks: () => void tasks.mutate(),
        changeInviteEmail: setInviteEmail,
        changeInviteRole: setInviteRole,
        submitInvite: () => void submitInvite(),
        acceptInvitation: () => void acceptInvite(),
        pressApproval: (approvalId, button) => void onPressApproval(approvalId, button),
        answerQuestion: (task, question) =>
          setAnswering({
            questionId: question.questionId,
            moduleName: task.owningModuleDisplayName ?? task.owningModuleKey,
            excerpt: question.body.slice(0, 80),
          }),
        cancelAnswer: () => setAnswering(null),
        changeTasksFilter: setTasksFilter,
        openNotice: setPendingNoticeId,
        openTaskCard,
        leaveOffice: () => router.push("/overview"),
      }}
    />
  );
};
