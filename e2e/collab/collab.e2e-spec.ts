/**
 * Collab Office/Tasks — the served-product journey spec (cut collab-fe-surface-r2 3/3).
 *
 * WHAT THIS PROVES, AND HOW. The unit specs own the surface's behavior at the seam;
 * this spec owns the served product: it boots the built @nivo/app production server
 * and a GraphQL fixture that publishes the `contract.collab.chat` rev 5 read shapes
 * (both in e2e/support), then drives a real headless browser through the four customer
 * journeys (first-open, assign-work, approve-safe-action, tasks-overview) and asserts
 * what the member actually sees and what the boundary actually received.
 *
 * THE FIXTURE IS A STAND-IN, NOT THE BACKEND. It is the same published-shape fixture
 * the implementation's runtime evidence used (`apps/app` bakes
 * `NEXT_PUBLIC_CORE_API_URL`'s default `http://localhost:3068/graphql`, so the fixture
 * answers on that port). Live Socket.IO revalidation stays an unavailable fixture path:
 * the app's reads are authoritative and each accepted command re-reads them, which is
 * exactly what this spec follows - a write is proven by the read that follows it.
 *
 * PORT OWNERSHIP. the e2e specs keep distinct ports and
 * `e2e/smoke.e2e-spec.ts` already reserves `NIVO_FE_E2E_PORT` (default 13067), so this
 * spec takes the next port and mirrors the smoke runner's env contract
 * (`NIVO_FE_E2E_COLLAB_PORT`, `NIVO_FE_E2E_COLLAB_URL` to drive an already-running
 * server). Each journey runs once per viewport project (see playwright.config.ts).
 */
import process from "node:process"
import { chromium, expect, test, type Browser } from "@playwright/test"
import { serveNextApp, type ServedApp } from "../support/serve-next"
import { sleep, waitFor } from "../support/poll"
import { APPROVAL, HUMAN_MINH, MODULE_ACC, OFFICE_PATH, TASK_DONE_ID } from "../support/collab-contract"
import {
    interRef,
    officeReady,
    openSurface,
    rowIds,
    startCollabFixture,
    type CollabFixture,
} from "../support/collab-fixture"

const APP_PORT = process.env.NIVO_FE_E2E_COLLAB_PORT ?? String(Number(process.env.NIVO_FE_E2E_PORT ?? 13067) + 1)
const EXTERNAL_URL = process.env.NIVO_FE_E2E_COLLAB_URL?.replace(/\/$/u, "")
const BASE = EXTERNAL_URL ?? `http://127.0.0.1:${APP_PORT}`
const GRAPHQL_PORT = Number(process.env.NIVO_FE_E2E_GRAPHQL_PORT ?? 3068)
const DEFAULT_VIEWPORT = { width: 1440, height: 900 }

