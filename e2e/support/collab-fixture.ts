/**
 * The collab served-product helpers: a GraphQL fixture publishing the `contract.collab.chat`
 * rev 5 read shapes, and the one-context-per-journey browser surface the spec drives.
 *
 * THE FIXTURE IS A STAND-IN, NOT THE BACKEND. It answers on the port `NEXT_PUBLIC_CORE_API_URL`
 * bakes into the build (`http://localhost:3068/graphql` by default), with a mode switch
 * (`GET /__mode?name=`) and a request log so a test asserts what the boundary actually received,
 * not only what the screen shows.
 */
import { Buffer } from "node:buffer";
import http from "node:http";
import type { Browser, BrowserContext, Locator, Page } from "@playwright/test";
import {
    APPROVAL,
    ASK_MESSAGE,
    BINDING,
    collabTask,
    ENVELOPE,
    FAILURE,
    fixturePageForMode,
    GROUP,
    GROUP_ID,
    moduleKeyOf,
    OUTCOME,
    ROSTER,
    VIEWER_OWNER,
    WORKSPACE_ID,
    type CollabApproval,
    type CollabBinding,
    type CollabFixtureInput,
    type CollabMember,
    type CollabMessage,
    type CollabPageState,
    type CollabTask,
    type Envelope,
    type GatewayReply,
} from "./collab-contract";
import { waitFor } from "./poll";

export interface CollabOpLogEntry {
    field: string;
    op: string | null;
    input: CollabFixtureInput;
    reply: Envelope | GatewayReply;
}

export interface CollabFixture {
    setMode: (mode: string) => void;
    ops: CollabOpLogEntry[];
    collabOps: (op: string) => CollabOpLogEntry[];
    close: () => Promise<void>;
}

interface LiveState {
    messages: CollabMessage[];
    cards: CollabBinding[];
    tasks: CollabTask[];
    approval: CollabApproval | null;
    overrides: Record<string, CollabTask>;
}

interface GraphqlRequestBody {
    query?: unknown;
    variables?: { request?: { op?: unknown; input?: CollabFixtureInput } };
}

const FIELD_BY_OPERATION: Record<string, string> = {
    RefreshSession: "refreshSession",
    MyAgentWorkspace: "myAgentWorkspace",
};

/**
 * The GraphQL fixture: one HTTP server publishing the shapes from collab-contract on
 * `graphqlPort`, with the mode switch and request log described above. `defaultOrigin` is the
 * CORS fallback when the request carries no Origin header.
 */
