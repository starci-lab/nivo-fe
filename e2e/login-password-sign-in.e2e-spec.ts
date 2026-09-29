/**
 * uat.login.password-sign-in — the served browser proof demanded by
 * D:/Repositories/nivo-backend/.starciwork/features/login/uat/password-sign-in/index.yaml.
 *
 * WHAT THIS PROVES. The nine ordered journey steps of the UAT record run once, in order, against
 * the real local stack (Next app on 3067, Nest GraphQL on 3068, the dev Keycloak realm `nivo`,
 * Postgres in `nivo-postgres`). A run-owned disposable account holder is seeded in Keycloak and
 * the app's `users` table with an enrolled TOTP factor, then removed with read-back verification
 * in cleanup. Every context records genuine video; checkpoints capture screenshots; the per-step
 * ledger lands in run-result.json beside them.
 *
 * ENVIRONMENT OVERRIDES (all optional, defaults are the declared login-local origins):
 *   NIVO_UAT_WEB_URL        default http://localhost:3067
 *   NIVO_UAT_API_URL        default http://localhost:3068  (GraphQL at <api>/graphql)
 *   NIVO_UAT_KEYCLOAK_URL   default http://localhost:8147
 *   NIVO_UAT_BACKEND_ROOT   default D:/Repositories/nivo-backend (starcistacks runtime files)
 *   NIVO_UAT_RECORD_DIR     where screens/, videos/ and run-result.json are written;
 *                           default <backend>/.starciwork/features/login/uat/password-sign-in/runs/<runId>
 *   NIVO_UAT_RUN_ID         default run-<yyyymmdd>-uat-verify-attempt1
 */
import { Buffer } from "node:buffer";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { chromium, expect, test } from "@playwright/test";

const HERE = __dirname;
const WEB = (process.env.NIVO_UAT_WEB_URL ?? "http://localhost:3067").replace(/\/$/, "");
const API = (process.env.NIVO_UAT_API_URL ?? "http://localhost:3068").replace(/\/$/, "");
const KC = (process.env.NIVO_UAT_KEYCLOAK_URL ?? "http://localhost:8147").replace(/\/$/, "");
const BACKEND_ROOT = process.env.NIVO_UAT_BACKEND_ROOT ?? "D:/Repositories/nivo-backend";
const REALM = "nivo";
const RUN_ID = process.env.NIVO_UAT_RUN_ID ?? `run-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-uat-verify-attempt1`;
const RECORD_DIR = process.env.NIVO_UAT_RECORD_DIR
    ?? path.join(BACKEND_ROOT, ".starciwork/features/login/uat/password-sign-in/runs", RUN_ID);
const SCREENS = path.join(RECORD_DIR, "screens");
const VIDEOS = path.join(RECORD_DIR, "videos");
const RUNTIME_FILES = path.join(BACKEND_ROOT, ".starcistacks/dev/runtime/files");
const KC_CONTAINER = "nivo-keycloak";
const PG_CONTAINER = "nivo-postgres";

/** Visible copy, asserted exactly as the product serves it (en messages). */
const COPY = {
    emailInvalid: "Enter a valid email address.",
    passwordTooShort: "Use at least 8 characters.",
    refused: "That email or password is not right.",
    undecided: "nivo could not complete this sign-in. Please try again.",
    twoFactorTitle: "Two-factor verification",
    twoFactorSubtitle: "Enter the 6-digit code from your authenticator app.",
    twoFactorSubmit: "Verify and sign in",
    twoFactorRefused: "That code is not right. Check it and try again.",
    unavailableReturn: "The place you were heading to is not available right now.",
    submit: "Sign in",
    google: "Continue with Google",
    github: "Continue with GitHub",
    forgot: "Forgot password",
    register: "Create one",
};

/** ---------- secrets: read locally, never written to artifacts ---------- */
const readRuntimeFile = (name) => fs.readFileSync(path.join(RUNTIME_FILES, name), "utf8").trim();
const PG_USER = readRuntimeFile("postgres-user.txt");
const PG_PASSWORD = readRuntimeFile("postgres-password.txt");
const ENCRYPTION_KEY = readRuntimeFile("encryption-key.key");
const KC_ADMIN = JSON.parse(readRuntimeFile("keycloak-admin.json"));

