import { expect, test } from "@playwright/test"
import { mkdirSync } from "node:fs"
import { resolve } from "node:path"

type RouteContract = {
    readonly path: string
    readonly artifactName: string
}

type ViewportContract = {
    readonly name: string
    readonly width: number
    readonly height: number
}

const ROUTES: ReadonlyArray<RouteContract> = [
    { path: "/", artifactName: "home" },
    { path: "/nivo-os", artifactName: "nivo-os" },
    { path: "/system-of-responsibility", artifactName: "system-of-responsibility" },
    { path: "/applications", artifactName: "applications" },
    { path: "/pricing", artifactName: "pricing" },
    { path: "/trust", artifactName: "trust" },
    { path: "/ecosystem", artifactName: "ecosystem" },
    { path: "/ideas", artifactName: "ideas" },
    { path: "/ideas/responsibility-before-agent", artifactName: "ideas-detail" },
    { path: "/company", artifactName: "company" },
    { path: "/contact", artifactName: "contact" },
]

const VIEWPORTS: ReadonlyArray<ViewportContract> = [
    { name: "desktop", width: 1440, height: 900 },
    { name: "tablet", width: 834, height: 1112 },
    { name: "mobile", width: 390, height: 844 },
]

const DOCUMENTED_SECTIONS = [
    { path: "/", selectors: ["#home-hero-title", "#home-today-title", "#home-relevance-title", "#home-operating-model-title", "#home-commercial-title", "#home-next-path-title"] },
    { path: "/nivo-os", selectors: ["#product-page-title", "#responsibility-center", "#operating-model", "#capability-model", "#nivo-os-today", "#trust-bridge", "#target-architecture", "#next-path"] },
    { path: "/system-of-responsibility", selectors: ["#product-page-title", "#definition", "#core-anatomy", "#task-vs-responsibility", "#evidence", "#nivo-os-current", "#trust-bridge", "#next-path"] },
    { path: "/applications", selectors: ["#need-selector", "#current-focus", "#by-need", "#by-role", "#by-context", "#truth-evidence", "#next-path"] },
    { path: "/pricing", selectors: ["#product-page-title", "#discover", "#available-now", "#pro-decision", "#comparison", "#what-you-buy", "#usage-resources", "#growth", "#service-support", "#faq", "#start-right"] },
    { path: "/trust", selectors: ["#future-worth-earning", "#trust-starts-small", "#human-ai-governance", "#evidence-before-scale", "#transformation-journey", "#what-becomes-possible", "#truth-before-promise"] },
    { path: "/ecosystem", selectors: ["#why-ecosystem", "#value-exchange", "#actors", "#relationship-growth", "#ecosystem-proof", "#choose-path"] },
    { path: "/ideas", selectors: ["#knowledge-identity", "#featured", "#by-type", "#curated", "#by-topic", "#continue-learning"] },
    { path: "/company", selectors: ["#nivo-is", "#nivo-today", "#provenance", "#mission", "#vision", "#philosophy", "#values", "#leadership", "#company-next-path"] },
    { path: "/contact", selectors: ["#choose-intent", "#intent-router", "#adaptive-form", "#contact-next-step", "#direct-paths"] },
] as const

const EVIDENCE_ROOT = resolve(
    "D:/Repositories/nivo-backend/.starciworkdraft/evidence/review.verify/renders",
)

mkdirSync(EVIDENCE_ROOT, { recursive: true })

