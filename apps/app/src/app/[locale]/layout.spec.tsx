import { render, screen } from "@testing-library/react"
import { NextIntlClientProvider, useTranslations } from "next-intl"
import { describe, expect, it, vi } from "vitest"
import enMessages from "@/messages/en.json"
import { generateStaticParams, viewport } from "./layout"

vi.mock("next/font/google", () => ({ Open_Sans: () => ({ style: { fontFamily: "Open Sans" } }) }))

const AppDescription = () => {
    const t = useTranslations("app")
    return <main>{t("description")}</main>
}

describe("locale root layout", () => {
    it("publishes the shipped locales and viewport", () => {
        expect(generateStaticParams()).toEqual([{ locale: "vi" }, { locale: "en" }])
        expect(viewport).toEqual({ width: "device-width", initialScale: 1 })
    })

    it("renders the real English catalogue inside the locale provider", () => {
        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <AppDescription />
            </NextIntlClientProvider>,
        )

        expect(screen.getByRole("main")).toHaveTextContent(enMessages.app.description)
    })
})