/** ---------- helpers ---------- */
const b32encode = (buf) => {
    const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let s = "", bits = 0, v = 0;
    for (const b of buf) { v = (v << 8) | b; bits += 8; while (bits >= 5) { s += A[(v >>> (bits - 5)) & 31]; bits -= 5; } }
    if (bits) s += A[(v << (5 - bits)) & 31];
    return s;
};
const b32decode = (s) => {
    const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = 0, v = 0; const out = [];
    for (const c of s.replace(/=+$/, "")) { const i = A.indexOf(c); if (i < 0) continue; v = (v << 5) | i; bits += 5; if (bits >= 8) { out.push((v >>> (bits - 8)) & 255); bits -= 8; } }
    return Buffer.from(out);
};
const totp = (secret, periodOffset = 0) => {
    const key = b32decode(secret);
    const t = Math.floor(Date.now() / 30000) + periodOffset;
    const buf = Buffer.alloc(8); buf.writeBigUInt64BE(BigInt(t));
    const h = crypto.createHmac("sha1", key).update(buf).digest();
    const o = h[h.length - 1] & 15;
    return String((h.readUInt32BE(o) & 0x7fffffff) % 1e6).padStart(6, "0");
};

/** The backend's own AES-256-GCM custody shape ({iv,authTag,ciphertext}, PBKDF2-derived key). */
const encryptForBackend = (plaintext) => {
    const derived = crypto.pbkdf2Sync(ENCRYPTION_KEY, "nivo-backend:aes-256-gcm", 100000, 32, "sha256");
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", derived, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    return JSON.stringify({
        iv: iv.toString("base64"),
        authTag: cipher.getAuthTag().toString("base64"),
        ciphertext: ciphertext.toString("base64"),
    });
};

const sql = (statement) => execFileSync("docker", [
    "exec", "-e", `PGPASSWORD=${PG_PASSWORD}`, PG_CONTAINER,
    "psql", "-U", PG_USER, "-d", "nivo", "-tAc", statement,
]).toString().trim();

const kcToken = async () => {
    const r = await fetch(`${KC}/realms/master/protocol/openid-connect/token`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ grant_type: "password", client_id: "admin-cli", username: KC_ADMIN.username, password: KC_ADMIN.password }),
    });
    const j = await r.json();
    if (!j.access_token) throw new Error(`keycloak admin token refused: ${JSON.stringify(j).slice(0, 200)}`);
    return j.access_token;
};
const kc = async (token, p, init = {}) => {
    const r = await fetch(`${KC}/admin/realms/${REALM}${p}`, { ...init, headers: { authorization: `Bearer ${token}`, "content-type": "application/json" } });
    if (r.status === 204) return null;
    if (!r.ok) throw new Error(`keycloak ${init.method ?? "GET"} ${p} -> ${r.status}`);
    return r.json().catch(() => null);
};
// Admin tokens live ~60s; the walk runs longer, so every call fetches a fresh one.
const kcSessions = async (_token, sub) => (await kc(await kcToken(), `/users/${sub}/sessions`)) ?? [];