test.describe("NIVO.VN delivery baselines", () => {
    for (const route of ROUTES) {
        for (const viewport of VIEWPORTS) {
            test(`${route.path} renders at ${viewport.name}`, async ({ page }) => {
                await page.setViewportSize(viewport)
                const response = await page.goto(route.path, { waitUntil: "networkidle" })

                expect(response?.status()).toBe(200)
                await expect(page.locator("main")).toBeVisible()
                await expect(page.locator("h1")).toHaveCount(1)
                await expect(page.locator("footer")).toBeVisible()

                const horizontalOverflow = await page.evaluate(() =>
                    document.documentElement.scrollWidth > document.documentElement.clientWidth,
                )
                expect(horizontalOverflow).toBe(false)

                await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" })
                await page.screenshot({
                    fullPage: true,
                    path: resolve(EVIDENCE_ROOT, `${route.artifactName}--${viewport.name}.png`),
                })
            })
        }
    }

    test("the homepage renders the approved art-direction v18 mascot", async ({ page }) => {
        await page.goto("/")
        await expect(
            page.locator('img[src*="nivo-unicorn-responsibility-transparent-v18.png"]'),
        ).toBeVisible()

        const heroStage = page.locator(".home-hero__stage")
        const heroBounds = await heroStage.boundingBox()
        expect(heroBounds).not.toBeNull()
        await page.mouse.move(
            heroBounds!.x + heroBounds!.width * 0.72,
            heroBounds!.y + heroBounds!.height * 0.3,
        )
        const spotlight = await heroStage.evaluate((element) => ({
            x: element.style.getPropertyValue("--hero-glow-x"),
            y: element.style.getPropertyValue("--hero-glow-y"),
            opacity: element.style.getPropertyValue("--hero-glow-opacity"),
        }))
        expect(parseFloat(spotlight.x)).toBeGreaterThanOrEqual(68)
        expect(parseFloat(spotlight.x)).toBeLessThanOrEqual(76)
        expect(parseFloat(spotlight.y)).toBeGreaterThanOrEqual(26)
        expect(parseFloat(spotlight.y)).toBeLessThanOrEqual(35)
        expect(spotlight.opacity).toBe("0.92")

        const audit = await page.evaluate(() => {
            const actions = Array.from(document.querySelectorAll<HTMLElement>("a, button"))
            const operatingNodes = Array.from(
                document.querySelectorAll<HTMLElement>(".home-operating-model .process-flow__node"),
            )
            const nodeCenters = operatingNodes.map((node) => {
                const bounds = node.getBoundingClientRect()
                return bounds.y + bounds.height / 2
            })
            const surfaceLightness = (selector: string) => {
                const element = document.querySelector<HTMLElement>(selector)
                if (!element) {
                    return null
                }

                const backgroundColor = getComputedStyle(element).backgroundColor
                if (backgroundColor.startsWith("oklab(")) {
                    const lightness = backgroundColor.match(/[\d.]+/)?.[0]
                    return lightness ? Number(lightness) * 255 : null
                }

                const channels = backgroundColor.match(/[\d.]+/g)?.slice(0, 3)
                if (!channels || channels.length !== 3) {
                    return null
                }

                return channels.reduce((total, channel) => total + Number(channel), 0) / 3
            }

            return {
                arrowActions: actions.filter((action) => action.textContent?.includes("→")).length,
                tooSmallActions: actions.filter((action) => {
                    const bounds = action.getBoundingClientRect()
                    return bounds.width > 0 && bounds.height > 0 && (bounds.width < 44 || bounds.height < 44)
                }).length,
                sectionOrder: Array.from(document.querySelectorAll<HTMLElement>("main > section")).map(
                    (section) => section.className,
                ),
                heroStageBackground: getComputedStyle(
                    document.querySelector<HTMLElement>(".home-hero__stage")!,
                ).backgroundImage,
                surfaceLightness: {
                    relevance: surfaceLightness(".home-relevance"),
                    operatingModel: surfaceLightness(".home-operating-model"),
                    commercial: surfaceLightness(".home-commercial"),
                    trust: surfaceLightness(".home-trust"),
                    nextPath: surfaceLightness(".home-next-path"),
                    footer: surfaceLightness(".site-footer"),
                },
                borderedGrammarCards: Array.from(
                    document.querySelectorAll<HTMLElement>("[data-grammar-surface-card]"),
                ).filter((card) => getComputedStyle(card).borderTopWidth !== "0px").length,
                borderedRoleFigures: Array.from(
                    document.querySelectorAll<HTMLElement>(".home-operating-model__visuals figure"),
                ).filter((figure) => getComputedStyle(figure).borderTopWidth !== "0px").length,
                nodeCenterDrift: Math.max(...nodeCenters) - Math.min(...nodeCenters),
            }
        })

        expect(audit).toEqual({
            arrowActions: 0,
            tooSmallActions: 0,
            sectionOrder: [
                "home-hero",
                "home-relevance",
                "home-operating-model",
                "home-commercial",
                "home-trust",
                "home-next-path",
            ],
            heroStageBackground: expect.stringContaining("rgba(255, 225, 216"),
            surfaceLightness: {
                relevance: expect.any(Number),
                operatingModel: expect.any(Number),
                commercial: expect.any(Number),
                trust: expect.any(Number),
                nextPath: expect.any(Number),
                footer: expect.any(Number),
            },
            borderedGrammarCards: 0,
            borderedRoleFigures: 0,
            nodeCenterDrift: 0,
        })

        expect(audit.surfaceLightness.relevance).toBeLessThan(80)
        expect(audit.surfaceLightness.operatingModel).toBeGreaterThan(220)
        expect(audit.surfaceLightness.commercial).toBeGreaterThan(200)
        expect(audit.surfaceLightness.trust).toBeLessThan(80)
        expect(audit.surfaceLightness.nextPath).toBeGreaterThan(220)
        expect(audit.surfaceLightness.footer).toBeLessThan(80)
    })
})

