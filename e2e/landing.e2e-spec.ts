/**
 * Landing app — the served-route proof for the repo-debt verification.
 *
 * WHAT THIS PROVES, AND HOW. The canon refactor moved every landing route's drawing into
 * features/pages + features/layouts while behaviour stays invariant, so each public route of the
 * built @nivo/landing production server is fetched once as a client would and asserted on the
 * served document: HTTP 200, one main landmark, one h1, the route's own rendered marker, the
 * unknown-slug recovery surface, a malformed contact intent answered with the safe state, and a
 * route nothing publishes answering 404.
 *
 * PORT OWNERSHIP. the e2e specs keep distinct ports: smoke.e2e-spec.ts
 * reserves NIVO_FE_E2E_PORT (default 13067) and collab.e2e-spec.ts takes +1, so this spec takes +2
 * (NIVO_FE_E2E_LANDING_PORT overrides; NIVO_FE_E2E_LANDING_URL drives a server the caller owns).
 */
import process from "node:process";
import { expect, test } from "@playwright/test";
import { serveNextApp } from "./serve-next";

const PORT = process.env.NIVO_FE_E2E_LANDING_PORT ?? String(Number(process.env.NIVO_FE_E2E_PORT ?? 13067) + 2);
const EXTERNAL_URL = process.env.NIVO_FE_E2E_LANDING_URL?.replace(/\/$/u, "");

const FIXED_ROUTES = [
    { path: "/", marker: 'id="hero-title"' },
    { path: "/nivo-os", marker: "canonical-page" },
    { path: "/system-of-responsibility", marker: "canonical-page" },
    { path: "/applications", marker: "canonical-page" },
    { path: "/pricing", marker: "canonical-page" },
    { path: "/ideas", marker: "canonical-page" },
    { path: "/ecosystem", marker: "canonical-page" },
    { path: "/company", marker: "canonical-page" },
    { path: "/trust", marker: "canonical-page" },
    { path: "/contact", marker: "canonical-page" },
];

const countH1 = (body) => (body.match(/<h1[\s>]/g) ?? []).length;

test.describe("the built landing app serves every public route as a complete document", () => {
    let server;
    let baseUrl;
    test.beforeAll(async () => {
        server = EXTERNAL_URL ? { baseUrl: EXTERNAL_URL, stop: () => {} } : await serveNextApp({ appDir: "apps/landing", port: PORT });
        baseUrl = server.baseUrl;
    });
    test.afterAll(async () => {
        server?.stop();
    });
    for (const route of FIXED_ROUTES) {
        test(`GET ${route.path} answers its document`, async () => {
            const response = await fetch(`${baseUrl}${route.path}`);
            const body = await response.text();
            expect(response.status, `${route.path} returned ${response.status}`).toBe(200);
            expect(body, `${route.path} rendered no main landmark`).toMatch(/<main[\s>]/);
            expect(countH1(body), `${route.path} rendered ${countH1(body)} h1 elements`).toBe(1);
            expect(body.includes(route.marker), `${route.path} is missing marker ${route.marker}`).toBeTruthy();
        });
    }

    test("GET /ideas/<unknown slug> answers the declared recovery surface", async () => {
        const response = await fetch(`${baseUrl}/ideas/no-such-idea`);
        const body = await response.text();
        expect(response.status).toBe(200);
        expect(body.includes("canonical-page"), "the recovery surface lost its shell").toBeTruthy();
        expect(body.includes("This idea is not ready for publication."), "the unavailable state is missing").toBeTruthy();
    });

    test("GET /contact?intent=<malformed> keeps the safe intent-selection state", async () => {
        const response = await fetch(`${baseUrl}/contact?intent=no-such-intent`);
        const body = await response.text();
        expect(response.status).toBe(200);
        expect(body.includes("canonical-page"), "the contact surface lost its shell").toBeTruthy();
        expect(body.includes("Choose an intent"), "the intent chooser is missing").toBeTruthy();
    });

    test("GET /no-such-route is refused with 404", async () => {
        const response = await fetch(`${baseUrl}/no-such-route`);
        expect(response.status).toBe(404);
    });
});