const gql = async (operationName, query, variables, cookies = "") => {
    const r = await fetch(`${API}/graphql`, {
        method: "POST",
        headers: { "content-type": "application/json", ...(cookies ? { cookie: cookies } : {}) },
        body: JSON.stringify({ operationName, query, variables }),
    });
    return { status: r.status, body: await r.json().catch(() => null), setCookie: r.headers.getSetCookie?.() ?? [] };
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const waitFor = async (fn, timeoutMs, label) => {
    const start = Date.now();
    for (;;) {
        const v = await fn().catch(() => null);
        if (v) return v;
        if (Date.now() - start > timeoutMs) throw new Error(`timed out waiting for ${label}`);
        await sleep(1000);
    }
};

/** Count GraphQL mutations a context sends, per operationName. */
const attachOpCounter = (context) => {
    const counts = {};
    context.on("request", (req) => {
        if (req.method() !== "POST" || !req.url().includes("/graphql")) return;
        const op = (req.postData() ?? "").match(/mutation\s+(\w+)/)?.[1] ?? (req.postData() ?? "").match(/query\s+(\w+)/)?.[1] ?? "unknown";
        counts[op] = (counts[op] ?? 0) + 1;
    });
    return counts;
};

/** Capture GraphQL response bodies for one operation name (for evidence). */
const armResponseCapture = (context, opName) => {
    const store = { last: null, all: [] };
    context.on("response", async (res) => {
        if (res.request().method() !== "POST" || !res.url().includes("/graphql")) return;
        if (!(res.request().postData() ?? "").includes(opName)) return;
        try { store.last = await res.json(); store.all.push(store.last); } catch { store.last = "<nonjson>"; }
    });
    return store;
};

const refreshCookie = async (context) => (await context.cookies(API)).find((c) => c.name === "nivo_refresh_token");
const cookieSessionState = (cookie) => {
    try { return JSON.parse(Buffer.from(cookie.value.split(".")[1], "base64url").toString()).session_state ?? null; }
    catch { return null; }
};

/** ---------- run state ---------- */
const result = {
    schema: "uat/run-result@1",
    id: RUN_ID,
    nodeId: "uat.login.password-sign-in",
    startedAt: new Date().toISOString(),
    web: WEB, api: API, keycloak: KC,
    probes: [],
    revisions: {},
    steps: [],
    cleanup: {},
    media: { screens: [], videos: [] },
    notes: [],
};
const note = (s) => { result.notes.push(s); };
const stepRecord = (order, name, status, observations) => {
    result.steps.push({ order, name, status, observations });
    fs.mkdirSync(RECORD_DIR, { recursive: true });
    fs.writeFileSync(path.join(RECORD_DIR, "run-result.json"), JSON.stringify(result, null, 2));
};
const guardStep = async (order, name, fn) => {
    try { await fn(); }
    catch (e) {
        await Promise.resolve();
        stepRecord(order, name, "fail", [String(e?.message ?? e).slice(0, 500)]);
        throw e;
    }
};
const shot = async (page, name) => {
    const file = `${name}.png`;
    await page.screenshot({ path: path.join(SCREENS, file), fullPage: true });
    result.media.screens.push(`screens/${file}`);
};

const account = { email: null, password: null, kcSub: null, userId: null, totpSecret: null, requestIdentity: null };

const seedAccount = async (token) => {
    account.email = `uat.signin.holder.${Date.now().toString(36)}@nivo.local`;
    account.password = `Uat-Holder-${crypto.randomBytes(6).toString("hex")}9K`;
    account.totpSecret = b32encode(crypto.randomBytes(20));
    const created = await fetch(`${KC}/admin/realms/${REALM}/users`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({
            username: account.email, email: account.email, enabled: true, emailVerified: true,
            credentials: [{ type: "password", value: account.password, temporary: false }],
        }),
    });
    if (created.status !== 201) throw new Error(`keycloak user create -> ${created.status}`);
    account.kcSub = created.headers.get("location").split("/").pop();
    const row = sql(`INSERT INTO users (keycloak_user_id, username, email, normalized_email, provider, status, two_factor_enabled, two_factor_secret) VALUES ('${account.kcSub}','${account.email}','${account.email}','${account.email}',NULL,'active',true,'${encryptForBackend(account.totpSecret)}') RETURNING id`);
    account.userId = row.split("\n")[0].trim();
    result.account = { email: account.email, kcSub: account.kcSub, userId: account.userId };
};

const cleanupAccount = async () => {
    const c = result.cleanup;
    try {
        const token = await kcToken();
        if (account.kcSub) {
            await kc(token, `/users/${account.kcSub}/logout`, { method: "POST" }).catch((e) => { c.kcLogoutError = String(e.message); });
            const r = await fetch(`${KC}/admin/realms/${REALM}/users/${account.kcSub}`, { method: "DELETE", headers: { authorization: `Bearer ${token}` } });
            c.kcUserDeleted = r.status === 204 || r.status === 404;
            const rb = await fetch(`${KC}/admin/realms/${REALM}/users/${account.kcSub}`, { headers: { authorization: `Bearer ${token}` } });
            c.kcUserReadBack = rb.status;
        }
        if (account.userId || account.email) {
            c.dbRowsDeleted = Number(sql(`DELETE FROM users WHERE normalized_email='${account.email}'`).match(/DELETE (\d+)/)?.[1] ?? "0");
            c.dbReadBack = sql(`SELECT count(*) FROM users WHERE normalized_email='${account.email}'`);
        }
        c.sessionsReadBack = account.kcSub === null ? "user-deleted" : "n/a";
        c.verified = c.kcUserDeleted === true && c.kcUserReadBack === 404 && c.dbReadBack === "0";
    } catch (e) {
        c.error = String(e.message);
        c.verified = false;
    }
};