test.describe("NIVO.VN customer journeys", () => {
    test("understands NIVO then opens NIVO OS", async ({ page }) => {
        await page.goto("/")
        await page.getByRole("link", { name: "Tìm hiểu NIVO OS" }).first().click()
        await expect(page).toHaveURL(/\/nivo-os$/)
        await expect(page.locator("h1")).toContainText("HỆ ĐIỀU HÀNH KINH DOANH AI-NATIVE")
    })

    test("moves from the brand gateway to business applications", async ({ page }) => {
        await page.goto("/")
        await page.getByRole("link", { name: "Khám phá giải pháp" }).first().click()
        await expect(page).toHaveURL(/\/applications$/)
    })

    test("evaluates the commercial route without requiring contact", async ({ page }) => {
        await page.goto("/pricing")
        await expect(page.getByRole("button", { name: /Dùng thử NIVO Start 7 ngày/i }).first()).toBeDisabled()
        await expect(page.locator("h1")).toBeVisible()
    })

    test("connects responsibility to earned trust", async ({ page }) => {
        await page.goto("/system-of-responsibility")
        await page.getByRole("link", { name: "Tìm hiểu Trust" }).first().click()
        await expect(page).toHaveURL(/\/trust$/)
    })

    test("moves from ecosystem context to the relationship router", async ({ page }) => {
        await page.goto("/ecosystem")
        await page.getByRole("link", { name: /Liên hệ|Trao đổi/i }).first().click()
        await expect(page).toHaveURL(/\/contact/)
    })

    test("discovers and reads a governed idea", async ({ page }) => {
        await page.goto("/ideas")
        await page.locator('a[href^="/ideas/"]').first().click()
        await expect(page).toHaveURL(/\/ideas\/.+/)
        await expect(page.locator("#idea-body")).toBeVisible()
    })
})

test("all 73 documented fixed-page section markers are rendered", async ({ page }) => {
    expect(DOCUMENTED_SECTIONS.reduce((total, route) => total + route.selectors.length, 0)).toBe(73)

    for (const route of DOCUMENTED_SECTIONS) {
        await page.goto(route.path)
        for (const selector of route.selectors) {
            await expect(page.locator(selector), `${route.path} must render ${selector}`).toHaveCount(1)
        }
    }
})
