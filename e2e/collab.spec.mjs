/**
 * Collab Office/Tasks — the served-product journey spec (cut collab-fe-surface-r2 3/3).
 *
 * WHAT THIS PROVES, AND HOW. The unit specs own the surface's behavior at the seam;
 * this spec owns the served product: it boots the built @nivo/app production server
 * and a GraphQL fixture that publishes the `contract.collab.chat` rev 5 read shapes,
 * then drives a real headless browser through the four customer journeys
 * (first-open, assign-work, approve-safe-action, tasks-overview) and asserts what the
 * member actually sees and what the boundary actually received.
 *
 * THE FIXTURE IS A STAND-IN, NOT THE BACKEND. It is the same published-shape fixture
 * the implementation's runtime evidence used (`apps/app` bakes
 * `NEXT_PUBLIC_CORE_API_URL`'s default `http://localhost:3068/graphql`, so the fixture
 * answers on that port). Live Socket.IO revalidation stays an unavailable fixture path:
 * the app's reads are authoritative and each accepted command re-reads them, which is
 * exactly what this spec follows - a write is proven by the read that follows it.
 *
 * PORT OWNERSHIP. `node --test e2e/*.spec.mjs` runs the files in parallel and
 * `e2e/smoke.spec.mjs` already reserves `NIVO_FE_E2E_PORT` (default 13067), so this
 * spec takes the next port and mirrors the smoke runner's env contract
 * (`NIVO_FE_E2E_COLLAB_PORT`, `NIVO_FE_E2E_COLLAB_URL` to drive an already-running
 * server).
 */
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP_PORT = process.env.NIVO_FE_E2E_COLLAB_PORT ?? String(Number(process.env.NIVO_FE_E2E_PORT ?? 13067) + 1);
const EXTERNAL_URL = process.env.NIVO_FE_E2E_COLLAB_URL?.replace(/\/$/u, "");
const BASE = EXTERNAL_URL ?? `http://127.0.0.1:${APP_PORT}`;
const GRAPHQL_PORT = Number(process.env.NIVO_FE_E2E_GRAPHQL_PORT ?? 3068);
const OFFICE_PATH = "/vi/chat?workspace=ws-support";

const WORKSPACE_ID = "ws-support";
const GROUP_ID = "grp-office";
const GROUP = { groupId: GROUP_ID, workspaceId: WORKSPACE_ID, name: "Office", isDefaultOffice: true };

const HUMAN_AN = { memberId: "mem-an", kind: "human", displayName: "An Nguyen", role: "owner", status: "active", moduleInstallationId: null };
const HUMAN_MINH = { memberId: "mem-minh", kind: "human", displayName: "Minh", role: "manager", status: "active", moduleInstallationId: null };
const HUMAN_HUY = { memberId: "mem-huy", kind: "human", displayName: "Huy", role: "staff", status: "active", moduleInstallationId: null };
const MODULE_SALES = { memberId: "mem-sales", kind: "module", displayName: "Sales", role: "module", status: "active", moduleInstallationId: "mi-sales" };
const MODULE_ACC = { memberId: "mem-acc", kind: "module", displayName: "Accounting", role: "module", status: "active", moduleInstallationId: "mi-acc" };
const MODULE_BOT = { memberId: "mem-bot", kind: "module", displayName: "Chatbot", role: "module", status: "active", moduleInstallationId: "mi-bot" };
const ROSTER = [HUMAN_AN, HUMAN_MINH, HUMAN_HUY, MODULE_SALES, MODULE_ACC, MODULE_BOT];

const VIEWER_OWNER = { memberId: HUMAN_AN.memberId, role: "owner" };
const VIEWER_STAFF = { memberId: HUMAN_HUY.memberId, role: "staff" };

const TASK_WAIT_ID = "550e8400-e29b-41d4-a716-446655440000";
const TASK_DONE_ID = "6f29a1c3-8b74-4d21-9e02-1c7f5a3b8d24";
const TASK_WORK_ID = "71c4de90-2a53-4b88-8f61-0d9e7c4a51f3";

const ASK_MESSAGE = {
    messageId: "msg-1",
    workspaceId: WORKSPACE_ID,
    groupId: GROUP_ID,
    authorKind: "human",
    authorMemberId: HUMAN_AN.memberId,
    authorModuleInstallationId: null,
    body: "@Sales Bạn có thể gửi giúp mình báo cáo doanh số tháng này không?",
    intentId: "intent-1",
    addressedModuleInstallationId: MODULE_SALES.moduleInstallationId,
    addressedModuleKey: "sales",
    answersQuestionId: null,
    occurredAt: "2026-09-24T09:14:00Z",
};
const ACK_MESSAGE = {
    ...ASK_MESSAGE,
    messageId: "msg-2",
    authorKind: "module",
    authorMemberId: null,
    authorModuleInstallationId: MODULE_SALES.moduleInstallationId,
    body: "Vâng, mình sẽ chuẩn bị báo cáo doanh số tháng này.",
    intentId: "intent-2",
    addressedModuleInstallationId: null,
    addressedModuleKey: null,
    occurredAt: "2026-09-24T09:16:00Z",
};
const HELD_MESSAGE = {
    ...ACK_MESSAGE,
    messageId: "msg-3",
    body: `Đã giữ một hành động trong nhiệm vụ T-${TASK_WAIT_ID.slice(0, 4).toUpperCase()} và cần phê duyệt.`,
    occurredAt: "2026-09-24T10:24:00Z",
};