/** Browser step helpers */
const openLogin = async (page, suffix = "") => {
    await page.goto(`${WEB}/en/authentication${suffix}`, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: COPY.submit }).waitFor({ timeout: 20000 });
};
const fillCredentials = async (page, email, password) => {
    await page.locator("#authentication-email").fill(email);
    await page.locator("#authentication-password").fill(password);
};
const submitSignIn = async (page) => page.getByRole("button", { name: COPY.submit, exact: true }).click();
const enterFactor = async (page) => {
    await page.locator("#authentication-code").waitFor({ timeout: 20000 });
    await page.locator("#authentication-code").fill(totp(account.totpSecret));
    await page.getByRole("button", { name: COPY.twoFactorSubmit }).click();
    // One retry across a TOTP step boundary, then leave the refusal to the step's own assertions.
    try {
        await page.getByText(COPY.twoFactorRefused).waitFor({ timeout: 2500 });
        await page.locator("#authentication-code").fill(totp(account.totpSecret, 1));
        await page.getByRole("button", { name: COPY.twoFactorSubmit }).click();
    } catch { /* accepted path */ }
};
const signInThroughUi = async (page, { returnTo = null, landing = "**/en/overview**" } = {}) => {
    await openLogin(page, returnTo === null ? "" : `?returnTo=${encodeURIComponent(returnTo)}`);
    await fillCredentials(page, account.email, account.password);
    await submitSignIn(page);
    await enterFactor(page);
    await page.waitForURL(landing, { timeout: 20000 });
};

