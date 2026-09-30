import { render, screen } from "@testing-library/react"
import { useTranslations } from "next-intl"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import enMessages from "@/messages/en.json"
import { MessageScopeView } from "."

const AuthenticationCopy = () => {
    const t = useTranslations("authentication")
    return (
        <main>
            <h1>{t("signIn.title")}</h1>
            <p>{t("signIn.subtitle")}</p>
        </main>
    )
}

const ConsoleCopy = () => {
    const t = useTranslations("console")
    return <main>{t("title")}</main>
}

describe("MessageScope", () => {
    it("renders the selected authentication catalogue in a real provider", async () => {
        const { container } = render(
            <MessageScopeView scope="authentication" messages={enMessages} locale="en">
                <AuthenticationCopy />
            </MessageScopeView>,
        )

        expect(screen.getByRole("heading", { name: enMessages.authentication.signIn.title })).toBeInTheDocument()
        await expectNoA11yViolations(container)
    })

    it("renders the console catalogue through the same scoped provider", () => {
        render(
            <MessageScopeView scope="console" messages={enMessages} locale="en">
                <ConsoleCopy />
            </MessageScopeView>,
        )

        expect(screen.getByRole("main")).toHaveTextContent(enMessages.console.title)
    })
})