const BINDING = {
    bindingId: "bind-1",
    workspaceId: WORKSPACE_ID,
    groupId: GROUP_ID,
    sourceMessageId: ASK_MESSAGE.messageId,
    intentId: ASK_MESSAGE.intentId,
    receiverModuleInstallationId: MODULE_SALES.moduleInstallationId,
    receiverModuleKey: "sales",
    commandName: "build-sales-report",
    commandVersion: "1",
    askerMemberId: HUMAN_AN.memberId,
    routingRuleId: null,
    status: "admitted",
    receipt: { disposition: "not-yet-reported" },
};

const APPROVAL = {
    approvalId: "appr-1",
    workspaceId: WORKSPACE_ID,
    groupId: GROUP_ID,
    taskId: TASK_WAIT_ID,
    action: "Gửi báo cáo doanh số cho đối tác",
    consequence: "Báo cáo sẽ rời khỏi công ty. Kiểm tra người nhận và nội dung trước khi quyết định.",
    heldActionKey: "sales.send-report",
    requiredRole: "manager-or-owner",
    status: "waiting",
    decidedByMemberId: null,
    decision: null,
    decidedAt: null,
    releaseIntentId: null,
    cardMessageId: HELD_MESSAGE.messageId,
};

const task = (overrides) => ({
    workspaceId: WORKSPACE_ID,
    groupId: GROUP_ID,
    bindingId: null,
    cardMessageId: null,
    intentId: "intent-1",
    owningModuleInstallationId: MODULE_SALES.moduleInstallationId,
    owningModuleKey: "sales",
    owningModuleDisplayName: "Sales",
    askedByMemberId: HUMAN_AN.memberId,
    askedByDisplayName: "An Nguyen",
    assignedToMemberId: HUMAN_MINH.memberId,
    assignedToDisplayName: "Minh",
    routingRuleId: null,
    status: "working",
    version: 1,
    waiting: null,
    outcome: null,
    createdAt: "2026-09-24T09:15:00Z",
    updatedAt: "2026-09-24T09:16:00Z",
    ...overrides,
});

const TASK_WAITING_APPROVAL = task({
    taskId: TASK_WAIT_ID,
    bindingId: BINDING.bindingId,
    cardMessageId: HELD_MESSAGE.messageId,
    statement: "Tổng hợp doanh số tuần này",
    status: "waiting-on-approval",
    version: 3,
    waiting: { kind: "approval", approval: APPROVAL },
    updatedAt: "2026-09-24T10:24:00Z",
});
const TASK_DONE = task({
    taskId: TASK_DONE_ID,
    statement: "Đối soát hoá đơn tháng 8",
    owningModuleInstallationId: MODULE_ACC.moduleInstallationId,
    owningModuleKey: "accounting",
    owningModuleDisplayName: "Accounting",
    assignedToMemberId: HUMAN_HUY.memberId,
    assignedToDisplayName: "Huy",
    status: "done",
    version: 4,
});
const TASK_WORKING = task({
    taskId: TASK_WORK_ID,
    statement: "Soạn bản nháp thông báo nội bộ",
    owningModuleInstallationId: MODULE_BOT.moduleInstallationId,
    owningModuleKey: "chatbot",
    owningModuleDisplayName: "Chatbot",
    status: "working",
    version: 2,
});

const notice = (recipientMemberId) => ({
    notice: {
        noticeId: "ntc-1",
        workspaceId: WORKSPACE_ID,
        groupId: GROUP_ID,
        recipientMemberId,
        turnKind: "approval",
        taskId: TASK_WAIT_ID,
        approvalId: APPROVAL.approvalId,
        turnIdentity: "turn-approval-appr-1",
        status: "delivered",
        intentKey: "notice-approval-appr-1",
        raisedAt: "2026-09-24T10:24:00Z",
        deliveredAt: "2026-09-24T10:24:01Z",
        resolvedAt: null,
        retiredAt: null,
    },
    turn: { state: "open" },
    target: { groupId: GROUP_ID, taskId: TASK_WAIT_ID, approvalId: APPROVAL.approvalId, cardMessageId: HELD_MESSAGE.messageId },
});

/** One served page per journey state; `denied`/`revoked` are reads the boundary refuses. */
const pageForMode = (mode) => {
    switch (mode) {
        case "no-module":
            return { viewer: VIEWER_OWNER, participants: [HUMAN_AN, HUMAN_MINH, HUMAN_HUY], messages: [ASK_MESSAGE] };
        case "office-staff":
            return { viewer: VIEWER_STAFF, participants: ROSTER, messages: [ASK_MESSAGE, ACK_MESSAGE] };
        case "accept":
        case "office":
            return { viewer: VIEWER_OWNER, participants: ROSTER, messages: [ASK_MESSAGE, ACK_MESSAGE] };
        case "approval":
            return {
                viewer: VIEWER_OWNER,
                participants: ROSTER,
                messages: [ASK_MESSAGE, HELD_MESSAGE],
                cards: [BINDING],
                tasks: [TASK_WAITING_APPROVAL],
                notices: [notice(HUMAN_AN.memberId)],
            };
        case "approval-staff":
            return {
                viewer: VIEWER_STAFF,
                participants: ROSTER,
                messages: [ASK_MESSAGE, HELD_MESSAGE],
                cards: [BINDING],
                tasks: [TASK_WAITING_APPROVAL],
                notices: [notice(HUMAN_HUY.memberId)],
            };
        case "tasks":
            return {
                viewer: VIEWER_OWNER,
                participants: ROSTER,
                messages: [ASK_MESSAGE, ACK_MESSAGE],
                tasks: [TASK_WAITING_APPROVAL, TASK_DONE, TASK_WORKING],
            };
        case "denied":
            return { denied: true };
        case "revoked":
            return { revoked: true };
        default:
            throw new Error(`unknown fixture mode ${mode}`);
    }
};