test.describe("uat.login.password-sign-in — served journey", () => {
    let browser;
    const contexts = [];
    const videos = [];
    let kcAdminToken = null;
    let afterB, baselineSessions, ctxA, ctxB, ctxI, ctxN, ctxR, ctxU, opsA, opsI, opsR, pageA, pageB, pageI, pageN, pageR, pageU, refreshCapA, refreshCapI, verifyCapR;
    const newContext = async (name) => {
        const context = await browser.newContext({ recordVideo: { dir: VIDEOS, size: { width: 1280, height: 800 } } });
        contexts.push({ name, context });
        return context;
    };

    test.beforeAll(async () => {
        test.setTimeout(300_000);
        fs.mkdirSync(SCREENS, { recursive: true });
        fs.mkdirSync(VIDEOS, { recursive: true });
        browser = await chromium.launch({ headless: true });
        /* ---------- environment + revision proof ---------- */
        const webProbe = await fetch(`${WEB}/en/authentication`).then((r) => r.status).catch(() => 0);
        result.probes.push({ id: "web-ready", target: `${WEB}/en/authentication`, expect: 200, actual: webProbe });
        const apiProbe = await fetch(`${API}/health/live`).then((r) => r.status).catch(() => 0);
        result.probes.push({ id: "api-ready", target: `${API}/health/live`, expect: 200, actual: apiProbe });
        const gqlProbe = await gql("__probe", "query { __typename }");
        result.probes.push({ id: "api-graphql", target: `${API}/graphql`, expect: 200, actual: gqlProbe.status });
        if (apiProbe !== 200) note(`declared api-ready probe ${API}/health/live answered ${apiProbe}; GraphQL probe answered ${gqlProbe.status} — environment record names a route the app does not serve`);
        try {
            result.revisions.fe = execFileSync("git", ["-C", path.resolve(HERE, ".."), "rev-parse", "HEAD"]).toString().trim();
            result.revisions.be = execFileSync("git", ["-C", BACKEND_ROOT, "rev-parse", "HEAD"]).toString().trim();
        } catch (e) { note(`revision capture failed: ${e.message}`); }

        /* ---------- provider toggle must restore before the walk ---------- */
        execFileSync("docker", ["stop", KC_CONTAINER]);
        const downProbe = await fetch(`${KC}/realms/${REALM}`).then(() => false).catch(() => true);
        result.probes.push({ id: "provider-toggle-down", expect: "unreachable", actual: downProbe ? "unreachable" : "reachable" });
        execFileSync("docker", ["start", KC_CONTAINER]);
        await waitFor(async () => (await fetch(`${KC}/realms/${REALM}`)).ok, 180000, "keycloak realm back");
        result.probes.push({ id: "provider-toggle-restored", expect: 200, actual: 200 });

        kcAdminToken = await kcToken();
        await seedAccount(kcAdminToken);
        stepRecord(0, "provision", "done", [`seeded account-holder ${account.email} (kcSub ${account.kcSub}, users.id ${account.userId}) with password credential and enrolled TOTP`]);
        baselineSessions = (await kcSessions(kcAdminToken, account.kcSub)).map((s) => s.id);
        note(`baseline keycloak sessions after provisioning: ${JSON.stringify(baselineSessions)}`);

        /* ---------- step 1 ---------- */
        ctxA = await newContext("a-main");
        opsA = attachOpCounter(ctxA);
        pageA = await ctxA.newPage();
        videos.push({ page: pageA, name: "a-main" });
    });
    test.afterAll(async () => {
        /* ---------- cleanup, always ---------- */
        try { await cleanupAccount(); } catch (e) { result.cleanup.verified = false; result.cleanup.error = `cleanup failed: ${e.message}`; }
        for (const { context } of contexts) await context.close().catch(() => {});
        await browser.close().catch(() => {});
        for (const v of videos) {
            try {
                const video = v.page.video();
                if (video) { const p = await video.path(); const target = path.join(VIDEOS, `${v.name}.webm`); if (path.resolve(p) !== path.resolve(target)) fs.renameSync(p, target); result.media.videos.push(`videos/${v.name}.webm`); }
            } catch (e) { note(`video for ${v.name}: ${e.message}`); }
        }
        result.finishedAt = new Date().toISOString();
        fs.writeFileSync(path.join(RECORD_DIR, "run-result.json"), JSON.stringify(result, null, 2));
    });
        test("step-01 clean render, keyboard reachability, no session", () => guardStep(1, "clean render", async () => {
            await openLogin(pageA);
            // Tab-walk from the top of the document; the five choices and both credential
            // fields must appear in the real keyboard order, not merely be focusable by script.
            await pageA.evaluate(() => document.body.focus());
            const reached = [];
            for (let i = 0; i < 40; i++) {
                await pageA.keyboard.press("Tab");
                const d = await pageA.evaluate(() => {
                    const e = document.activeElement;
                    return e && e !== document.body ? `${e.id}#${(e.textContent ?? "").trim().slice(0, 48)}` : null;
                });
                if (d === null || reached.includes(d)) break;
                reached.push(d);
            }
            const walk = reached.join(" | ");
            for (const wanted of ["authentication-email", "authentication-password", COPY.google, COPY.github, COPY.forgot, COPY.register, COPY.submit]) {
                expect(walk.includes(wanted), `${wanted} is not in the keyboard order: ${walk}`).toBeTruthy();
            }
            expect(await refreshCookie(ctxA), "refresh cookie present before any sign-in").toBe(undefined);
            const storage = await pageA.evaluate(() => ({ ls: Object.keys(localStorage).filter((k) => /nivo|session|token/i.test(k)), ss: Object.keys(sessionStorage).filter((k) => /nivo|session|token/i.test(k)) }));
            expect(storage.ls.length + storage.ss.length, `session storage leaks auth state: ${JSON.stringify(storage)}`).toBe(0);
            await shot(pageA, "step01-login");
            stepRecord(1, "clean render", "pass", ["password form + Google + GitHub + register + recovery all rendered and focusable", "no refresh cookie, no session storage keys"]);
        }));
        test("step-02 malformed input then wrong credentials, other session untouched", async () => {
            /* ---------- step 2 precondition: second browser holds a session ---------- */
            ctxB = await newContext("b-other-browser");
            pageB = await ctxB.newPage();
            videos.push({ page: pageB, name: "b-other-browser" });
            await signInThroughUi(pageB);
            afterB = await kcSessions(kcAdminToken, account.kcSub);
            await refreshCookie(ctxB);
            note(`browser B signed in; sessions now ${JSON.stringify(afterB.map((s) => s.id))}`);
            await shot(pageB, "step02-precondition-b-landed");
            await guardStep(2, "malformed + refused", async () => {
                await openLogin(pageA);
                await fillCredentials(pageA, "not-an-email", "x");
                await submitSignIn(pageA);
                await pageA.waitForTimeout(1200);
                // The email control is a native type=email: the correction lands on the field
                // itself (validity state + focus), before any request leaves the page.
                const emailState = await pageA.evaluate(() => {
                    const e = document.getElementById("authentication-email");
                    return { valid: e.checkValidity(), message: e.validationMessage, focused: document.activeElement === e };
                });
                expect(emailState.valid, "malformed email was accepted as valid").toBe(false);
                expect(emailState.message, "the email field carried no correction").not.toBe("");
                expect(opsA.SignIn ?? 0, "malformed submit issued a SignIn request").toBe(0);
                await shot(pageA, "step02a-malformed-field-errors");
    
                await fillCredentials(pageA, account.email, "Wr0ng-Pass-9876");
                await submitSignIn(pageA);
                const refusal = pageA.getByText(COPY.refused);
                await refusal.waitFor({ timeout: 15000 });
                const bodyText = await pageA.evaluate(() => document.body.innerText);
                for (const banned of ["attempt", "lock", "locked", "exist", "registered", "remaining", "throttle"]) {
                    expect(new RegExp(`\\b${banned}`, "i").test(bodyText.replace(COPY.refused, "")), `refusal leaks '${banned}'`).toBe(false);
                }
                expect(await refreshCookie(ctxA), "refused attempt set a refresh cookie").toBe(undefined);
                expect((await kcSessions(kcAdminToken, account.kcSub)).length, "refusal created a keycloak session").toBe(afterB.length);
                await shot(pageA, "step02b-generic-refusal");
    
                // The other browser's session is held in this tab's memory; prove it was untouched
                // without a reload (a reload goes through refreshSession, a different contract).
                expect(pageB.url(), `other browser moved: ${pageB.url()}`).toMatch(/\/en\/overview/);
                const bAuthForm = await pageB.locator("#authentication-email").count();
                expect(bAuthForm, "other browser fell back to the sign-in form").toBe(0);
                await shot(pageB, "step02c-other-browser-still-signed-in");
                stepRecord(2, "malformed + refused", "pass", ["client-side field correction before any request", "one generic refusal, no account facts", "no session for A; B unaffected"]);
            });
        });
        test("step-03 valid credentials + enrolled second factor", async () => {
            /* ---------- step 3 ---------- */
            await guardStep(3, "factor proof", async () => {
                await fillCredentials(pageA, account.email, account.password);
                await submitSignIn(pageA);
                await pageA.locator("#authentication-code").waitFor({ timeout: 20000 });
                expect(await refreshCookie(ctxA), "session released before factor proof").toBe(undefined);
                const midCount = (await kcSessions(kcAdminToken, account.kcSub)).length;
                await shot(pageA, "step03a-factor-challenge");
                await enterFactor(pageA);
                await pageA.waitForURL("**/en/overview**", { timeout: 20000 });
                const cookie = await refreshCookie(ctxA);
                expect(cookie, "no refresh custody after full proof").toBeTruthy();
                const endCount = (await kcSessions(kcAdminToken, account.kcSub)).length;
                await shot(pageA, "step03b-landed-default");
                stepRecord(3, "factor proof", "pass", [`session withheld until factor (mid sessions=${midCount}, end=${endCount})`, `landed ${pageA.url()}`]);
            });
        });
        test("step-04 exactly one usable session on the default landing", async () => {
            /* ---------- step 4 ---------- */
            await guardStep(4, "one session", async () => {
                const cookie = await refreshCookie(ctxA);
                const state = cookieSessionState(cookie);
                const sessions = await kcSessions(kcAdminToken, account.kcSub);
                expect(state, "refresh cookie carries no session_state").toBeTruthy();
                expect(sessions.some((s) => s.id === state), `browser custody ${state} is not a live keycloak session`).toBeTruthy();
                expect(pageA.url(), `did not land on the default surface: ${pageA.url()}`).toMatch(/\/en\/overview/);
                stepRecord(4, "one session", "pass", [`context A custody binds keycloak session ${state}`, `live sessions total ${sessions.length}`]);
            });
        });
        test("step-05 raced submits cannot bypass factor or add a session", async () => {
            /* ---------- step 5 ---------- */
            ctxR = await newContext("r-race");
            opsR = attachOpCounter(ctxR);
            verifyCapR = armResponseCapture(ctxR, "VerifyTwoFactor");
            pageR = await ctxR.newPage();
            videos.push({ page: pageR, name: "r-race" });
            await guardStep(5, "raced submit", async () => {
                const before = (await kcSessions(kcAdminToken, account.kcSub)).length;
                await openLogin(pageR);
                await fillCredentials(pageR, account.email, account.password);
                await Promise.allSettled([submitSignIn(pageR), pageR.keyboard.press("Enter"), submitSignIn(pageR)]);
                await pageR.locator("#authentication-code").waitFor({ timeout: 20000 });
                const custodyBeforeFactor = await refreshCookie(ctxR);
                await pageR.locator("#authentication-code").fill(totp(account.totpSecret));
                await Promise.allSettled([pageR.getByRole("button", { name: COPY.twoFactorSubmit }).click(), pageR.keyboard.press("Enter")]);
                await pageR.waitForURL("**/en/overview**", { timeout: 20000 });
                await pageR.waitForLoadState("networkidle").catch(() => {});
                const after = (await kcSessions(kcAdminToken, account.kcSub)).length;
                const verifyOutcomes = verifyCapR.all.map((r) => JSON.stringify(r?.data?.verifyTwoFactor).slice(0, 200));
                const custody = await refreshCookie(ctxR);
                await shot(pageR, "step05-raced-submit");
                const obs = [
                    `raced credential submit issued SignIn=${opsR.SignIn ?? 0} request(s)`,
                    `custody before factor proof: ${custodyBeforeFactor ? "issued (BYPASS)" : "withheld"}`,
                    `raced factor submit issued VerifyTwoFactor=${opsR.VerifyTwoFactor ?? 0}; answers: ${JSON.stringify(verifyOutcomes)}`,
                    `keycloak sessions ${before} -> ${after}`,
                    `final custody: ${custody ? "one refresh credential bound to session_state " + cookieSessionState(custody) : "none"}`,
                ];
                const ok = (opsR.SignIn ?? 0) === 1
                    && custodyBeforeFactor === undefined
                    && custody !== undefined
                    && after - before <= 2;
                stepRecord(5, "raced submit", ok ? "pass" : "fail", obs);
                expect(ok, "raced submits bypassed the factor gate or added an effective session").toBeTruthy();
            });
        });
        test("step-06 revisit while signed in reuses session to valid destination", async () => {
            /* ---------- step 6 ---------- */
            refreshCapA = armResponseCapture(ctxA, "RefreshSession");
            await guardStep(6, "session reuse", async () => {
                const before = (await kcSessions(kcAdminToken, account.kcSub)).length;
                const signInsBefore = opsA.SignIn ?? 0;
                await pageA.goto(`${WEB}/en/authentication?returnTo=${encodeURIComponent("/agentos/workspaces")}`, { waitUntil: "domcontentloaded" });
                const landed = await pageA.waitForURL("**/en/agentos/workspaces**", { timeout: 25000 }).then(() => true).catch(() => false);
                await shot(pageA, "step06-revisited-valid-return");
                const refreshAnswer = refreshCapA.last?.data?.refreshSession?.data;
                const sessionsAfter = (await kcSessions(kcAdminToken, account.kcSub)).length;
                const obs = [
                    `revisit of /authentication?returnTo=/agentos/workspaces landed on the destination: ${landed} (final url ${pageA.url()})`,
                    `refreshSession answered: ${JSON.stringify(refreshAnswer).slice(0, 240)}`,
                    `new signIn calls during revisit: ${(opsA.SignIn ?? 0) - signInsBefore}, verifyTwoFactor: ${opsA.VerifyTwoFactor ?? 0}`,
                    `keycloak sessions ${before} -> ${sessionsAfter}`,
                ];
                const ok = landed === true && (opsA.SignIn ?? 0) === signInsBefore && (opsA.VerifyTwoFactor ?? 0) === 0 && sessionsAfter === before;
                stepRecord(6, "session reuse", ok ? "pass" : "fail", obs);
                expect(ok, "the current session did not continue to the validated destination without another challenge").toBeTruthy();
            });
        });
        test("step-07 interrupted result is recovered, not re-proved", async () => {
            /* ---------- step 7 ---------- */
            ctxI = await newContext("i-interrupted");
            opsI = attachOpCounter(ctxI);
            refreshCapI = armResponseCapture(ctxI, "RefreshSession");
            pageI = await ctxI.newPage();
            videos.push({ page: pageI, name: "i-interrupted" });
            await guardStep(7, "interrupted recovery", async () => {
                const before = (await kcSessions(kcAdminToken, account.kcSub)).length;
                await openLogin(pageI);
                await fillCredentials(pageI, account.email, account.password);
                await submitSignIn(pageI);
                await pageI.locator("#authentication-code").waitFor({ timeout: 20000 });
                // Interrupt after the factor proof is answered but before the result is shown.
                const verifyAnswered = pageI.waitForResponse(
                    (r) => r.url().startsWith(`${API}/graphql`) && (r.request().postData() ?? "").includes("VerifyTwoFactor"),
                    { timeout: 20000 });
                await pageI.locator("#authentication-code").fill(totp(account.totpSecret));
                await pageI.getByRole("button", { name: COPY.twoFactorSubmit }).click();
                await verifyAnswered;
                await pageI.reload({ waitUntil: "domcontentloaded" });
                const cookieAfterInterrupt = await refreshCookie(ctxI);
                await pageI.goto(`${WEB}/en/authentication`, { waitUntil: "domcontentloaded" });
                const recovered = await pageI.waitForURL("**/en/overview**", { timeout: 25000 }).then(() => true).catch(() => false);
                const sessionsAfter = (await kcSessions(kcAdminToken, account.kcSub)).length;
                await shot(pageI, "step07-recovered-without-proof");
                const obs = [
                    `custody after interrupt: ${cookieAfterInterrupt ? "kept" : "lost"}`,
                    `revisit landed without new proof: ${recovered} (final url ${pageI.url()})`,
                    `refreshSession answered: ${JSON.stringify(refreshCapI.last?.data?.refreshSession?.data).slice(0, 240)}`,
                    `signIn calls on this context: ${opsI.SignIn ?? 0}, keycloak sessions ${before} -> ${sessionsAfter}`,
                ];
                const ok = cookieAfterInterrupt !== undefined && recovered === true && (opsI.SignIn ?? 0) === 1 && sessionsAfter - before <= 2;
                stepRecord(7, "interrupted recovery", ok ? "pass" : "fail", obs);
                expect(ok, "the established session was not recovered without a second proof").toBeTruthy();
            });
        });
        test("step-08 authority outage reports undecided and the same attempt resolves", async () => {
            /* ---------- step 8 ---------- */
            ctxU = await newContext("u-undecided");
            pageU = await ctxU.newPage();
            videos.push({ page: pageU, name: "u-undecided" });
            await guardStep(8, "authority unavailable", async () => {
                execFileSync("docker", ["stop", KC_CONTAINER]);
                await waitFor(async () => !(await fetch(`${KC}/realms/${REALM}`).then((r) => r.ok).catch(() => false)), 30000, "keycloak unreachable");
                await pageU.goto(`${WEB}/en/authentication`, { waitUntil: "domcontentloaded" });
                await pageU.getByRole("heading", { name: COPY.submit }).waitFor({ timeout: 45000 });
                await fillCredentials(pageU, account.email, account.password);
                await submitSignIn(pageU);
                await pageU.getByText(COPY.undecided).waitFor({ timeout: 30000 });
                const refused = await pageU.getByText(COPY.refused).count();
                expect(refused, "authority outage was presented as a credential refusal").toBe(0);
                expect(await refreshCookie(ctxU), "undecided attempt issued custody").toBe(undefined);
                await shot(pageU, "step08a-undecided-during-outage");
    
                execFileSync("docker", ["start", KC_CONTAINER]);
                // Realm 200 is not enough: the token endpoint itself must answer (any status but
                // connection refused), else the retried grant sees a second undecided.
                await waitFor(async () => fetch(`${KC}/realms/${REALM}/protocol/openid-connect/token`, { method: "POST", body: "grant_type=x", headers: { "content-type": "application/x-www-form-urlencoded" } }).then((r) => r.status > 0).catch(() => false), 180000, "keycloak token endpoint back");
                kcAdminToken = await kcToken();
                await submitSignIn(pageU);
                await pageU.locator("#authentication-code").waitFor({ timeout: 30000 });
                await shot(pageU, "step08b-same-attempt-resolved");
                await enterFactor(pageU);
                await pageU.waitForURL("**/en/overview**", { timeout: 20000 });
                stepRecord(8, "authority unavailable", "pass", ["undecided message shown, no refusal text, no custody", "retry on the same mounted attempt reached the factor gate and completed"]);
            });
        });
        test("step-09 unavailable destination falls back to default with reasonless notice", async () => {
            /* ---------- step 9 ---------- */
            ctxN = await newContext("n-unavailable-return");
            pageN = await ctxN.newPage();
            videos.push({ page: pageN, name: "n-unavailable-return" });
            await guardStep(9, "unavailable destination", async () => {
                const asked = "/agentos/../agentos/uat-missing-wing";
                await openLogin(pageN, `?returnTo=${encodeURIComponent(asked)}`);
                await fillCredentials(pageN, account.email, account.password);
                await submitSignIn(pageN);
                await enterFactor(pageN);
                await pageN.waitForURL((u) => !u.pathname.includes("/authentication"), { timeout: 25000 });
                const landed = pageN.url();
                await pageN.waitForLoadState("networkidle").catch(() => {});
                const notice = await pageN.getByText(COPY.unavailableReturn).count();
                await shot(pageN, "step09-unavailable-destination-landing");
                const landedOnDefault = new URL(landed).pathname.replace(/\/+$/, "") === "/en/overview";
                const followed = landed.includes("uat-missing-wing");
                stepRecord(9, "unavailable destination", landedOnDefault && notice > 0 && !followed ? "pass" : "fail", [
                    `asked ${asked}`, `landed ${landed}`, `reasonless notice rendered: ${notice > 0}`,
                    followed ? "the unavailable destination was followed" : "the unavailable destination was not followed",
                ]);
                expect(followed, `the unavailable destination was followed: ${landed}`).toBe(false);
                expect(landedOnDefault, `session did not land on the default surface: ${landed}`).toBe(true);
                expect(notice > 0, "no reasonless unavailability notice on the landing").toBeTruthy();
            });
        });
});
