/**
 * Expert app — the served-locale proof for the repo-debt verification.
 *
 * WHAT THIS PROVES, AND HOW. The canon refactor moved the expert app's i18n into modules/i18n
 * (with createNextIntlPlugin repointed in next.config.ts), the screen into features/pages, the
 * chrome into features/layouts, and kept the locale in the path. The built @nivo/expert
 * production server is fetched as a client would: the bare path serves the default locale, /vi
 * serves Vietnamese, and a locale outside the vocabulary is refused 404.
 *
 * PORT OWNERSHIP. the `node --test` e2e specs run the files in parallel: smoke.e2e-spec.ts
 * reserves NIVO_FE_E2E_PORT (default 13067), collab.e2e-spec.ts takes +1, landing.e2e-spec.ts takes +2,
 * so this spec takes +3 (NIVO_FE_E2E_EXPERT_PORT overrides; NIVO_FE_E2E_EXPERT_URL drives a
 * server the caller owns).
 */
import assert from "node:assert/strict";
import process from "node:process";
import test from "node:test";
import { serveNextApp } from "./serve-next.mjs";

const PORT = process.env.NIVO_FE_E2E_EXPERT_PORT ?? String(Number(process.env.NIVO_FE_E2E_PORT ?? 13067) + 3);
const EXTERNAL_URL = process.env.NIVO_FE_E2E_EXPERT_URL?.replace(/\/$/u, "");

test("the built expert app serves both declared locales and refuses an unknown one", async (t) => {
    const server = EXTERNAL_URL ? { baseUrl: EXTERNAL_URL, stop: () => {} } : await serveNextApp({ appDir: "apps/expert", port: PORT });
    const baseUrl = server.baseUrl;
    try {
        await t.test("GET / serves the default-locale document", async () => {
            const response = await fetch(`${baseUrl}/`, { redirect: "manual" });
            const body = await response.text();
            assert.equal(response.status, 200, `/ returned ${response.status}${response.headers.get("location") ? ` -> ${response.headers.get("location")}` : ""}`);
            assert.ok(body.includes('lang="en"'), "the document does not declare lang=en");
            assert.ok(body.includes("Học viện Mộc"), "the academy identity is missing");
            assert.ok(body.includes("Try a free class"), "the default-locale hero copy is missing");
        });

        await t.test("GET /vi serves the Vietnamese document", async () => {
            const response = await fetch(`${baseUrl}/vi`);
            const body = await response.text();
            assert.equal(response.status, 200, `/vi returned ${response.status}`);
            assert.ok(body.includes('lang="vi"'), "the document does not declare lang=vi");
            assert.ok(body.includes("Học viện Mộc"), "the academy identity is missing");
            assert.ok(body.includes("Học thử miễn phí"), "the Vietnamese hero copy is missing");
        });

        await t.test("GET /fr is refused with 404 — the locale stays a closed vocabulary", async () => {
            const response = await fetch(`${baseUrl}/fr`, { redirect: "manual" });
            assert.equal(response.status, 404, `/fr returned ${response.status}${response.headers.get("location") ? ` -> ${response.headers.get("location")}` : ""}`);
        });
    } finally {
        server.stop();
    }
});