const ENVELOPE = (data, message = "ok", error = null) => ({ data, message, success: error === null, error });
const OUTCOME = (op, result) => ({ ok: true, op, result });
const FAILURE = (op, kind, reason, retryable) => ({ ok: false, failure: { op, kind, reason, retryable } });

/**
 * The GraphQL fixture: one HTTP server publishing the published shapes on
 * `GRAPHQL_PORT`, with a mode switch (`GET /__mode?name=`) and a request log so a test
 * can assert what the boundary actually received, not only what the screen shows.
 */
const startFixture = async () => {
    let mode = "office";
    let invitations = new Set();
    let live = { messages: [], cards: [], tasks: [], approval: null, overrides: {} };
    const ops = [];

    const setMode = (next) => {
        pageForMode(next);
        mode = next;
        invitations = new Set();
        live = { messages: [], cards: [], tasks: [], approval: null, overrides: {} };
        ops.length = 0;
    };
    /* The served page: the mode's published state plus everything a command committed in this run. */
    const currentPage = () => {
        const published = pageForMode(mode);
        const tasks = [...(published.tasks ?? []), ...live.tasks].map((row) => live.overrides[row.taskId] ?? row);
        return {
            ...published,
            messages: [...(published.messages ?? []), ...live.messages],
            cards: [...(published.cards ?? []), ...live.cards],
            tasks,
            approval: live.approval ?? tasks.find((row) => row.waiting?.kind === "approval")?.waiting.approval ?? APPROVAL,
        };
    };

    const filterTasks = (rows, input) =>
        rows.filter((row) => {
            if (input.personMemberId !== undefined && row.assignedToMemberId !== input.personMemberId) return false;
            if (input.moduleInstallationId !== undefined && row.owningModuleInstallationId !== input.moduleInstallationId) return false;
            if (input.status !== undefined && row.status !== input.status) return false;
            return true;
        });

    const collabRead = (op, input) => {
        const page = currentPage();
        if (mode === "denied") return FAILURE(op, "denied", "not-a-member", false);
        if (mode === "revoked") return FAILURE(op, "unavailable", "revoked", true);
        switch (op) {
            case "openOffice":
                return OUTCOME(op, { office: { group: GROUP, participants: page.participants ?? ROSTER, viewer: page.viewer ?? VIEWER_OWNER } });
            case "readGroup":
                return OUTCOME(op, { page: { group: GROUP, messages: page.messages ?? [], cards: page.cards ?? [] } });
            case "listTasks":
                return OUTCOME(op, { page: { tasks: filterTasks(page.tasks ?? [], input) } });
            case "readNotices":
                return OUTCOME(op, { page: { notices: page.notices ?? [] } });
            case "readTask": {
                const found = (page.tasks ?? []).find((row) => row.taskId === input.taskId);
                return OUTCOME(op, {
                    read: found === undefined
                        ? { outcome: "unavailable" }
                        : { outcome: "found", task: found, card: { groupId: GROUP_ID, cardMessageId: found.cardMessageId, bindingId: found.bindingId } },
                });
            }
            case "openNotice": {
                const item = (page.notices ?? []).find((row) => row.notice.noticeId === input.noticeId);
                return OUTCOME(op, item === undefined ? { notice: { outcome: "unavailable" } } : { notice: { outcome: "open", notice: item.notice, turn: item.turn, target: item.target } });
            }
            case "reconcileRequest":
                return OUTCOME(op, { reconcile: { outcome: "none" } });
            case "availableCommands":
                return OUTCOME(op, { offer: { status: "unresolved", availableModules: ["Sales", "Accounting", "Chatbot"] } });
            default:
                return FAILURE(op, "unknown", `fixture: no read binding for ${op}`, true);
        }
    };

    const decidedApproval = (button) => ({
        ...currentPage().approval,
        status: button === "approve" ? "approved" : "rejected",
        decision: button,
        decidedByMemberId: currentPage().viewer.memberId,
        decidedByDisplayName: currentPage().viewer.role === "staff" ? "Huy" : "An Nguyen",
        decidedByRole: currentPage().viewer.role,
        decidedAt: "2026-09-24T10:30:00Z",
        buttons: ["approve", "reject"],
    });

    /** The one hired module a typed `@name` resolves to, or nothing. */
    const addressedModule = (name) => {
        if (name === undefined || name === null) return null;
        const wanted = String(name).toLowerCase();
        return ROSTER.find((row) => row.kind === "module" && (row.displayName.toLowerCase() === wanted || row.moduleInstallationId === wanted)) ?? null;
    };

    const collabCommand = (op, input) => {
        const page = currentPage();
        if (mode === "denied") return FAILURE(op, "denied", "not-a-member", false);
        switch (op) {
            case "inviteByEmail": {
                const actor = page.viewer ?? VIEWER_OWNER;
                if (actor.role !== "owner" && actor.role !== "manager") {
                    return FAILURE(op, "denied", "invite-needs-owner-or-manager", false);
                }
                const email = String(input.email ?? "").trim().toLowerCase();
                if (invitations.has(email)) {
                    return OUTCOME(op, { membership: { outcome: "existing" } });
                }
                invitations.add(email);
                return OUTCOME(op, {
                    membership: {
                        outcome: "created",
                        member: { memberId: "mem-inv-1", workspaceId: WORKSPACE_ID, kind: "human", displayName: email, role: String(input.role ?? "staff"), status: "invited" },
                    },
                });
            }
            case "acceptInvitation":
                return OUTCOME(op, {
                    membership: {
                        outcome: "accepted",
                        member: { memberId: "mem-mai", workspaceId: WORKSPACE_ID, kind: "human", displayName: "Mai", role: "staff", status: "active" },
                    },
                });
            case "pressApprovalButton": {
                const actor = page.viewer ?? VIEWER_OWNER;
                if (actor.role !== "owner" && actor.role !== "manager") {
                    return FAILURE(op, "denied", "press-needs-owner-or-manager", false);
                }
                const waiting = (page.tasks ?? []).find((row) => row.waiting?.kind === "approval" && row.waiting.approval.approvalId === input.approvalId);
                if (waiting === undefined) return OUTCOME(op, { press: { outcome: "unavailable" } });
                const card = decidedApproval(input.button);
                const decided = { ...waiting, status: input.button === "approve" ? "working" : "rejected", waiting: { kind: "approval", approval: card } };
                live.approval = card;
                live.overrides = { ...live.overrides, [waiting.taskId]: decided };
                return OUTCOME(op, { press: { outcome: "decided", card, task: decided } });
            }
            case "postMessage": {
                const body = String(input.body ?? "");
                const occurredAt = new Date().toISOString();
                if (input.moduleName !== undefined) {
                    const addressed = addressedModule(input.moduleName);
                    if (addressed === null) {
                        /* Unknown or ambiguous name: no work is started, and the message is not committed. */
                        return FAILURE(op, "unknown", "module-unresolved", true);
                    }
                    const messageId = `msg-live-${live.messages.length + 1}`;
                    const message = {
                        ...ASK_MESSAGE,
                        messageId,
                        body,
                        intentId: String(input.intentId ?? "intent-live"),
                        addressedModuleInstallationId: addressed.moduleInstallationId,
                        addressedModuleKey: addressed.moduleKey ?? "sales",
                        occurredAt,
                    };
                    const binding = { ...BINDING, bindingId: `bind-live-${live.messages.length + 1}`, sourceMessageId: messageId, intentId: message.intentId, receiverModuleInstallationId: addressed.moduleInstallationId };
                    const admitted = task({
                        taskId: `7a10be22-4c11-4f60-9b21-8d5e0f3a2c99`,
                        bindingId: binding.bindingId,
                        cardMessageId: messageId,
                        statement: body.replace(/^@[^\s@]+\s*/u, ""),
                        owningModuleInstallationId: addressed.moduleInstallationId,
                        owningModuleKey: addressed.moduleKey ?? "sales",
                        owningModuleDisplayName: addressed.displayName,
                        intentId: message.intentId,
                        status: "working",
                        updatedAt: occurredAt,
                    });
                    live.messages = [...live.messages, message];
                    live.cards = [...live.cards, binding];
                    live.tasks = [...live.tasks, admitted];
                    return OUTCOME(op, { route: { kind: "admitted", message, binding } });
                }
                const message = { ...ASK_MESSAGE, messageId: `msg-live-${live.messages.length + 1}`, body, intentId: String(input.intentId ?? "intent-live"), addressedModuleInstallationId: null, addressedModuleKey: null, occurredAt };
                live.messages = [...live.messages, message];
                return OUTCOME(op, { route: { kind: "not-addressed", message } });
            }
            default:
                return FAILURE(op, "unknown", `fixture: no command binding for ${op}`, true);
        }
    };

    const answer = (field, variables) => {
        switch (field) {
            case "refreshSession":
                return ENVELOPE({
                    accessToken: `${Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url")}.${Buffer.from(
                        JSON.stringify({ sub: "user-an-nguyen", name: "An Nguyen", preferred_username: "an.nguyen", email: "an.nguyen@northstar.test" }),
                    ).toString("base64url")}.fixture`,
                    requiresTwoFactor: false,
                    twoFactorToken: null,
                });
            case "myAgentWorkspace":
                return ENVELOPE([{ id: WORKSPACE_ID, name: "Support", status: "active", catalogOrder: { id: "PUR-FIXTURE" } }]);
            case "collabGatewayRead":
                return collabRead(variables?.request?.op ?? "", variables?.request?.input ?? {});
            case "collabGatewayCommand":
                return collabCommand(variables?.request?.op ?? "", variables?.request?.input ?? {});
            default:
                return ENVELOPE(null, "fixture: no binding");
        }
    };

    const server = http.createServer((req, res) => {
        const url = new URL(req.url, `http://127.0.0.1:${GRAPHQL_PORT}`);
        res.setHeader("access-control-allow-origin", req.headers.origin ?? `http://127.0.0.1:${APP_PORT}`);
        res.setHeader("access-control-allow-credentials", "true");
        res.setHeader("access-control-allow-headers", "content-type,authorization,accept-language");
        if (req.method === "OPTIONS") {
            res.writeHead(204);
            res.end();
            return;
        }
        if (url.pathname === "/__mode") {
            setMode(url.searchParams.get("name") ?? "office");
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ mode }));
            return;
        }
        if (req.method !== "POST") {
            res.writeHead(405);
            res.end();
            return;
        }
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
            let parsed;
            try {
                parsed = JSON.parse(body);
            } catch {
                parsed = {};
            }
            const document = String(parsed.query ?? "");
            const name = document.match(/\b(?:query|mutation)\s+([A-Za-z0-9_]+)/u)?.[1] ?? null;
            const field = { RefreshSession: "refreshSession", MyAgentWorkspace: "myAgentWorkspace", CollabGateway: document.includes("collabGatewayCommand") ? "collabGatewayCommand" : "collabGatewayRead" }[name] ?? name;
            const variables = parsed.variables ?? {};
            const collabOp = variables?.request?.op ?? null;
            const reply = answer(field, variables);
            if (field === "collabGatewayRead" || field === "collabGatewayCommand") {
                ops.push({ field, op: collabOp, input: variables?.request?.input ?? {}, reply });
            }
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ data: { [field]: reply } }));
        });
    });

    await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(GRAPHQL_PORT, "127.0.0.1", resolve);
    });

    return {
        setMode,
        ops,
        collabOps: (op) => ops.filter((entry) => entry.op === op),
        close: () => new Promise((resolve) => server.close(resolve)),
    };
};