export const startCollabFixture = async (graphqlPort: number, defaultOrigin: string): Promise<CollabFixture> => {
    let mode = "office";
    let invitations = new Set<string>();
    let live: LiveState = { messages: [], cards: [], tasks: [], approval: null, overrides: {} };
    const ops: CollabOpLogEntry[] = [];

    const setMode = (next: string) => {
        fixturePageForMode(next);
        mode = next;
        invitations = new Set<string>();
        live = { messages: [], cards: [], tasks: [], approval: null, overrides: {} };
        ops.length = 0;
    };
    /* The served page: the mode's published state plus everything a command committed in this run. */
    const currentPage = (): CollabPageState => {
        const published = fixturePageForMode(mode);
        const tasks = [...(published.tasks ?? []), ...live.tasks].map((row) => live.overrides[row.taskId] ?? row);
        return {
            ...published,
            messages: [...(published.messages ?? []), ...live.messages],
            cards: [...(published.cards ?? []), ...live.cards],
            tasks,
            approval: live.approval ?? tasks.find((row) => row.waiting?.kind === "approval")?.waiting?.approval ?? APPROVAL,
        };
    };

    const filterTasks = (rows: CollabTask[], input: CollabFixtureInput): CollabTask[] =>
        rows.filter((row) => {
            if (input.personMemberId !== undefined && row.assignedToMemberId !== input.personMemberId) return false;
            if (input.moduleInstallationId !== undefined && row.owningModuleInstallationId !== input.moduleInstallationId) return false;
            if (input.status !== undefined && row.status !== input.status) return false;
            return true;
        });

    const collabRead = (op: string, input: CollabFixtureInput): GatewayReply => {
        const page = currentPage();
        if (page.denied) return FAILURE(op, "denied", "not-a-member", false);
        if (page.revoked) return FAILURE(op, "unavailable", "revoked", true);
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

    const decidedApproval = (button: string): CollabApproval => {
        const viewer = currentPage().viewer ?? VIEWER_OWNER;
        return {
            ...(currentPage().approval ?? APPROVAL),
            status: button === "approve" ? "approved" : "rejected",
            decision: button,
            decidedByMemberId: viewer.memberId,
            decidedByDisplayName: viewer.role === "staff" ? "Huy" : "An Nguyen",
            decidedByRole: viewer.role,
            decidedAt: "2026-09-24T10:30:00Z",
            buttons: ["approve", "reject"],
        };
    };

    /** The one hired module a typed `@name` resolves to, or nothing. */
    const addressedModule = (name: unknown): CollabMember | null => {
        if (name === undefined || name === null) return null;
        const wanted = String(name).toLowerCase();
        return ROSTER.find((row) => row.kind === "module" && (row.displayName.toLowerCase() === wanted || row.moduleInstallationId === wanted)) ?? null;
    };

    const collabCommand = (op: string, input: CollabFixtureInput): GatewayReply => {
        const page = currentPage();
        if (page.denied) return FAILURE(op, "denied", "not-a-member", false);
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
                const waiting = (page.tasks ?? []).find((row) => row.waiting?.kind === "approval" && row.waiting?.approval?.approvalId === input.approvalId);
                if (waiting === undefined) return OUTCOME(op, { press: { outcome: "unavailable" } });
                const card = decidedApproval(input.button ?? "");
                const decided: CollabTask = { ...waiting, status: input.button === "approve" ? "working" : "rejected", waiting: { kind: "approval", approval: card } };
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
                    const message: CollabMessage = {
                        ...ASK_MESSAGE,
                        messageId,
                        body,
                        intentId: String(input.intentId ?? "intent-live"),
                        addressedModuleInstallationId: addressed.moduleInstallationId,
                        addressedModuleKey: moduleKeyOf(addressed),
                        occurredAt,
                    };
                    const binding: CollabBinding = { ...BINDING, bindingId: `bind-live-${live.messages.length + 1}`, sourceMessageId: messageId, intentId: message.intentId, receiverModuleInstallationId: addressed.moduleInstallationId };
                    const admitted = collabTask({
                        taskId: `7a10be22-4c11-4f60-9b21-8d5e0f3a2c99`,
                        bindingId: binding.bindingId,
                        cardMessageId: messageId,
                        statement: body.replace(/^@[^\s@]+\s*/u, ""),
                        owningModuleInstallationId: addressed.moduleInstallationId,
                        owningModuleKey: moduleKeyOf(addressed),
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
                const message: CollabMessage = { ...ASK_MESSAGE, messageId: `msg-live-${live.messages.length + 1}`, body, intentId: String(input.intentId ?? "intent-live"), addressedModuleInstallationId: null, addressedModuleKey: null, occurredAt };
                live.messages = [...live.messages, message];
                return OUTCOME(op, { route: { kind: "not-addressed", message } });
            }
            default:
                return FAILURE(op, "unknown", `fixture: no command binding for ${op}`, true);
        }
    };

    const answer = (field: string, request: { op?: unknown; input?: CollabFixtureInput } | undefined): Envelope | GatewayReply => {
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
                return collabRead(typeof request?.op === "string" ? request.op : "", request?.input ?? {});
            case "collabGatewayCommand":
                return collabCommand(typeof request?.op === "string" ? request.op : "", request?.input ?? {});
            default:
                return ENVELOPE(null, "fixture: no binding");
        }
    };

    const server = http.createServer((req, res) => {
        const url = new URL(req.url ?? "/", `http://127.0.0.1:${graphqlPort}`);
        res.setHeader("access-control-allow-origin", req.headers.origin ?? defaultOrigin);
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
        req.on("data", (chunk: Buffer | string) => (body += chunk.toString()));
        req.on("end", () => {
            let parsed: GraphqlRequestBody;
            try {
                parsed = JSON.parse(body) as GraphqlRequestBody;
            } catch {
                parsed = {};
            }
            const document = String(parsed.query ?? "");
            const name = document.match(/\b(?:query|mutation)\s+([A-Za-z0-9_]+)/u)?.[1] ?? null;
            const field = name === null
                ? "unknown"
                : name === "CollabGateway"
                    ? document.includes("collabGatewayCommand") ? "collabGatewayCommand" : "collabGatewayRead"
                    : FIELD_BY_OPERATION[name] ?? name;
            const request = parsed.variables?.request;
            const reply = answer(field, request);
            if (field === "collabGatewayRead" || field === "collabGatewayCommand") {
                ops.push({ field, op: typeof request?.op === "string" ? request.op : null, input: request?.input ?? {}, reply });
            }
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ data: { [field]: reply } }));
        });
    });

    await new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(graphqlPort, "127.0.0.1", () => resolve());
    });

    return {
        setMode,
        ops,
        collabOps: (op: string) => ops.filter((entry) => entry.op === op),
        close: () => new Promise<void>((resolve) => server.close(() => resolve())),
    };
};

export interface SurfaceSession {
    context: BrowserContext;
    page: Page;
    pageErrors: string[];
}

/** One isolated browser context per journey step: no shared SWR cache or storage. */
export const openSurface = async (
    browser: Browser,
    baseUrl: string,
    url: string,
    viewport: { width: number; height: number },
): Promise<SurfaceSession> => {
    const context = await browser.newContext({ viewport, colorScheme: "light", locale: "vi-VN" });
    const page = await context.newPage();
    page.setDefaultTimeout(20_000);
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(String(error)));
    await page.goto(`${baseUrl}${url}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
    return { context, page, pageErrors };
};

export const officeReady = (page: Page): Promise<void> =>
    waitFor(async () => (await page.getByRole("tab", { name: "Office" }).count()) > 0, "the Office tab to render");

export const rowIds = (page: Page): Locator => page.locator('[id^="collab-task-"]');

/** The `T-XXXX` short reference a task row and its Office card both print. */
export const interRef = (text: string): string => text.match(/T-[0-9A-F]{4}/u)?.[0] ?? "";
