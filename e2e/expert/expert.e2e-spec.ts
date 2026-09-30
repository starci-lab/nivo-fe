/**
 * Expert app — the served-locale proof for the repo-debt verification.
 *
 * WHAT THIS PROVES, AND HOW. The canon refactor moved the expert app's i18n into modules/i18n
 * (with createNextIntlPlugin repointed in next.config.ts), the screen into features/pages, the
 * chrome into features/layouts, and kept the locale in the path. The built @nivo/expert
 * production server is fetched as a client would: the bare path serves the default locale, /vi
 * serves Vietnamese, and a locale outside the vocabulary is refused 404.
 *
 * PORT OWNERSHIP. the e2e specs keep distinct ports: smoke.e2e-spec.ts
 * reserves NIVO_FE_E2E_PORT (default 13067), collab.e2e-spec.ts takes +1, landing.e2e-spec.ts takes +2,
 * so this spec takes +3 (NIVO_FE_E2E_EXPERT_PORT overrides; NIVO_FE_E2E_EXPERT_URL drives a
 * server the caller owns).
 */
import process from "node:process"
import { expect, test } from "@playwright/test"
import { serveNextApp, type ServedApp } from "../support/serve-next"

const PORT = process.env.NIVO_FE_E2E_EXPERT_PORT ?? String(Number(process.env.NIVO_FE_E2E_PORT ?? 13067) + 3)
const EXTERNAL_URL = process.env.NIVO_FE_E2E_EXPERT_URL?.replace(/\/$/u, "")

test.describe("the built expert app serves both declared locales and refuses an unknown one", () => {
    let server: ServedApp
    let baseUrl: string
    test.beforeAll(async () => {
        server = EXTERNAL_URL
            ? { baseUrl: EXTERNAL_URL, stop: () => {} }
            : await serveNextApp({ appDir: "apps/expert", port: PORT })
        baseUrl = server.baseUrl
    })
    test.afterAll(async () => {
        server?.stop()
    })
    test("GET / serves the default-locale document", async () => {
        const response = await fetch(`${baseUrl}/`, { redirect: "manual" })
        const body = await response.text()
        expect(
            response.status,
            `/ returned ${response.status}${response.headers.get("location") ? ` -> ${response.headers.get("location")}` : ""}`,
        ).toBe(200)
        expect(body.includes('lang="en"'), "the document does not declare lang=en").toBeTruthy()
        expect(body.includes("Học viện Mộc"), "the academy identity is missing").toBeTruthy()
        expect(body.includes("Try a free class"), "the default-locale hero copy is missing").toBeTruthy()
    })

    test("GET /vi serves the Vietnamese document", async () => {
        const response = await fetch(`${baseUrl}/vi`)
        const body = await response.text()
        expect(response.status, `/vi returned ${response.status}`).toBe(200)
        expect(body.includes('lang="vi"'), "the document does not declare lang=vi").toBeTruthy()
        expect(body.includes("Học viện Mộc"), "the academy identity is missing").toBeTruthy()
        expect(body.includes("Học thử miễn phí"), "the Vietnamese hero copy is missing").toBeTruthy()
    })

    test("GET /fr is refused with 404 — the locale stays a closed vocabulary", async () => {
        const response = await fetch(`${baseUrl}/fr`, { redirect: "manual" })
        expect(
            response.status,
            `/fr returned ${response.status}${response.headers.get("location") ? ` -> ${response.headers.get("location")}` : ""}`,
        ).toBe(404)
    })
})