/** Start the built @nivo/app production server and wait until it answers. */
const startApp = async () => {
    if (EXTERNAL_URL) return null;
    const server = spawn(process.execPath, [path.join(ROOT, "node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", APP_PORT], {
        cwd: path.join(ROOT, "apps/app"),
        stdio: "inherit",
        shell: false,
        windowsHide: true,
    });
    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
        try {
            const response = await fetch(`${BASE}${OFFICE_PATH}`);
            if (response.status < 500) return server;
        } catch {
            await new Promise((done) => setTimeout(done, 250));
        }
    }
    throw new Error(`the built @nivo/app did not become ready at ${BASE} (run \`npm run build\` first)`);
};

const stopApp = (server) => {
    if (!server || server.exitCode !== null) return;
    if (process.platform === "win32" && server.pid !== undefined) {
        spawnSync("taskkill", ["/pid", String(server.pid), "/t", "/f"], { stdio: "ignore", windowsHide: true });
        return;
    }
    server.kill("SIGTERM");
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Poll until `check` answers truthy; playwright has no expect() outside @playwright/test. */
const waitFor = async (check, label, timeout = 20_000) => {
    const deadline = Date.now() + timeout;
    for (;;) {
        let answer = false;
        let failure;
        try {
            answer = await check();
        } catch (error) {
            failure = error;
        }
        if (answer) return;
        if (Date.now() > deadline) {
            throw new Error(`timed out waiting for ${label}${failure === undefined ? "" : ` (last: ${failure.message})`}`);
        }
        await sleep(150);
    }
};

const officeReady = (page) => waitFor(async () => (await page.getByRole("tab", { name: "Office" }).count()) > 0, "the Office tab to render");

/** One isolated browser context per journey step: no shared SWR cache or storage. */
const openSurface = async (browser, url = OFFICE_PATH) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light", locale: "vi-VN" });
    const page = await context.newPage();
    page.setDefaultTimeout(20_000);
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(String(error)));
    await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
    return { context, page, pageErrors };
};

