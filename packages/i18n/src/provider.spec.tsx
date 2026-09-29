import { render, screen } from "@testing-library/react"
import { useTranslations } from "next-intl"
import { describe, expect, it } from "vitest"
import { I18nProvider } from "./provider"

const CatalogMessage = () => {
    const t = useTranslations("page")
    return <p>{t("title")}</p>
}

describe("I18nProvider", () => {
    it("provides a locale and the catalog to client components", () => {
        render(
            <I18nProvider locale="en" messages={{ page: { title: "Shared catalog" } }}>
                <CatalogMessage />
            </I18nProvider>,
        )

        expect(screen.getByText("Shared catalog")).toBeTruthy()
    })
})