test.describe("collab Office/Tasks — the four member journeys against the served app", () => {
    let fixture: CollabFixture
    let served: ServedApp | null
    let browser: Browser
    test.beforeAll(async () => {
        fixture = await startCollabFixture(GRAPHQL_PORT, BASE)
        served = EXTERNAL_URL
            ? null
            : await serveNextApp({ appDir: "apps/app", port: APP_PORT, probePath: OFFICE_PATH, timeoutMs: 60_000 })
        browser = await chromium.launch({ headless: true, args: [`--host-resolver-rules=MAP localhost 127.0.0.1`] })
    })
    test.afterAll(async () => {
        await browser.close()
        served?.stop()
        await fixture.close()
    })
    const open = async (mode: string, url = OFFICE_PATH) => {
        fixture.setMode(mode)
        return openSurface(browser, BASE, url, test.info().project.use.viewport ?? DEFAULT_VIEWPORT)
    }
    test("first open: the Owner lands in Office with the roster, the conversation and the invite form", async () => {
        const { context, page, pageErrors } = await open("office")
        try {
            await officeReady(page)
            expect(await page.getByRole("tab", { name: "Office" }).getAttribute("aria-selected")).toBe("true")
            /* The /chat destination is the layout's, and it is the active one. */
            expect(await page.locator('[data-key="chat"]').getAttribute("aria-selected")).toBe("true")
            expect(
                await page
                    .locator('[data-key="chat"]')
                    .innerText()
                    .then((text) => text.includes("Trò chuyện")),
            ).toBe(true)
            expect((await page.getByText("Support", { exact: true }).count()) > 0).toBe(true)
            await page.getByText("Con người (3)", { exact: true }).waitFor()
            await page.getByText("Module đã thuê (3)", { exact: true }).waitFor()
            for (const name of ["An Nguyen", "Minh", "Huy", "Sales", "Accounting", "Chatbot"]) {
                await page.getByText(name, { exact: true }).first().waitFor()
            }
            /* The invite control is offered to the Owner and names the closed V1 role set. */
            await page.locator("#collab-invite-email").waitFor()
            expect(
                await page
                    .locator('input[name="invite-role"]')
                    .evaluateAll((nodes) =>
                        nodes.map((node) => (node instanceof HTMLInputElement ? node.value : null)),
                    ),
            ).toStrictEqual(["owner", "manager", "staff"])
            await page.getByRole("button", { name: "Gửi lời mời" }).waitFor()
            /* The conversation is the authorized page the boundary served. */
            await page.locator("#collab-msg-msg-1").waitFor()
            await page.locator("#collab-msg-msg-2").waitFor()
            expect(
                await page
                    .locator("#collab-msg-msg-1")
                    .innerText()
                    .then((text) => text.includes("@sales")),
            ).toBe(true)
            await page.locator("#collab-composer").waitFor()
            expect(pageErrors).toStrictEqual([])
        } finally {
            await context.close()
        }
    })

    test("first open: Office stays readable with no module hired and invents no placeholder", async () => {
        const { context, page } = await open("no-module")
        try {
            await officeReady(page)
            await page.getByText("Con người (3)", { exact: true }).waitFor()
            await page.getByText("Module đã thuê (0)", { exact: true }).waitFor()
            await page.getByText("Chưa có module nào được thuê.", { exact: true }).waitFor()
            await page
                .getByText("Chưa có thành viên nào.", { exact: true })
                .waitFor({ state: "detached" })
                .catch(() => {})
            expect(await page.locator("[data-member-id]").count()).toBe(3)
            await page.getByRole("button", { name: "Gửi lời mời" }).waitFor()
        } finally {
            await context.close()
        }
    })

    test("first open: the Owner invites by email, and the same email a second time is reported as existing", async () => {
        const { context, page } = await open("office")
        try {
            await officeReady(page)
            await page.locator("#collab-invite-email").fill("mai@congty.vn")
            await page.locator('input[name="invite-role"][value="manager"]').check()
            await page.getByRole("button", { name: "Gửi lời mời" }).click()
            await waitFor(
                async () =>
                    (await page.getByText("Đã ghi nhận lời mời tới mai@congty.vn.", { exact: true }).count()) > 0,
                "the recorded-invitation notice",
            )
            /* A created invitation clears the field; the role choice stays. */
            expect(await page.locator("#collab-invite-email").inputValue()).toBe("")
            expect(await page.locator('input[name="invite-role"][value="manager"]').isChecked()).toBe(true)
            const sent = fixture.collabOps("inviteByEmail")
            expect(sent.length >= 1).toBe(true)
            expect(Object.keys(sent.at(-1)?.input ?? {}).sort()).toStrictEqual(["email", "role"])
            expect(sent.at(-1)?.input).toStrictEqual({ email: "mai@congty.vn", role: "manager" })

            await page.locator("#collab-invite-email").fill("mai@congty.vn")
            await page.getByRole("button", { name: "Gửi lời mời" }).click()
            await waitFor(
                async () =>
                    (await page.getByText("Email này đã có lời mời hoặc đã là thành viên.", { exact: true }).count()) >
                    0,
                "the duplicate-invitation notice",
            )
        } finally {
            await context.close()
        }
    })

    test("first open: a Staff member is offered no invite control", async () => {
        const { context, page } = await open("office-staff")
        try {
            await officeReady(page)
            await page.getByText("Con người (3)", { exact: true }).waitFor()
            expect(await page.locator("#collab-invite-email").count()).toBe(0)
            expect(await page.getByRole("button", { name: "Gửi lời mời" }).count()).toBe(0)
            expect(await page.getByText("Mời thành viên", { exact: true }).count()).toBe(0)
        } finally {
            await context.close()
        }
    })

    test("first open: the invited person accepts and then reads Office, which the invitation screen never disclosed", async () => {
        const { context, page } = await open("accept", `${OFFICE_PATH}&invitation=inv-1&role=staff`)
        try {
            await page.getByRole("button", { name: "Chấp nhận lời mời" }).waitFor()
            await page.getByText("Lời mời vào workspace", { exact: true }).waitFor()
            await page.getByText("Vai trò được mời: Staff", { exact: true }).waitFor()
            /* Acceptance mode withholds Office entirely: no roster, no conversation, no tabs. */
            expect(await page.getByRole("tab", { name: "Office" }).count()).toBe(0)
            expect(await page.locator("#collab-msg-msg-1").count()).toBe(0)
            await page.getByRole("button", { name: "Chấp nhận lời mời" }).click()
            await officeReady(page)
            expect((await page.locator("#collab-msg-msg-1").count()) > 0).toBe(true)
            expect(await page.getByRole("button", { name: "Chấp nhận lời mời" }).count()).toBe(0)
            expect(fixture.collabOps("acceptInvitation").length).toBe(1)
        } finally {
            await context.close()
        }
    })

    test("approve-safe-action: the notice leads to the waiting card, and the Owner's button press decides it once", async () => {
        const { context, page } = await open("approval")
        try {
            await officeReady(page)
            const card = page.locator(`#collab-approval-${APPROVAL.approvalId}`)
            await card.waitFor()
            await page.getByText("Cần phê duyệt", { exact: true }).waitFor()
            await page.getByText("Đang chờ quyết định", { exact: true }).waitFor()
            await card.getByText(APPROVAL.action, { exact: true }).waitFor()
            await card.getByText(APPROVAL.consequence, { exact: true }).waitFor()
            await card.getByText("T-550E • Sales", { exact: false }).waitFor()
            await page.getByText("Chỉ Owner hoặc Manager được quyết định", { exact: true }).waitFor()
            const approve = card.getByRole("button", { name: "Phê duyệt" })
            const reject = card.getByRole("button", { name: "Từ chối" })
            expect(await approve.count()).toBe(1)
            expect(await reject.count()).toBe(1)
            expect(await approve.isDisabled()).toBe(false)
            /* No typed approval path exists: the card's two buttons are the whole control. */
            expect(await card.getByRole("button").count()).toBe(2)

            /* The notice for this turn follows to the same waiting card. */
            const noticeCard = page.locator("[data-grammar-surface-card]").filter({ hasText: "Cần bạn xử lý" })
            await noticeCard.getByText("Một hành động đang chờ bạn quyết định", { exact: true }).waitFor()
            await noticeCard.getByRole("button", { name: "Mở", exact: true }).click()
            await waitFor(async () => fixture.collabOps("openNotice").length === 1, "the openNotice call")
            expect(fixture.collabOps("openNotice")[0].input.noticeId).toBe("ntc-1")
            await card.waitFor()

            await approve.click()
            await waitFor(
                async () => fixture.collabOps("pressApprovalButton").length === 1,
                "the pressApprovalButton call",
            )
            expect(fixture.collabOps("pressApprovalButton")[0].input).toStrictEqual({
                approvalId: "appr-1",
                button: "approve",
            })
            await waitFor(
                async () => (await card.getByRole("button", { name: "Phê duyệt" }).count()) === 0,
                "the decided card to drop its action buttons",
            )
            expect(await card.getByRole("button", { name: "Từ chối" }).count()).toBe(0)
            await page.getByText("Cần phê duyệt", { exact: true }).waitFor({ state: "detached" })
            await card.getByText("Hoàn thành", { exact: true }).waitFor()
            await card.getByText(/An Nguyen đã quyết định lúc/u).waitFor()
        } finally {
            await context.close()
        }
    })

    test("approve-safe-action: a Staff member reads the same card with inactive decision controls", async () => {
        const { context, page } = await open("approval-staff")
        try {
            await officeReady(page)
            const card = page.locator(`#collab-approval-${APPROVAL.approvalId}`)
            await card.waitFor()
            /* Every current Office member reads the card's content. */
            await card.getByText(APPROVAL.action, { exact: true }).waitFor()
            await card.getByText(APPROVAL.consequence, { exact: true }).waitFor()
            await card
                .getByText(/An Nguyen/u)
                .first()
                .waitFor()
            const approve = card.getByRole("button", { name: "Phê duyệt" })
            const reject = card.getByRole("button", { name: "Từ chối" })
            expect(await approve.count()).toBe(1)
            expect(await approve.isDisabled()).toBe(true)
            expect(await reject.isDisabled()).toBe(true)
            /* The card stays waiting: no press reached the boundary. */
            await page.getByText("Đang chờ quyết định", { exact: true }).waitFor()
            expect(fixture.collabOps("pressApprovalButton").length).toBe(0)
            expect(await page.locator("#collab-invite-email").count()).toBe(0)
        } finally {
            await context.close()
        }
    })

    test("assign-work: an addressed request becomes one task shown by the Office card and the Tasks row, and the row opens its card", async () => {
        const { context, page } = await open("office")
        try {
            await officeReady(page)
            await page.locator("#collab-composer").fill("@Sales Bạn gửi giúp mình báo cáo doanh số tuần này nhé")
            await page.getByRole("button", { name: "Gửi", exact: true }).click()
            await waitFor(async () => (await rowIds(page).count()) === 1, "the task receipt card")
            const post = fixture.collabOps("postMessage")
            expect(post.length).toBe(1)
            expect(post[0].input.moduleName).toBe("Sales")
            /* A committed post clears the draft. */
            await waitFor(
                async () => (await page.locator("#collab-composer").inputValue()) === "",
                "the composer to clear",
            )
            const taskId = await rowIds(page).first().getAttribute("id")
            const cardText = await rowIds(page).first().innerText()
            expect(cardText.includes("Sales")).toBe(true)
            expect(cardText.includes("Người yêu cầu: An Nguyen")).toBe(true)
            expect(cardText.includes("Người được giao: Minh")).toBe(true)

            await page.getByRole("tab", { name: "Tasks" }).click()
            await waitFor(
                async () => (await page.getByRole("tab", { name: "Tasks" }).getAttribute("aria-selected")) === "true",
                "the Tasks tab to become selected",
            )
            await waitFor(
                async () => (await page.locator(`#${taskId}`).innerText()).includes("Mô-đun: Sales"),
                "the same task as a Tasks row",
            )
            const rowText = await page.locator(`#${taskId}`).innerText()
            expect(rowText.includes("Người yêu cầu: An Nguyen")).toBe(true)
            expect(rowText.includes("Mô-đun: Sales")).toBe(true)
            expect(rowText.includes("Đang làm")).toBe(true)
            /* One identity, one object: the Office card and the Tasks row are the same task id. */
            const ref = interRef(rowText)
            expect(cardText.includes(ref)).toBe(true)

            await page.locator(`#${taskId}`).getByRole("button", { name: "Mở trong Office" }).click()
            await waitFor(
                async () => (await page.getByRole("tab", { name: "Office" }).getAttribute("aria-selected")) === "true",
                "the Office tab to become selected",
            )
            await waitFor(
                async () => (await page.locator(`#${taskId}`).count()) === 1,
                "the Office card after the row jump",
            )
        } finally {
            await context.close()
        }
    })

    test("assign-work: an ordinary message invokes no module, and an unknown name starts no work", async () => {
        const { context, page } = await open("office")
        try {
            await officeReady(page)
            await page.locator("#collab-composer").fill("Chào cả nhà, hôm nay thế nào?")
            await page.getByRole("button", { name: "Gửi", exact: true }).click()
            await waitFor(async () => fixture.collabOps("postMessage").length === 1, "the ordinary post")
            expect(fixture.collabOps("postMessage")[0].input.moduleName).toBe(undefined)
            await waitFor(async () => (await page.locator('[id^="collab-msg-"]').count()) === 3, "the ordinary message")
            await sleep(500)
            /* No module was invoked: no card was raised under the message. */
            expect(await rowIds(page).count()).toBe(0)

            await page.locator("#collab-composer").fill("@KhongCo giúp mình với")
            await page.getByRole("button", { name: "Gửi", exact: true }).click()
            await waitFor(async () => fixture.collabOps("postMessage").length === 2, "the unresolved-address post")
            expect(fixture.collabOps("postMessage")[1].input.moduleName).toBe("KhongCo")
            await page.getByText("Tin nhắn chưa chắc đã được ghi. Kiểm tra rồi gửi lại.", { exact: true }).waitFor()
            await page.getByRole("button", { name: "Kiểm tra và gửi lại" }).waitFor()
            /* The draft is retained and nothing was committed as work. */
            expect(await page.locator("#collab-composer").inputValue()).toBe("@KhongCo giúp mình với")
            expect(await rowIds(page).count()).toBe(0)
            expect(await page.locator('[id^="collab-msg-"]').count()).toBe(3)
        } finally {
            await context.close()
        }
    })

    test("tasks-overview: every row is the Office object, the filters narrow to matching rows and say so when nothing matches", async () => {
        const { context, page } = await open("tasks")
        try {
            await officeReady(page)
            await page.getByRole("tab", { name: "Tasks" }).click()
            await waitFor(async () => (await rowIds(page).count()) === 3, "the three Tasks rows")
            expect((await page.getByText("3 công việc", { exact: true }).count()) > 0).toBe(true)
            await page.getByText("Bộ lọc chỉ thay đổi danh sách hiển thị.", { exact: true }).waitFor()
            const options = await page
                .locator("#collab-filter-person option")
                .evaluateAll((nodes) => nodes.map((node) => node.textContent))
            expect(options).toStrictEqual(["Tất cả", "An Nguyen", "Minh", "Huy"])

            await page.selectOption("#collab-filter-person", HUMAN_MINH.memberId)
            await waitFor(async () => (await rowIds(page).count()) === 2, "the person-filtered rows")
            expect(await page.locator(`#collab-task-${TASK_DONE_ID}`).count()).toBe(0)
            expect((await page.getByText("2 công việc", { exact: true }).count()) > 0).toBe(true)

            await page.selectOption("#collab-filter-module", MODULE_ACC.moduleInstallationId)
            await waitFor(
                async () => (await page.getByText("Không có công việc nào khớp bộ lọc.", { exact: true }).count()) > 0,
                "the empty filter result",
            )
            expect(await rowIds(page).count()).toBe(0)
            /* The filters stay visible and usable after an empty result. */
            expect(await page.locator("#collab-filter-status").isVisible()).toBe(true)

            await page.selectOption("#collab-filter-person", "")
            await waitFor(async () => (await rowIds(page).count()) === 1, "the module-filtered row")
            expect(await page.locator(`#collab-task-${TASK_DONE_ID}`).count()).toBe(1)
            await page.selectOption("#collab-filter-status", "cancelled")
            await waitFor(
                async () => (await page.getByText("Không có công việc nào khớp bộ lọc.", { exact: true }).count()) > 0,
                "the status that matches nothing",
            )
            await page.selectOption("#collab-filter-status", "")
            await waitFor(async () => (await rowIds(page).count()) === 1, "the restored module row")

            await page.getByRole("tab", { name: "Office" }).click()
            await officeReady(page)
            await page.locator("#collab-msg-msg-1").waitFor()
            expect(await rowIds(page).count()).toBe(0)
        } finally {
            await context.close()
        }
    })

    test("reads: a nonmember sees no workspace content, and a revoked read fails visibly and recovers on retry", async () => {
        const denied = await open("denied")
        try {
            await denied.page.getByText("Office không khả dụng", { exact: true }).waitFor()
            await denied.page
                .getByText("Bạn không phải thành viên hiện tại của workspace này.", { exact: true })
                .waitFor()
            await denied.page.getByRole("button", { name: "Về Tổng quan" }).waitFor()
            /* Nothing of the workspace is disclosed, not even the roster or a task row. */
            expect(await denied.page.getByText("Con người (3)", { exact: true }).count()).toBe(0)
            expect(await rowIds(denied.page).count()).toBe(0)
            expect(await denied.page.locator("#collab-msg-msg-1").count()).toBe(0)
            expect(await denied.page.getByRole("tab", { name: "Office" }).count()).toBe(0)
        } finally {
            await denied.context.close()
        }

        const revoked = await open("revoked")
        try {
            await revoked.page.getByText("Không đọc được Office. Thử lại.", { exact: true }).waitFor()
            fixture.setMode("office")
            await revoked.page.getByRole("button", { name: "Thử lại" }).click()
            await officeReady(revoked.page)
            expect((await revoked.page.locator("#collab-msg-msg-1").count()) > 0).toBe(true)
        } finally {
            await revoked.context.close()
        }
    })
})
