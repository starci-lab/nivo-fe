import { render, within } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

type ProviderProbeProps = {
    readonly children: ReactNode
}

vi.mock("@heroui/react", () => ({
    I18nProvider: ({ children }: ProviderProbeProps) => <>{children}</>,
}))
vi.mock("next-themes", () => ({
    ThemeProvider: ({ children }: ProviderProbeProps) => <div data-testid="theme-provider">{children}</div>,
}))
vi.mock("@nivo/ui", () => ({
    NivoGrammarTheme: ({ children }: ProviderProbeProps) => <div data-testid="grammar-theme">{children}</div>,
}))
vi.mock("@/modules/auth/session", () => ({
    SessionProvider: ({ children }: ProviderProbeProps) => <>{children}</>,
}))

import { ConsoleLocaleLayoutBase } from "./component"

const providersTree = () => (
    <ConsoleLocaleLayoutBase props={{ locale: "en", messages: {}, timeZone: "UTC" }}>
        <main>workspace</main>
    </ConsoleLocaleLayoutBase>
)
const renderProviders = () => render(providersTree())

describe("ConsoleLocaleLayoutBase", () => {
    it("keeps the family theme boundary inside the shared theme provider", () => {
        const stacked = renderProviders()
        const stackedProviders = within(stacked.container)
        expect(stackedProviders.getByTestId("theme-provider")).toContainElement(
            stackedProviders.getByTestId("grammar-theme"),
        )
        expect(stackedProviders.getByTestId("grammar-theme")).toContainElement(stackedProviders.getByText("workspace"))
    })
})