const rowIds = (page) => page.locator('[id^="collab-task-"]');

/** The `T-XXXX` short reference a task row and its Office card both print. */
const interRef = (text) => text.match(/T-[0-9A-F]{4}/u)?.[0] ?? "";

test("collab Office/Tasks — the four member journeys against the served app", async (t) => {
    const fixture = await startFixture();
    const server = await startApp();
    const browser = await chromium.launch({ headless: true, args: [`--host-resolver-rules=MAP localhost 127.0.0.1`] });
    const open = async (mode, url) => {
        fixture.setMode(mode);
        return openSurface(browser, url);
    };
    try {
        await t.test("first open: the Owner lands in Office with the roster, the conversation and the invite form", async () => {
            const { context, page, pageErrors } = await open("office");
            try {
                await officeReady(page);
                assert.equal(await page.getByRole("tab", { name: "Office" }).getAttribute("aria-selected"), "true");
                /* The /chat destination is the layout's, and it is the active one. */
                assert.equal(await page.locator('[data-key="chat"]').getAttribute("aria-selected"), "true");
                assert.equal(await page.locator('[data-key="chat"]').innerText().then((text) => text.includes("Trò chuyện")), true);
                assert.equal(await page.getByText("Support", { exact: true }).count() > 0, true);
                await page.getByText("Con người (3)", { exact: true }).waitFor();
                await page.getByText("Module đã thuê (3)", { exact: true }).waitFor();
                for (const name of ["An Nguyen", "Minh", "Huy", "Sales", "Accounting", "Chatbot"]) {
                    await page.getByText(name, { exact: true }).first().waitFor();
                }
                /* The invite control is offered to the Owner and names the closed V1 role set. */
                await page.locator("#collab-invite-email").waitFor();
                assert.deepEqual(await page.locator('input[name="invite-role"]').evaluateAll((nodes) => nodes.map((node) => node.value)), ["owner", "manager", "staff"]);
                await page.getByRole("button", { name: "Gửi lời mời" }).waitFor();
                /* The conversation is the authorized page the boundary served. */
                await page.locator("#collab-msg-msg-1").waitFor();
                await page.locator("#collab-msg-msg-2").waitFor();
                assert.equal(await page.locator("#collab-msg-msg-1").innerText().then((text) => text.includes("@sales")), true);
                await page.locator("#collab-composer").waitFor();
                assert.deepEqual(pageErrors, []);
            } finally {
                await context.close();
            }
        });

        await t.test("first open: Office stays readable with no module hired and invents no placeholder", async () => {
            const { context, page } = await open("no-module");
            try {
                await officeReady(page);
                await page.getByText("Con người (3)", { exact: true }).waitFor();
                await page.getByText("Module đã thuê (0)", { exact: true }).waitFor();
                await page.getByText("Chưa có module nào được thuê.", { exact: true }).waitFor();
                await page.getByText("Chưa có thành viên nào.", { exact: true }).waitFor({ state: "detached" }).catch(() => {});
                assert.equal(await page.locator("[data-member-id]").count(), 3);
                await page.getByRole("button", { name: "Gửi lời mời" }).waitFor();
            } finally {
                await context.close();
            }
        });

        await t.test("first open: the Owner invites by email, and the same email a second time is reported as existing", async () => {
            const { context, page } = await open("office");
            try {
                await officeReady(page);
                await page.locator("#collab-invite-email").fill("mai@congty.vn");
                await page.locator('input[name="invite-role"][value="manager"]').check();
                await page.getByRole("button", { name: "Gửi lời mời" }).click();
                await waitFor(async () => (await page.getByText("Đã ghi nhận lời mời tới mai@congty.vn.", { exact: true }).count()) > 0, "the recorded-invitation notice");
                /* A created invitation clears the field; the role choice stays. */
                assert.equal(await page.locator("#collab-invite-email").inputValue(), "");
                assert.equal(await page.locator('input[name="invite-role"][value="manager"]').isChecked(), true);
                const sent = fixture.collabOps("inviteByEmail");
                assert.equal(sent.length >= 1, true);
                assert.deepEqual(Object.keys(sent.at(-1).input).sort(), ["email", "role"]);
                assert.deepEqual(sent.at(-1).input, { email: "mai@congty.vn", role: "manager" });

                await page.locator("#collab-invite-email").fill("mai@congty.vn");
                await page.getByRole("button", { name: "Gửi lời mời" }).click();
                await waitFor(async () => (await page.getByText("Email này đã có lời mời hoặc đã là thành viên.", { exact: true }).count()) > 0, "the duplicate-invitation notice");
            } finally {
                await context.close();
            }
        });

        await t.test("first open: a Staff member is offered no invite control", async () => {
            const { context, page } = await open("office-staff");
            try {
                await officeReady(page);
                await page.getByText("Con người (3)", { exact: true }).waitFor();
                assert.equal(await page.locator("#collab-invite-email").count(), 0);
                assert.equal(await page.getByRole("button", { name: "Gửi lời mời" }).count(), 0);
                assert.equal(await page.getByText("Mời thành viên", { exact: true }).count(), 0);
            } finally {
                await context.close();
            }
        });

        await t.test("first open: the invited person accepts and then reads Office, which the invitation screen never disclosed", async () => {
            const { context, page } = await open("accept", `${OFFICE_PATH}&invitation=inv-1&role=staff`);
            try {
                await page.getByRole("button", { name: "Chấp nhận lời mời" }).waitFor();
                await page.getByText("Lời mời vào workspace", { exact: true }).waitFor();
                await page.getByText("Vai trò được mời: Staff", { exact: true }).waitFor();
                /* Acceptance mode withholds Office entirely: no roster, no conversation, no tabs. */
                assert.equal(await page.getByRole("tab", { name: "Office" }).count(), 0);
                assert.equal(await page.locator("#collab-msg-msg-1").count(), 0);
                await page.getByRole("button", { name: "Chấp nhận lời mời" }).click();
                await officeReady(page);
                assert.equal(await page.locator("#collab-msg-msg-1").count() > 0, true);
                assert.equal(await page.getByRole("button", { name: "Chấp nhận lời mời" }).count(), 0);
                assert.equal(fixture.collabOps("acceptInvitation").length, 1);
            } finally {
                await context.close();
            }
        });

        await t.test("approve-safe-action: the notice leads to the waiting card, and the Owner's button press decides it once", async () => {
            const { context, page } = await open("approval");
            try {
                await officeReady(page);
                const card = page.locator(`#collab-approval-${APPROVAL.approvalId}`);
                await card.waitFor();
                await page.getByText("Cần phê duyệt", { exact: true }).waitFor();
                await page.getByText("Đang chờ quyết định", { exact: true }).waitFor();
                await card.getByText(APPROVAL.action, { exact: true }).waitFor();
                await card.getByText(APPROVAL.consequence, { exact: true }).waitFor();
                await card.getByText("T-550E • Sales", { exact: false }).waitFor();
                await page.getByText("Chỉ Owner hoặc Manager được quyết định", { exact: true }).waitFor();
                const approve = card.getByRole("button", { name: "Phê duyệt" });
                const reject = card.getByRole("button", { name: "Từ chối" });
                assert.equal(await approve.count(), 1);
                assert.equal(await reject.count(), 1);
                assert.equal(await approve.isDisabled(), false);
                /* No typed approval path exists: the card's two buttons are the whole control. */
                assert.equal(await card.getByRole("button").count(), 2);

                /* The notice for this turn follows to the same waiting card. */
                const noticeCard = page.locator('[data-grammar-surface-card]').filter({ hasText: "Cần bạn xử lý" });
                await noticeCard.getByText("Một hành động đang chờ bạn quyết định", { exact: true }).waitFor();
                await noticeCard.getByRole("button", { name: "Mở", exact: true }).click();
                await waitFor(async () => fixture.collabOps("openNotice").length === 1, "the openNotice call");
                assert.equal(fixture.collabOps("openNotice")[0].input.noticeId, "ntc-1");
                await card.waitFor();

                await approve.click();
                await waitFor(async () => fixture.collabOps("pressApprovalButton").length === 1, "the pressApprovalButton call");
                assert.deepEqual(fixture.collabOps("pressApprovalButton")[0].input, { approvalId: "appr-1", button: "approve" });
                await waitFor(async () => (await card.getByRole("button", { name: "Phê duyệt" }).count()) === 0, "the decided card to drop its action buttons");
                assert.equal(await card.getByRole("button", { name: "Từ chối" }).count(), 0);
                await page.getByText("Cần phê duyệt", { exact: true }).waitFor({ state: "detached" });
                await card.getByText("Hoàn thành", { exact: true }).waitFor();
                await card.getByText(/An Nguyen đã quyết định lúc/u).waitFor();
            } finally {
                await context.close();
            }
        });

        await t.test("approve-safe-action: a Staff member reads the same card with inactive decision controls", async () => {
            const { context, page } = await open("approval-staff");
            try {
                await officeReady(page);
                const card = page.locator(`#collab-approval-${APPROVAL.approvalId}`);
                await card.waitFor();
                /* Every current Office member reads the card's content. */
                await card.getByText(APPROVAL.action, { exact: true }).waitFor();
                await card.getByText(APPROVAL.consequence, { exact: true }).waitFor();
                await card.getByText(/An Nguyen/u).first().waitFor();
                const approve = card.getByRole("button", { name: "Phê duyệt" });
                const reject = card.getByRole("button", { name: "Từ chối" });
                assert.equal(await approve.count(), 1);
                assert.equal(await approve.isDisabled(), true);
                assert.equal(await reject.isDisabled(), true);
                /* The card stays waiting: no press reached the boundary. */
                await page.getByText("Đang chờ quyết định", { exact: true }).waitFor();
                assert.equal(fixture.collabOps("pressApprovalButton").length, 0);
                assert.equal(await page.locator("#collab-invite-email").count(), 0);
            } finally {
                await context.close();
            }
        });

        await t.test("assign-work: an addressed request becomes one task shown by the Office card and the Tasks row, and the row opens its card", async () => {
            const { context, page } = await open("office");
            try {
                await officeReady(page);
                await page.locator("#collab-composer").fill("@Sales Bạn gửi giúp mình báo cáo doanh số tuần này nhé");
                await page.getByRole("button", { name: "Gửi", exact: true }).click();
                await waitFor(async () => (await rowIds(page).count()) === 1, "the task receipt card");
                const post = fixture.collabOps("postMessage");
                assert.equal(post.length, 1);
                assert.equal(post[0].input.moduleName, "Sales");
                /* A committed post clears the draft. */
                await waitFor(async () => (await page.locator("#collab-composer").inputValue()) === "", "the composer to clear");
                const taskId = await rowIds(page).first().getAttribute("id");
                const cardText = await rowIds(page).first().innerText();
                assert.equal(cardText.includes("Sales"), true);
                assert.equal(cardText.includes("Người yêu cầu: An Nguyen"), true);
                assert.equal(cardText.includes("Người được giao: Minh"), true);

                await page.getByRole("tab", { name: "Tasks" }).click();
                await waitFor(async () => (await page.getByRole("tab", { name: "Tasks" }).getAttribute("aria-selected")) === "true", "the Tasks tab to become selected");
                await waitFor(async () => (await page.locator(`#${taskId}`).innerText()).includes("Mô-đun: Sales"), "the same task as a Tasks row");
                const rowText = await page.locator(`#${taskId}`).innerText();
                assert.equal(rowText.includes("Người yêu cầu: An Nguyen"), true);
                assert.equal(rowText.includes("Mô-đun: Sales"), true);
                assert.equal(rowText.includes("Đang làm"), true);
                /* One identity, one object: the Office card and the Tasks row are the same task id. */
                const ref = interRef(rowText);
                assert.equal(cardText.includes(ref), true);

                await page.locator(`#${taskId}`).getByRole("button", { name: "Mở trong Office" }).click();
                await waitFor(async () => (await page.getByRole("tab", { name: "Office" }).getAttribute("aria-selected")) === "true", "the Office tab to become selected");
                await waitFor(async () => (await page.locator(`#${taskId}`).count()) === 1, "the Office card after the row jump");
            } finally {
                await context.close();
            }
        });

        await t.test("assign-work: an ordinary message invokes no module, and an unknown name starts no work", async () => {
            const { context, page } = await open("office");
            try {
                await officeReady(page);
                await page.locator("#collab-composer").fill("Chào cả nhà, hôm nay thế nào?");
                await page.getByRole("button", { name: "Gửi", exact: true }).click();
                await waitFor(async () => fixture.collabOps("postMessage").length === 1, "the ordinary post");
                assert.equal(fixture.collabOps("postMessage")[0].input.moduleName, undefined);
                await waitFor(async () => (await page.locator('[id^="collab-msg-"]').count()) === 3, "the ordinary message");
                await sleep(500);
                /* No module was invoked: no card was raised under the message. */
                assert.equal(await rowIds(page).count(), 0);

                await page.locator("#collab-composer").fill("@KhongCo giúp mình với");
                await page.getByRole("button", { name: "Gửi", exact: true }).click();
                await waitFor(async () => fixture.collabOps("postMessage").length === 2, "the unresolved-address post");
                assert.equal(fixture.collabOps("postMessage")[1].input.moduleName, "KhongCo");
                await page.getByText("Tin nhắn chưa chắc đã được ghi. Kiểm tra rồi gửi lại.", { exact: true }).waitFor();
                await page.getByRole("button", { name: "Kiểm tra và gửi lại" }).waitFor();
                /* The draft is retained and nothing was committed as work. */
                assert.equal(await page.locator("#collab-composer").inputValue(), "@KhongCo giúp mình với");
                assert.equal(await rowIds(page).count(), 0);
                assert.equal(await page.locator('[id^="collab-msg-"]').count(), 3);
            } finally {
                await context.close();
            }
        });

        await t.test("tasks-overview: every row is the Office object, the filters narrow to matching rows and say so when nothing matches", async () => {
            const { context, page } = await open("tasks");
            try {
                await officeReady(page);
                await page.getByRole("tab", { name: "Tasks" }).click();
                await waitFor(async () => (await rowIds(page).count()) === 3, "the three Tasks rows");
                assert.equal(await page.getByText("3 công việc", { exact: true }).count() > 0, true);
                await page.getByText("Bộ lọc chỉ thay đổi danh sách hiển thị.", { exact: true }).waitFor();
                const options = await page.locator("#collab-filter-person option").evaluateAll((nodes) => nodes.map((node) => node.textContent));
                assert.deepEqual(options, ["Tất cả", "An Nguyen", "Minh", "Huy"]);

                await page.selectOption("#collab-filter-person", HUMAN_MINH.memberId);
                await waitFor(async () => (await rowIds(page).count()) === 2, "the person-filtered rows");
                assert.equal(await page.locator(`#collab-task-${TASK_DONE_ID}`).count(), 0);
                assert.equal(await page.getByText("2 công việc", { exact: true }).count() > 0, true);

                await page.selectOption("#collab-filter-module", MODULE_ACC.moduleInstallationId);
                await waitFor(async () => (await page.getByText("Không có công việc nào khớp bộ lọc.", { exact: true }).count()) > 0, "the empty filter result");
                assert.equal(await rowIds(page).count(), 0);
                /* The filters stay visible and usable after an empty result. */
                assert.equal(await page.locator("#collab-filter-status").isVisible(), true);

                await page.selectOption("#collab-filter-person", "");
                await waitFor(async () => (await rowIds(page).count()) === 1, "the module-filtered row");
                assert.equal(await page.locator(`#collab-task-${TASK_DONE_ID}`).count(), 1);
                await page.selectOption("#collab-filter-status", "cancelled");
                await waitFor(async () => (await page.getByText("Không có công việc nào khớp bộ lọc.", { exact: true }).count()) > 0, "the status that matches nothing");
                await page.selectOption("#collab-filter-status", "");
                await waitFor(async () => (await rowIds(page).count()) === 1, "the restored module row");

                await page.getByRole("tab", { name: "Office" }).click();
                await officeReady(page);
                await page.locator("#collab-msg-msg-1").waitFor();
                assert.equal(await rowIds(page).count(), 0);
            } finally {
                await context.close();
            }
        });

        await t.test("reads: a nonmember sees no workspace content, and a revoked read fails visibly and recovers on retry", async () => {
            const denied = await open("denied");
            try {
                await denied.page.getByText("Office không khả dụng", { exact: true }).waitFor();
                await denied.page.getByText("Bạn không phải thành viên hiện tại của workspace này.", { exact: true }).waitFor();
                await denied.page.getByRole("button", { name: "Về Tổng quan" }).waitFor();
                /* Nothing of the workspace is disclosed, not even the roster or a task row. */
                assert.equal(await denied.page.getByText("Con người (3)", { exact: true }).count(), 0);
                assert.equal(await rowIds(denied.page).count(), 0);
                assert.equal(await denied.page.locator("#collab-msg-msg-1").count(), 0);
                assert.equal(await denied.page.getByRole("tab", { name: "Office" }).count(), 0);
            } finally {
                await denied.context.close();
            }

            const revoked = await open("revoked");
            try {
                await revoked.page.getByText("Không đọc được Office. Thử lại.", { exact: true }).waitFor();
                fixture.setMode("office");
                await revoked.page.getByRole("button", { name: "Thử lại" }).click();
                await officeReady(revoked.page);
                assert.equal(await revoked.page.locator("#collab-msg-msg-1").count() > 0, true);
            } finally {
                await revoked.context.close();
            }
        });
    } finally {
        await browser.close();
        stopApp(server);
        await fixture.close();
    }
});